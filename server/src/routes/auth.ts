import { Router } from 'express'
import { pool } from '../config/database'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = Router()
const JWT_SECRET = 'your_jwt_secret'

// 定义用户类型
interface User {
    id: number
    username: string
    role: 'admin' | 'user'
}

// 添加初始用户
router.post('/init', async (req, res) => {
    try {
        // 检查是否已有管理员用户
        const adminCheck = await pool.query('SELECT * FROM users WHERE role = $1', ['admin'])
        if (adminCheck.rows.length > 0) {
            return res.status(400).json({ message: '已存在管理员用户' })
        }

        // 创建管理员用户
        const password = await bcrypt.hash('admin123', 10)
        await pool.query(
            'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
            ['admin', password, 'admin']
        )

        // 创建普通用户
        const userPassword = await bcrypt.hash('user123', 10)
        await pool.query(
            'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
            ['user', userPassword, 'user']
        )

        res.json({ message: '初始用户创建成功' })
    } catch (error) {
        res.status(500).json({ message: '服务器错误' })
    }
})

router.post('/login', async (req, res) => {
    const { username, password } = req.body

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        )

        if (result.rows.length === 0) {
            return res.status(401).json({ message: '用户名或密码错误' })
        }

        const user = result.rows[0]
        const valid = await bcrypt.compare(password, user.password)
        if (!valid) {
            return res.status(401).json({ message: '用户名或密码错误' })
        }

        const token = jwt.sign(
            {
                id: user.id,
                username,
                role: user.role
            } as User,
            JWT_SECRET,
            { expiresIn: '24h' }
        )

        res.json({
            token,
            user: {
                username,
                role: user.role
            }
        })
    } catch (error) {
        res.status(500).json({ message: '服务器错误' })
    }
})

export default router 
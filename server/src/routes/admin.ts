import { Router } from 'express'
import { pool } from '../config/database'
import { authMiddleware, adminMiddleware } from '../middleware/auth'

const router = Router()

// 公共查看路由 - 所有认证用户可访问
router.get('/pois', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pois ORDER BY created_at DESC')
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ message: '服务器错误' })
    }
})

router.get('/polygons', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM polygons ORDER BY created_at DESC')
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ message: '服务器错误' })
    }
})

// 管理员路由 - 所有修改操作都需要管理员权限
const adminRouter = Router()

adminRouter.post('/pois', async (req, res) => {
    const { name, longitude, latitude, height, description } = req.body

    try {
        const result = await pool.query(
            'INSERT INTO pois (name, longitude, latitude, height, description, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [name, longitude, latitude, height, description, req.user!.id]
        )
        res.json({ id: result.rows[0].id, message: '添加成功' })
    } catch (error) {
        res.status(500).json({ message: '服务器错误' })
    }
})

adminRouter.put('/pois/:id', async (req, res) => {
    const { id } = req.params
    const { name, longitude, latitude, height, description, type } = req.body

    try {
        const result = await pool.query(
            'UPDATE pois SET name = $1, longitude = $2, latitude = $3, height = $4, description = $5, type = $6 WHERE id = $7 RETURNING id',
            [name, longitude, latitude, height, description, type, id]
        )
        if (result.rows.length === 0) {
            return res.status(404).json({ message: '未找到该POI' })
        }
        res.json({ message: '更新成功' })
    } catch (error) {
        res.status(500).json({ message: '服务器错误' })
    }
})

adminRouter.delete('/pois/:id', async (req, res) => {
    const { id } = req.params

    try {
        const result = await pool.query('DELETE FROM pois WHERE id = $1 RETURNING id', [id])
        if (result.rows.length === 0) {
            return res.status(404).json({ message: '未找到该POI' })
        }
        res.json({ message: '删除成功' })
    } catch (error) {
        res.status(500).json({ message: '服务器错误' })
    }
})

adminRouter.post('/polygons', async (req, res) => {
    const { name, coordinates, description } = req.body

    try {
        const result = await pool.query(
            'INSERT INTO polygons (name, coordinates, description, created_by) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, coordinates, description, req.user!.id]
        )
        res.json({ id: result.rows[0].id, message: '添加成功' })
    } catch (error) {
        res.status(500).json({ message: '服务器错误' })
    }
})

adminRouter.put('/polygons/:id', async (req, res) => {
    const { id } = req.params
    const { name, coordinates, description } = req.body

    try {
        const result = await pool.query(
            'UPDATE polygons SET name = $1, coordinates = $2, description = $3 WHERE id = $4 RETURNING id',
            [name, coordinates, description, id]
        )
        if (result.rows.length === 0) {
            return res.status(404).json({ message: '未找到该多边形' })
        }
        res.json({ message: '更新成功' })
    } catch (error) {
        res.status(500).json({ message: '服务器错误' })
    }
})

adminRouter.delete('/polygons/:id', async (req, res) => {
    const { id } = req.params

    try {
        const result = await pool.query('DELETE FROM polygons WHERE id = $1 RETURNING id', [id])
        if (result.rows.length === 0) {
            return res.status(404).json({ message: '未找到该多边形' })
        }
        res.json({ message: '删除成功' })
    } catch (error) {
        res.status(500).json({ message: '服务器错误' })
    }
})

// 将管理员路由应用到主路由，并添加权限中间件
router.use('/', authMiddleware, adminMiddleware, adminRouter)

export default router 
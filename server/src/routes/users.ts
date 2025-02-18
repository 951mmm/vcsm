import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { adminMiddleware, authMiddleware } from '../middleware/auth';
import bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto, User } from '../types/user';

const router = Router();

// 获取用户列表（仅管理员可访问）
router.get('/', [authMiddleware, adminMiddleware], async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT id, username, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('获取用户列表失败:', error);
        res.status(500).json({ message: '获取用户列表失败' });
    }
});

// 创建用户（仅管理员可访问）
router.post('/', [authMiddleware, adminMiddleware], async (req: Request, res: Response) => {
    const { username, password, role }: CreateUserDto = req.body;

    try {
        // 检查用户名是否已存在
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE username = $1',
            [username]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: '用户名已存在' });
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 创建用户
        const result = await pool.query(
            'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role, created_at',
            [username, hashedPassword, role]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('创建用户失败:', error);
        res.status(500).json({ message: '创建用户失败' });
    }
});

// 更新用户（仅管理员可访问）
router.put('/:id', [authMiddleware, adminMiddleware], async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates: UpdateUserDto = req.body;

    try {
        // 检查用户是否存在
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE id = $1',
            [id]
        );

        if (existingUser.rows.length === 0) {
            return res.status(404).json({ message: '用户不存在' });
        }

        // 如果更新包含密码，需要加密
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        // 构建更新语句
        const updateFields: string[] = [];
        const values: any[] = [];
        let valueIndex = 1;

        Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined) {
                updateFields.push(`${key} = $${valueIndex}`);
                values.push(value);
                valueIndex++;
            }
        });

        values.push(id);

        // 执行更新
        const result = await pool.query(
            `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${valueIndex} RETURNING id, username, role, created_at`,
            values
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('更新用户失败:', error);
        res.status(500).json({ message: '更新用户失败' });
    }
});

// 删除用户（仅管理员可访问）
router.delete('/:id', [authMiddleware, adminMiddleware], async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // 检查用户是否存在
        const existingUser = await pool.query(
            'SELECT role FROM users WHERE id = $1',
            [id]
        );

        if (existingUser.rows.length === 0) {
            return res.status(404).json({ message: '用户不存在' });
        }

        // 不允许删除最后一个管理员
        if (existingUser.rows[0].role === 'admin') {
            const adminCount = await pool.query(
                'SELECT COUNT(*) FROM users WHERE role = $1',
                ['admin']
            );

            if (adminCount.rows[0].count <= 1) {
                return res.status(400).json({ message: '不能删除最后一个管理员' });
            }
        }

        // 删除用户
        await pool.query('DELETE FROM users WHERE id = $1', [id]);

        res.status(204).send();
    } catch (error) {
        console.error('删除用户失败:', error);
        res.status(500).json({ message: '删除用户失败' });
    }
});

export default router; 
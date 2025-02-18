import express, { Request, Response } from 'express';
import { pool } from '../config/database';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { PoiRealtimeInfo, CreatePoiRealtimeInfoDto, UpdatePoiRealtimeInfoDto } from '../types/poi';

const router = express.Router();

// 获取指定POI的所有实时信息
router.get('/:poiId', async (req: Request, res: Response) => {
    try {
        const poiId = parseInt(req.params.poiId);
        const result = await pool.query(
            'SELECT * FROM poi_realtime_info WHERE poi_id = $1 ORDER BY created_at DESC',
            [poiId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: '获取POI实时信息失败' });
    }
});

// 添加POI实时信息（需要管理员权限）
router.post('/', [authMiddleware, adminMiddleware], async (req: Request, res: Response) => {
    try {
        const { poi_id, name, value }: CreatePoiRealtimeInfoDto = req.body;
        const result = await pool.query(
            'INSERT INTO poi_realtime_info (poi_id, name, value) VALUES ($1, $2, $3) RETURNING *',
            [poi_id, name, value]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: '添加POI实时信息失败' });
    }
});

// 更新POI实时信息（需要管理员权限）
router.put('/:id', [authMiddleware, adminMiddleware], async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const updates: UpdatePoiRealtimeInfoDto = req.body;

        const setClause = Object.keys(updates)
            .map((key, index) => `${key} = $${index + 2}`)
            .join(', ');

        const values = Object.values(updates);
        const result = await pool.query(
            `UPDATE poi_realtime_info SET ${setClause} WHERE id = $1 RETURNING *`,
            [id, ...values]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '未找到指定的POI实时信息' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: '更新POI实时信息失败' });
    }
});

// 删除POI实时信息（需要管理员权限）
router.delete('/:id', [authMiddleware, adminMiddleware], async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const result = await pool.query(
            'DELETE FROM poi_realtime_info WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '未找到指定的POI实时信息' });
        }

        res.json({ message: '删除成功' });
    } catch (error) {
        res.status(500).json({ error: '删除POI实时信息失败' });
    }
});

export default router; 
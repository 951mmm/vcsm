import { Router } from 'express'
import { MAP_CONFIG } from '../config'
import { authMiddleware } from '../middleware/auth'
import { pool } from '../config/database'

const router = Router()

router.get('/config', authMiddleware, (req, res) => {
    res.json({
        locations: MAP_CONFIG.locations
    })
})

// 添加获取 POI 列表的接口
router.get('/pois', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pois ORDER BY created_at DESC')
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ message: '获取POI列表失败' })
    }
})

export default router 
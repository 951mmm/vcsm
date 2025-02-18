import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = 'your_jwt_secret'

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({ message: '未提供认证令牌' })
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as Express.User
        req.user = decoded
        next()
    } catch (error) {
        res.status(401).json({ message: '无效的认证令牌' })
    }
}

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: '需要管理员权限' })
    }
    next()
} 
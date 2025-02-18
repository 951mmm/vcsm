import { Request } from 'express'

declare global {
    namespace Express {
        // JWT 用户信息接口
        interface User {
            id: number
            username: string
            role: 'admin' | 'user'
            iat?: number
            exp?: number
        }

        // 扩展 Request 接口以包含用户信息
        interface Request {
            user?: User
        }
    }
}

// 这个导出是必需的，使这个文件被视为一个模块
export { } 
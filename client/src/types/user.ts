// 用户角色类型
export type UserRole = 'admin' | 'user'

// 用户基本信息
export interface User {
    id: number
    username: string
    role: UserRole
    created_at: string
}

// 创建用户的数据传输对象
export interface CreateUserDto {
    username: string
    password: string
    role: UserRole
}

// 更新用户的数据传输对象
export interface UpdateUserDto {
    username?: string
    password?: string
    role?: UserRole
}

// 用户登录请求
export interface LoginRequest {
    username: string
    password: string
}

// 用户登录响应
export interface LoginResponse {
    token: string
    user: User
}

// 用户状态
export interface UserState {
    token: string | null
    user: User | null
    isAdmin: boolean
} 
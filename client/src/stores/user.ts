import { defineStore } from 'pinia'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
    exp: number
    id: number
    username: string
    role: 'admin' | 'user'
}

export const useUserStore = defineStore('user', {
    state: () => ({
        token: localStorage.getItem('token') || '',
        user: JSON.parse(localStorage.getItem('user') || '{}')
    }),

    getters: {
        isLoggedIn: (state) => {
            if (!state.token) return false

            try {
                const decoded = jwtDecode<JwtPayload>(state.token)
                // 检查令牌是否过期（exp 是过期时间戳）
                if (decoded.exp * 1000 < Date.now()) {
                    // 如果过期，清除状态
                    state.token = ''
                    state.user = {}
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                    return false
                }
                return true
            } catch {
                return false
            }
        },
        isAdmin: (state) => state.user?.role === 'admin'
    },

    actions: {
        async login(username: string, password: string) {
            try {
                const { data } = await axios.post('/api/auth/login', {
                    username,
                    password
                })
                this.token = data.token
                this.user = data.user
                localStorage.setItem('token', data.token)
                localStorage.setItem('user', JSON.stringify(data.user))

                // 配置 axios 默认请求头
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
                return true
            } catch (error) {
                return false
            }
        },

        logout() {
            this.token = ''
            this.user = {}
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            // 清除 axios 请求头
            delete axios.defaults.headers.common['Authorization']
        },

        // 初始化 axios 请求头
        initializeAuth() {
            if (this.isLoggedIn && this.token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
            }
        }
    }
}) 
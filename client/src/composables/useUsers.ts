import { ref } from 'vue'
import { useUserStore } from '../stores/user'
import type { User, CreateUserDto, UpdateUserDto } from '../types/user'

export function useUsers() {
    const userStore = useUserStore()
    const users = ref<User[]>([])
    const usersLoaded = ref(false)
    const loadError = ref(false)

    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
    })

    // 加载用户列表
    const loadUsers = async () => {
        loadError.value = false
        usersLoaded.value = false
        try {
            const response = await fetch('/api/users', {
                headers: getAuthHeaders()
            })
            if (!response.ok) throw new Error('获取用户列表失败')
            const data = await response.json()
            users.value = data
            usersLoaded.value = true
        } catch (error) {
            loadError.value = true
            throw error
        }
    }

    // 创建用户
    const createUser = async (userData: CreateUserDto) => {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(userData)
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || '创建用户失败')
        }

        await loadUsers()
    }

    // 更新用户
    const updateUser = async (id: number, userData: UpdateUserDto) => {
        const response = await fetch(`/api/users/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(userData)
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || '更新用户失败')
        }

        await loadUsers()
    }

    // 删除用户
    const deleteUser = async (id: number) => {
        const response = await fetch(`/api/users/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || '删除用户失败')
        }

        await loadUsers()
    }

    return {
        users,
        usersLoaded,
        loadError,
        loadUsers,
        createUser,
        updateUser,
        deleteUser
    }
} 
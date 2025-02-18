import { ref } from 'vue'
import type { PoiRealtimeInfo, CreatePoiRealtimeInfoDto, UpdatePoiRealtimeInfoDto } from '../types/poi'
import { useUserStore } from '../stores/user'

const API_BASE_URL = '/api/poi-realtime'

export function usePoiRealtimeInfo() {
    const userStore = useUserStore()
    const realtimeInfos = ref<PoiRealtimeInfo[]>([])

    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
    })

    const fetchRealtimeInfos = async (poiId: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${poiId}`, {
                headers: getAuthHeaders()
            })
            if (!response.ok) {
                throw new Error('获取POI实时信息失败')
            }
            const data = await response.json()
            realtimeInfos.value = data
        } catch (error) {
            console.error('获取POI实时信息失败:', error)
            throw error
        }
    }

    const addRealtimeInfo = async (data: CreatePoiRealtimeInfoDto) => {
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            })
            if (!response.ok) {
                throw new Error('添加POI实时信息失败')
            }
            return await response.json()
        } catch (error) {
            console.error('添加POI实时信息失败:', error)
            throw error
        }
    }

    const updateRealtimeInfo = async (id: number, data: UpdatePoiRealtimeInfoDto) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            })
            if (!response.ok) {
                throw new Error('更新POI实时信息失败')
            }
            return await response.json()
        } catch (error) {
            console.error('更新POI实时信息失败:', error)
            throw error
        }
    }

    const deleteRealtimeInfo = async (id: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            })
            if (!response.ok) {
                throw new Error('删除POI实时信息失败')
            }
        } catch (error) {
            console.error('删除POI实时信息失败:', error)
            throw error
        }
    }

    return {
        realtimeInfos,
        fetchRealtimeInfos,
        addRealtimeInfo,
        updateRealtimeInfo,
        deleteRealtimeInfo
    }
} 
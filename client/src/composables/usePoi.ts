import { ref } from 'vue'
import { useUserStore } from '../stores/user'
import type { Poi } from '../types/poi'
import type { PoiType } from '../constants/poi'

export interface PoiInput {
    name: string
    longitude: number
    latitude: number
    height: number
    type: PoiType
    description?: string
}

export function usePoi() {
    const userStore = useUserStore()
    const pois = ref<Poi[]>([])
    const poisLoaded = ref(false)
    const loadError = ref(false)

    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
    })

    const loadPois = async () => {
        loadError.value = false
        poisLoaded.value = false
        try {
            const url = userStore.isAdmin ? '/api/admin/pois' : '/api/map/pois'
            const response = await fetch(url, {
                headers: getAuthHeaders()
            })
            if (!response.ok) throw new Error('获取POI失败')
            const data = await response.json()
            pois.value = data
            poisLoaded.value = true
        } catch (error) {
            loadError.value = true
            throw error
        }
    }

    const addPoi = async (poi: PoiInput) => {
        const response = await fetch('/api/admin/pois', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(poi)
        })
        if (!response.ok) throw new Error('添加POI失败')
        await loadPois()
    }

    const updatePoi = async (id: number, poi: PoiInput) => {
        const response = await fetch(`/api/admin/pois/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(poi)
        })
        if (!response.ok) throw new Error('更新POI失败')
        await loadPois()
    }

    const deletePoi = async (id: number) => {
        const response = await fetch(`/api/admin/pois/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        })
        if (!response.ok) throw new Error('删除POI失败')
        await loadPois()
    }

    return {
        pois,
        poisLoaded,
        loadError,
        loadPois,
        addPoi,
        updatePoi,
        deletePoi
    }
} 
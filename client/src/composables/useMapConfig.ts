import { ref } from 'vue'
import { useUserStore } from '../stores/user'

interface MapConfig {
    whuPosition: [number, number, number]
}

export function useMapConfig() {
    const userStore = useUserStore()
    const mapConfig = ref<MapConfig>({
        whuPosition: [0, 0, 0]
    })

    const loadMapConfig = async () => {
        try {
            const response = await fetch('/api/map/config', {
                headers: {
                    'Authorization': `Bearer ${userStore.token}`
                }
            })
            if (!response.ok) throw new Error('获取地图配置失败')
            const data = await response.json()
            mapConfig.value = {
                whuPosition: data.locations.whu.position as [number, number, number]
            }
        } catch (error) {
            throw error
        }
    }

    return {
        mapConfig,
        loadMapConfig
    }
} 
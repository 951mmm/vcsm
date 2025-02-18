import { ref } from 'vue'
import type { Poi } from '../types/poi'

export function usePoiInfo() {
    const selectedPoi = ref<Poi | null>(null)
    const poiInfoVisible = ref(false)

    // 点击事件处理
    const handlePoiClick = (poi: Poi) => {
        selectedPoi.value = {
            id: Number(poi.id),
            name: String(poi.name),
            type: poi.type,
            longitude: Number(poi.longitude),
            latitude: Number(poi.latitude),
            height: Number(poi.height),
            description: poi.description,
            created_at: poi.created_at
        }
        poiInfoVisible.value = true
    }

    // 关闭信息对话框
    const handleCloseInfo = () => {
        poiInfoVisible.value = false
        selectedPoi.value = null
    }

    // 聚焦到POI
    const focusOnPoi = (poi: Poi, viewer: any) => {
        if (!viewer?.cesiumInstance) return
        const { Cesium } = viewer.cesiumInstance

        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                poi.longitude,
                poi.latitude,
                poi.height + 500
            ),
            orientation: {
                heading: Cesium.Math.toRadians(0),
                pitch: Cesium.Math.toRadians(-45),
                roll: 0
            },
            duration: 1.5
        })

        handleCloseInfo()
    }

    return {
        selectedPoi,
        poiInfoVisible,
        handlePoiClick,
        handleCloseInfo,
        focusOnPoi
    }
} 
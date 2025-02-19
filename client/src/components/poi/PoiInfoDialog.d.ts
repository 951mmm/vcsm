import type { Poi } from '../../types/poi'
import type { VcViewerProvider } from 'vue-cesium/es/utils/types'

export interface PoiInfoDialogProps {
    modelValue: boolean
    poi: Poi | null
}

export interface PoiInfoDialogEmits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'close'): void
}

export interface PoiInfoDialogExpose {
    focusOnPoi: (poi: Poi) => void
} 
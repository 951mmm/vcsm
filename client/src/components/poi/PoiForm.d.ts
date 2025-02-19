import type { Poi } from '../../types/poi'

export interface PoiFormProps {
    modelValue: boolean
    editingPoi: Poi | null
    defaultPosition: [number, number, number]
}

export interface PoiFormEmits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'submit', formData: Record<string, any>): void
}

export interface PoiFormExpose {
    setPosition: (position: { longitude: string, latitude: string, height: string }) => void
} 
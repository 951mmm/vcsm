<template>
    <el-dialog v-model="visible" :title="editingPoi ? '编辑POI' : '添加POI'" width="500px">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="名称" prop="name">
                <el-input v-model="form.name" placeholder="请输入POI名称" />
            </el-form-item>
            <el-form-item label="类型" prop="type">
                <el-select v-model="form.type" placeholder="请选择POI类型">
                    <el-option v-for="(label, value) in poiTypeMap" :key="value" :label="label" :value="value" />
                </el-select>
            </el-form-item>
            <el-form-item label="经度" prop="longitude">
                <el-input-number v-model="form.longitude" :precision="6" :step="0.000001" :max="180" :min="-180" />
            </el-form-item>
            <el-form-item label="纬度" prop="latitude">
                <el-input-number v-model="form.latitude" :precision="6" :step="0.000001" :max="90" :min="-90" />
            </el-form-item>
            <el-form-item label="高度" prop="height">
                <el-input-number v-model="form.height" :precision="2" :step="1" />
            </el-form-item>
            <el-form-item label="描述" prop="description">
                <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入POI描述" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="visible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { poiTypeMap, poiFormRules } from '../../constants/poi'
import type { PoiFormProps, PoiFormEmits, PoiFormExpose } from './PoiForm'

const props = defineProps<PoiFormProps>()
const emit = defineEmits<PoiFormEmits>()

const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

const formRef = ref<any>(null)
const submitting = ref(false)

interface FormData {
    name: string
    type: string
    longitude: number
    latitude: number
    height: number
    description: string
}

const form = ref<FormData>({
    name: '',
    type: 'education',
    longitude: props.defaultPosition?.[0] || 0,
    latitude: props.defaultPosition?.[1] || 0,
    height: 0,
    description: ''
})

// 设置坐标值的方法
const setPosition = (position: { longitude: string, latitude: string, height: string }) => {
    const { longitude, latitude, height } = position
    form.value.longitude = Number(longitude)
    form.value.latitude = Number(latitude)
    form.value.height = Number(height || 0)
}

// 对外暴露方法
defineExpose<PoiFormExpose>({
    setPosition
})

const rules = poiFormRules

const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid: boolean) => {
        if (!valid) return
        submitting.value = true
        try {
            console.log('submit', form.value)
            emit('submit', form.value)
            visible.value = false
        } finally {
            submitting.value = false
        }
    })
}

// 监听编辑对象变化
watch(() => props.editingPoi, (newPoi) => {
    if (newPoi) {
        form.value = {
            name: newPoi.name,
            type: newPoi.type,
            longitude: newPoi.longitude,
            latitude: newPoi.latitude,
            height: newPoi.height,
            description: newPoi.description || ''
        }
    } else {
        form.value = {
            name: '',
            type: 'education',
            longitude: props.defaultPosition?.[0] || 0,
            latitude: props.defaultPosition?.[1] || 0,
            height: 0,
            description: ''
        }
    }
}, { immediate: true })
</script>
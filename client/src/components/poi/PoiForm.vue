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

<script setup>
import { ref, computed, watch } from 'vue'
import { poiTypeMap, poiFormRules } from '../../constants/poi'

const props = defineProps({
    modelValue: Boolean,
    editingPoi: Object,
    defaultPosition: Array
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

const formRef = ref(null)
const submitting = ref(false)

const form = ref({
    name: '',
    type: 'education',
    longitude: props.defaultPosition?.[0] || 0,
    latitude: props.defaultPosition?.[1] || 0,
    height: 0,
    description: ''
})

const rules = poiFormRules

const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
        if (!valid) return
        submitting.value = true
        try {
            await emit('submit', form.value)
            visible.value = false
        } finally {
            submitting.value = false
        }
    })
}

// 监听编辑对象变化
watch(() => props.editingPoi, (newPoi) => {
    if (newPoi) {
        form.value = { ...newPoi }
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
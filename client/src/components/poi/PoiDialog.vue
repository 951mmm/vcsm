<template>
    <el-dialog v-model="visible" title="POI列表" width="70%">
        <el-table :data="pois" style="width: 100%">
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="type" label="类型">
                <template #default="{ row }">
                    {{ poiTypeMap[row.type as PoiType] }}
                </template>
            </el-table-column>
            <el-table-column prop="longitude" label="经度" />
            <el-table-column prop="latitude" label="纬度" />
            <el-table-column prop="height" label="高度" />
            <el-table-column prop="description" label="描述" />
            <el-table-column label="操作" width="280" v-if="isAdmin">
                <template #default="{ row }">
                    <el-button size="small" @click="handleRealtimeInfo(row)">实时信息</el-button>
                    <template v-if="isAdmin">
                        <el-button size="small" @click="handleEdit(row)">编辑</el-button>
                        <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
                    </template>
                </template>
            </el-table-column>
        </el-table>
        <template #footer>
            <el-button @click="visible = false">取消</el-button>
            <el-button type="primary" @click="handleAdd" v-if="isAdmin">添加POI</el-button>
        </template>
    </el-dialog>

    <!-- POI实时信息弹窗 -->
    <PoiRealtimeDialog v-model="showRealtimeDialog" :poi="selectedPoi" />
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed } from 'vue'
import type { Poi } from '../../types/poi'
import { poiTypeMap, type PoiType } from '../../constants/poi'
import PoiRealtimeDialog from './PoiRealtimeDialog.vue'

const props = defineProps<{
    modelValue: boolean
    pois: Poi[]
    isAdmin: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'edit', poi: Poi): void
    (e: 'delete', poi: Poi): void
    (e: 'add'): void
}>()

const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
})

const selectedPoi = ref<Poi | null>(null)
const showRealtimeDialog = ref(false)

const handleEdit = (poi: Poi) => {
    selectedPoi.value = poi
    emit('edit', poi)
}

const handleDelete = (poi: Poi) => {
    emit('delete', poi)
}

const handleAdd = () => {
    selectedPoi.value = null
    emit('add')
}

const handleRealtimeInfo = (poi: Poi) => {
    selectedPoi.value = poi
    showRealtimeDialog.value = true
}
</script>
<template>
    <transition name="fade" mode="out-in">
        <div v-if="visible" class="realtime-info-panel">
            <div class="panel-header">
                <span class="title">{{ poi?.name }} - 实时信息</span>
                <el-button type="text" @click="visible = false" class="close-btn">
                    <el-icon>
                        <Close />
                    </el-icon>
                </el-button>
            </div>
            <div class="panel-content">
                <el-table :data="realtimeInfos" style="width: 100%" v-loading="loading" size="small" :max-height="300">
                    <el-table-column prop="name" label="名称" min-width="100" />
                    <el-table-column prop="value" label="值" min-width="100" />
                    <el-table-column label="更新时间" width="180">
                        <template #default="{ row }">
                            {{ new Date(row.updated_at).toLocaleString() }}
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Close } from '@element-plus/icons-vue'
import type { Poi, PoiRealtimeInfo } from '../../types/poi'

const props = defineProps<{
    modelValue: boolean
    poi?: Poi
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
}>()

const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
})

const realtimeInfos = ref<PoiRealtimeInfo[]>([])
const loading = ref(false)

// 获取实时信息
const fetchRealtimeInfo = async () => {
    if (!props.poi) return

    loading.value = true
    try {
        const response = await fetch(`/api/poi-realtime/${props.poi.id}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (!response.ok) throw new Error('获取实时信息失败')
        const data = await response.json()
        realtimeInfos.value = data.map(({ name, value }: { name: string, value: string }) => ({
            id: 0,
            poi_id: props.poi?.id || 0,
            name,
            value: String(value),
            created_at: new Date(),
            updated_at: new Date()
        }))
    } catch (error) {
        console.error('获取实时信息失败:', error)
    } finally {
        loading.value = false
    }
}

// 监听显示状态，显示时获取数据
watch(() => visible.value, (newValue) => {
    if (newValue && props.poi) {
        fetchRealtimeInfo()
    }
})

// 监听POI变化，POI改变时重新获取数据
watch(() => props.poi, (newValue) => {
    if (newValue && visible.value) {
        fetchRealtimeInfo()
    }
}, { deep: true })
</script>

<style scoped>
.realtime-info-panel {
    position: fixed;
    right: 20px;
    top: 80px;
    width: 500px;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    z-index: 2000;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    border-bottom: 1px solid #e4e7ed;
}

.panel-header .title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
}

.panel-content {
    padding: 12px;
}

.close-btn {
    padding: 0;
    font-size: 16px;
}

.close-btn :deep(.el-icon) {
    margin-right: 0;
}

:deep(.el-table--small) {
    font-size: 13px;
}

:deep(.el-table__header) {
    background-color: #f5f7fa;
}

:deep(.el-table__row) {
    cursor: default;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
    background-color: #fafafa;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 2s ease, transform 2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

.fade-enter-to,
.fade-leave-from {
    opacity: 1;
    transform: translateY(0);
}
</style>
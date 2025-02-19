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
                <div class="filter-section">
                    <el-select v-model="selectedMetric" placeholder="选择指标" class="metric-selector" clearable>
                        <el-option v-for="metric in availableMetrics" :key="metric" :label="metric" :value="metric" />
                    </el-select>
                </div>
                <el-table :data="paginatedRealtimeInfos" style="width: 100%" v-loading="loading" size="small"
                    :max-height="300">
                    <el-table-column prop="name" label="名称" min-width="100" />
                    <el-table-column prop="value" label="值" min-width="100" />
                    <el-table-column label="更新时间" width="180">
                        <template #default="{ row }">
                            {{ new Date(row.updated_at).toLocaleString() }}
                        </template>
                    </el-table-column>
                </el-table>
                <div class="pagination-section">
                    <el-pagination v-model:current-page="currentPage" :page-size="pageSize"
                        :total="filteredRealtimeInfos.length" layout="prev, pager, next" background
                        hide-on-single-page />
                </div>
                <div v-if="realtimeInfos.length > 0" class="chart-section">
                    <PoiRealtimeChart :poi="poi" :realtimeInfos="filteredRealtimeInfos" :loading="loading"
                        :selected-metric="selectedMetric" />
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Close } from '@element-plus/icons-vue'
import type { Poi, PoiRealtimeInfo } from '../../types/poi'
import PoiRealtimeChart from './PoiRealtimeChart.vue'

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
const selectedMetric = ref<string>('')

const pageSize = 5
const currentPage = ref(1)

// 计算可用的指标
const availableMetrics = computed(() => {
    const metrics = new Set<string>();
    realtimeInfos.value.forEach(info => metrics.add(info.name));
    return Array.from(metrics);
});

// 过滤后的实时信息
const filteredRealtimeInfos = computed(() => {
    if (!selectedMetric.value) return realtimeInfos.value;
    return realtimeInfos.value.filter(info => info.name === selectedMetric.value);
});

// 分页后的实时信息
const paginatedRealtimeInfos = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    const end = start + pageSize
    return filteredRealtimeInfos.value.slice(start, end)
})

// 当过滤条件改变时，重置页码
watch(selectedMetric, () => {
    currentPage.value = 1
})

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
        realtimeInfos.value = data
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
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    z-index: 2000;
    transition: background-color 0.3s ease;
}

.realtime-info-panel:hover {
    background-color: rgba(255, 255, 255, 1);
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    border-bottom: 1px solid rgba(228, 231, 237, 0.8);
    transition: border-color 0.3s ease;
}

.realtime-info-panel:hover .panel-header {
    border-bottom-color: rgba(228, 231, 237, 1);
}

.panel-header .title {
    font-size: 16px;
    font-weight: 500;
    color: rgba(48, 49, 51, 0.8);
    transition: color 0.3s ease;
}

.realtime-info-panel:hover .panel-header .title {
    color: rgba(48, 49, 51, 1);
}

.panel-content {
    padding: 12px;
    background-color: rgba(255, 255, 255, 0.8);
    transition: background-color 0.3s ease;
}

.realtime-info-panel:hover .panel-content {
    background-color: rgba(255, 255, 255, 1);
}

.close-btn {
    padding: 0;
    font-size: 16px;
    opacity: 0.8;
    transition: opacity 0.3s ease;
}

.close-btn:hover {
    opacity: 1;
}

.close-btn :deep(.el-icon) {
    margin-right: 0;
}

:deep(.el-table--small) {
    font-size: 13px;
    --el-table-header-bg-color: rgba(245, 247, 250, 0.8);
    --el-table-tr-bg-color: rgba(255, 255, 255, 0.8);
}

.realtime-info-panel:hover :deep(.el-table--small) {
    --el-table-header-bg-color: rgba(245, 247, 250, 1);
    --el-table-tr-bg-color: rgba(255, 255, 255, 1);
}

:deep(.el-table__header) {
    background-color: var(--el-table-header-bg-color);
    transition: background-color 0.3s ease;
}

:deep(.el-table__row) {
    cursor: default;
    background-color: var(--el-table-tr-bg-color);
    transition: background-color 0.3s ease;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
    background-color: rgba(250, 250, 250, 0.8);
    transition: background-color 0.3s ease;
}

.realtime-info-panel:hover :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
    background-color: rgba(250, 250, 250, 1);
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

.filter-section {
    margin-bottom: 16px;
    opacity: 0.8;
    transition: opacity 0.3s ease;
}

.realtime-info-panel:hover .filter-section {
    opacity: 1;
}

.metric-selector {
    width: 200px;
}

.pagination-section {
    margin-top: 12px;
    display: flex;
    justify-content: flex-end;
    opacity: 0.8;
    transition: opacity 0.3s ease;
}

.realtime-info-panel:hover .pagination-section {
    opacity: 1;
}

.chart-section {
    margin-top: 20px;
    opacity: 0.8;
    transition: opacity 0.3s ease;
}

.realtime-info-panel:hover .chart-section {
    opacity: 1;
}
</style>
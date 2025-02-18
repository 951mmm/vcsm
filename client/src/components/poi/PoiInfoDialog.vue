<template>
    <el-dialog v-model="visible" :title="poi?.name || ''" width="400px" :modal="true" :append-to-body="true"
        destroy-on-close :show-close="true" @close="$emit('close')">
        <template v-if="poi">
            <div class="info-content">
                <div class="info-item">
                    <span class="label">类型：</span>
                    <span>{{ poiTypeMap[poi.type] }}</span>
                </div>
                <div class="info-item">
                    <span class="label">位置：</span>
                    <span>{{ formatCoordinate(poi.longitude) }}, {{ formatCoordinate(poi.latitude) }}</span>
                </div>
                <div class="info-item" v-if="poi.description">
                    <span class="label">描述：</span>
                    <span>{{ poi.description }}</span>
                </div>
            </div>
        </template>
        <template #footer>
            <el-button type="primary" @click="$emit('focus', poi)">
                <el-icon>
                    <Location />
                </el-icon>
                <span>聚焦位置</span>
            </el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Location } from '@element-plus/icons-vue'
import { poiTypeMap } from '../../constants/poi'
import type { Poi } from '../../composables/usePoi'

const props = defineProps<{
    modelValue: boolean
    poi: Poi | null
}>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    close: []
    focus: [poi: Poi]
}>()

const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

const formatCoordinate = (value: number) => {
    const num = Number(value)
    return isNaN(num) ? '0.000000' : num.toFixed(6)
}
</script>

<style scoped>
.info-content {
    padding: 10px 0;
}

.info-item {
    margin-bottom: 12px;
    line-height: 1.4;
}

.info-item:last-child {
    margin-bottom: 0;
}

.label {
    color: #606266;
    margin-right: 8px;
    font-weight: 500;
}

:deep(.el-dialog__body) {
    padding-top: 10px;
    padding-bottom: 10px;
}

:deep(.el-button .el-icon) {
    margin-right: 4px;
}

/* 确保对话框能够显示在地图上方 */
.el-dialog {
    z-index: 3000 !important;
}

.el-dialog__wrapper {
    z-index: 2999 !important;
}

.v-modal {
    z-index: 2998 !important;
}
</style>
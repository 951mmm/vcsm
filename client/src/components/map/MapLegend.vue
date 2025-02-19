<template>
    <div class="map-legend">
        <div class="legend-title">图例</div>
        <div class="legend-items">
            <!-- POI类型图例 -->
            <div class="legend-item" v-for="(label, type) in poiTypeMap" :key="type">
                <el-checkbox v-model="visibleTypes[type]" @change="handleVisibilityChange">
                    <div class="legend-content">
                        <div class="legend-color" :style="{ backgroundColor: getPoiColor(type) }"></div>
                        <span>{{ label }}</span>
                    </div>
                </el-checkbox>
            </div>

            <!-- 建筑白膜控制 -->
            <div class="legend-item building-control">
                <el-checkbox v-model="buildingsVisible" @change="handleBuildingsChange">
                    <div class="legend-content">
                        <div class="legend-color building-color"></div>
                        <span>建筑白膜</span>
                    </div>
                </el-checkbox>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { poiTypeMap, getPoiColor, type PoiType } from '../../constants/poi'

const props = defineProps<{
    modelValue: PoiType[]
    showBuildings: boolean
}>()

const emit = defineEmits<{
    'update:modelValue': [value: PoiType[]]
    'update:showBuildings': [value: boolean]
}>()

// 使用对象来跟踪每个类型的可见性
const visibleTypes = reactive(
    Object.keys(poiTypeMap).reduce((acc, type) => {
        acc[type as PoiType] = props.modelValue.includes(type as PoiType)
        return acc
    }, {} as Record<PoiType, boolean>)
)

// 建筑白膜可见性
const buildingsVisible = computed({
    get: () => props.showBuildings,
    set: (value) => emit('update:showBuildings', value)
})

// 当 modelValue 变化时更新 visibleTypes
watch(() => props.modelValue, (newValue) => {
    Object.keys(visibleTypes).forEach(type => {
        visibleTypes[type as PoiType] = newValue.includes(type as PoiType)
    })
})

// 当复选框状态改变时更新父组件
const handleVisibilityChange = () => {
    const visiblePois = Object.entries(visibleTypes)
        .filter(([_, visible]) => visible)
        .map(([type]) => type as PoiType)
    emit('update:modelValue', visiblePois)
}

// 处理建筑白膜显示状态变化
const handleBuildingsChange = () => {
    emit('update:showBuildings', buildingsVisible.value)
}
</script>

<style scoped>
.map-legend {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.9);
    padding: 15px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    z-index: 1000;
}

.legend-title {
    font-weight: bold;
    margin-bottom: 10px;
}

.legend-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.legend-item {
    display: flex;
    align-items: center;
}

.legend-content {
    display: flex;
    align-items: center;
    gap: 8px;
}

.legend-color {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    flex-shrink: 0;
}

.building-color {
    background-color: #FFFFFF;
    border: 1px solid #CCCCCC;
}

.building-control {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #EBEEF5;
}

:deep(.el-checkbox) {
    width: 100%;
    margin-right: 0;
}

:deep(.el-checkbox__label) {
    width: 100%;
}
</style>
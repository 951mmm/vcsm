<template>
    <div v-if="modelValue" class="exit-focus-btn">
        <el-button type="primary" @click="handleClick" size="large">
            <el-icon>
                <Back />
            </el-icon>
            退出聚焦
        </el-button>
    </div>
</template>

<script setup lang="ts">
import { Back } from '@element-plus/icons-vue'
import { useVueCesium } from 'vue-cesium';

const props = defineProps<{
    modelValue: boolean
    defaultPosition: [number, number, number]
}>()

const $vc = useVueCesium()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'exit'): void
}>()

const handleClick = () => {

    const { viewer, Cesium } = $vc;
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
            props.defaultPosition[0],
            props.defaultPosition[1],
            props.defaultPosition[2]
        ),
        orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-40),
            roll: 0
        },
        duration: 2
    })
    emit('update:modelValue', false)
    emit('exit')
}
</script>

<style scoped>
.exit-focus-btn {
    position: absolute;
    left: 20px;
    top: 20px;
    z-index: 1;
}

.exit-focus-btn :deep(.el-button) {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    font-size: 16px;
    background-color: rgba(64, 158, 255, 0.9);
}

.exit-focus-btn :deep(.el-button:hover) {
    background-color: rgba(64, 158, 255, 1);
}
</style>
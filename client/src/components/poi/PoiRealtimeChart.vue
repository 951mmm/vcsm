<!-- POI实时信息统计图表组件 -->
<template>
    <div class="realtime-chart-container">
        <div v-if="loading" class="loading-overlay">
            <el-icon class="is-loading">
                <Loading />
            </el-icon>
        </div>
        <div v-else-if="!hasData" class="no-data">
            暂无实时数据
        </div>
        <div v-else>
            <div class="chart-header">
                <h3>{{ poi?.name }} - 实时数据统计</h3>
            </div>
            <div ref="chartRef" class="chart-container"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue';
import { Loading } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import type { Poi, PoiRealtimeInfo } from '../../types/poi';

const props = defineProps<{
    poi?: Poi;
    realtimeInfos: PoiRealtimeInfo[];
    loading?: boolean;
    selectedMetric: string;
}>();

const chartRef = ref<HTMLElement>();
let chart: echarts.ECharts | null = null;

// 检查是否有数据
const hasData = computed(() => props.realtimeInfos.length > 0);

const initChart = () => {
    if (!chartRef.value) return;
    // 确保容器尺寸已经计算完成
    const resizeObserver = new ResizeObserver(() => {
        if (chartRef.value?.clientWidth && chartRef.value?.clientHeight) {
            chart = echarts.init(chartRef.value);
            updateChart();
            resizeObserver.disconnect();
        }
    });

    resizeObserver.observe(chartRef.value);
};

const updateChart = () => {
    if (!chart || !props.realtimeInfos.length) return;

    // 按时间排序并按指标分组
    const dataByMetric = new Map<string, [Date, number][]>();

    props.realtimeInfos.forEach(info => {
        if (!dataByMetric.has(info.name)) {
            dataByMetric.set(info.name, []);
        }
        dataByMetric.get(info.name)?.push([
            new Date(info.created_at),
            parseFloat(info.value) || 0
        ]);
    });

    // 对每个指标的数据按时间排序
    dataByMetric.forEach(data => {
        data.sort((a, b) => a[0].getTime() - b[0].getTime());
    });

    // 筛选当前选中指标的数据
    const seriesData: Array<[string, Array<[Date, number]>]> = props.selectedMetric
        ? [[props.selectedMetric, dataByMetric.get(props.selectedMetric) || []]]
        : Array.from(dataByMetric.entries());

    const option: EChartsOption = {
        title: {
            text: props.selectedMetric ? `${props.selectedMetric} 数据趋势` : '实时数据趋势'
        },
        tooltip: {
            trigger: 'axis',
            formatter: (params: any) => {
                const date = new Date(params[0].value[0]);
                const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                return `${time}<br/>${params.map((param: any) =>
                    `${param.seriesName}: ${param.value[1]}`
                ).join('<br/>')}`;
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            containLabel: true
        },
        toolbox: {
            feature: {
                dataZoom: {
                    yAxisIndex: 'none'
                },
                restore: {},
                saveAsImage: {}
            }
        },
        dataZoom: [
            {
                type: 'slider',
                show: true,
                xAxisIndex: [0],
                start: 0,
                end: 100
            },
            {
                type: 'inside',
                xAxisIndex: [0],
                start: 0,
                end: 100
            }
        ],
        xAxis: {
            type: 'time',
            axisLabel: {
                formatter: (value: number) => {
                    const date = new Date(value);
                    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                }
            },
            splitNumber: 8,
            minInterval: 30 * 60 * 1000, // 30分钟的间隔
            maxInterval: 2 * 60 * 60 * 1000, // 2小时的间隔
            axisPointer: {
                show: true,
                snap: true,
                label: {
                    formatter: (params: any) => {
                        const date = new Date(params.value);
                        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                    }
                }
            }
        },
        yAxis: {
            type: 'value',
            name: '数值',
            splitLine: {
                show: true,
                lineStyle: {
                    type: 'dashed'
                }
            }
        },
        series: seriesData.map(([name, data]) => ({
            name,
            type: 'line' as const,
            data: data.map(([time, value]) => [time.getTime(), value]),
            showSymbol: true,
            symbolSize: 6,
            lineStyle: {
                width: 2
            }
        }))
    };

    chart.setOption(option);
};

// 监听选中指标的变化
watch(() => props.selectedMetric, () => {
    if (props.realtimeInfos.length) {
        updateChart();
    }
});

// 监听数据变化
watch(() => props.realtimeInfos, (newValue) => {
    if (newValue.length) {
        // 确保图表已初始化
        if (!chart && chartRef.value) {
            initChart();
        }
        updateChart();
    }
}, { deep: true });

onMounted(() => {
    if (props.realtimeInfos.length) {
        // 延迟初始化以确保DOM已渲染
        nextTick(() => {
            initChart();
        });
    }

    window.addEventListener('resize', () => {
        chart?.resize();
    });
});

onUnmounted(() => {
    if (chart) {
        chart.dispose();
        chart = null;
    }
    window.removeEventListener('resize', () => {
        chart?.resize();
    });
});
</script>

<style scoped>
.realtime-chart-container {
    position: relative;
    width: 100%;
    height: 400px;
    background: #fff;
    border-radius: 4px;
    padding: 16px;
    display: flex;
    flex-direction: column;
}

.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.9);
}

.no-data {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
    font-size: 14px;
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-shrink: 0;
}

.chart-header h3 {
    margin: 0;
    font-size: 16px;
    color: #303133;
}

.chart-container {
    flex: 1;
    min-height: 300px;
}
</style>
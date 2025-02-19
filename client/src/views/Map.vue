<template>
  <div class="map-page">
    <el-header class="header">
      <div class="title">地图系统</div>
      <div class="user-info">
        <span>{{ userStore.user.username }}</span>
        <el-button type="text" @click="handleLogout">退出</el-button>
      </div>
    </el-header>

    <div class="main-content">
      <!-- 管理员侧边栏 -->
      <AdminMapSidebar v-if="userStore.isAdmin" @openPoiDialog="poiDialogVisible = true"
        @openUserDialog="userDialogVisible = true" />

      <div class="map-container" :class="{ 'with-sidebar': userStore.isAdmin }">
        <template v-if="poisLoaded">
          <vc-viewer ref="viewerRef" @ready="onViewerReady" :animation="false" :timeline="false"
            :baseLayerPicker="false" :fullscreenButton="false" :navigationHelpButton="false" :homeButton="false"
            :geocoder="false" :sceneModePicker="false">
            <!-- 天地图图层 -->
            <vc-layer-imagery>
              <vc-imagery-provider-tianditu mapStyle="img_c" token="14b13410e1233fa01a9a03031e56c94d" />
            </vc-layer-imagery>
            <vc-layer-imagery>
              <vc-imagery-provider-tianditu mapStyle="cia_c" token="14b13410e1233fa01a9a03031e56c94d" />
            </vc-layer-imagery>

            <!-- GeoJSON 数据 -->
            <!-- <vc-datasource-geojson ref="whuGeojsonRef" :data="whuGeojsonUrl" :stroke="whuGeojsonStyle.stroke"
              :strokeWidth="whuGeojsonStyle.strokeWidth" :fill="whuGeojsonStyle.fill" :clampToGround="false"
              :show="true" @ready="onWhuGeojsonReady"/> -->

            <!-- POI点 -->
            <vc-entity v-for="poi in visiblePois" :key="poi.id" :position="[poi.longitude, poi.latitude, poi.height]"
              @click="handlePoiClick(poi)">
              <vc-graphics-billboard :image="locationIcon" :scale="1.5" :color="getPoiColor(poi.type)" />
            </vc-entity>

            <!-- 退出聚焦按钮 -->
            <ExitFocusButton v-model="isFocusing" :default-position="mapConfig.whuPosition" @exit="handleExitFocus" />

            <!-- 量算工具 -->
            <vc-measurements ref="measurementsRef" :measurementType="measurementType" :mainFabOpts="mainFabOpts"
              :polylineOpts="polylineOpts" :pointOpts="pointOpts" @mouseEvt="measureMouseEvt"
              @drawEvt="measureDrawEvt" />

            <!-- POI信息对话框 -->
            <PoiInfoDialog v-model="poiInfoVisible" :poi="selectedPoi" @close="handleCloseInfo"
              @show-realtime="handleShowRealtime" />
          </vc-viewer>

          <!-- 图例 -->
          <MapLegend v-model="visibleTypes" v-model:showBuildings="showBuildings" />

          <!-- 实时信息对话框 -->
          <PoiRealtimeInfo v-model="realtimeInfoVisible" :poi="realtimePoi" />
        </template>
        <div v-else class="loading-container">
          <el-empty description="加载中..." v-if="!loadError">
            <el-skeleton animated :rows="3" />
          </el-empty>
          <el-empty description="加载失败" v-else>
            <el-button type="primary" @click="loadPois">重试</el-button>
          </el-empty>
        </div>
      </div>
    </div>

    <PoiDialog v-model="poiDialogVisible" :pois="pois" :is-admin="userStore.isAdmin" @edit="handleEditPoi"
      @delete="handleDeletePoi" @add="handleAddPoi" />

    <PoiForm v-if="userStore.isAdmin" ref="poiFormRef" v-model="poiFormVisible" :editing-poi="editingPoi"
      :default-position="mapConfig.whuPosition" @submit="handleSubmitPoi" />



    <!-- 用户管理对话框 -->
    <UserDialog v-if="userStore.isAdmin" v-model="userDialogVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, shallowRef, computed, nextTick, watch, toRaw } from 'vue'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import PoiDialog from '../components/poi/PoiDialog.vue'
import PoiForm from '../components/poi/PoiForm.vue'
import PoiInfoDialog from '../components/poi/PoiInfoDialog.vue'
import { getPoiColor, poiTypeMap, type PoiType } from '../constants/poi'
import type { Poi } from '../types/poi'
import { usePoi } from '../composables/usePoi'
import { useMapConfig } from '../composables/useMapConfig'
import MapLegend from '../components/map/MapLegend.vue'
import AdminMapSidebar from '../components/sidebar/AdminMapSidebar.vue'
import UserDialog from '../components/user/UserDialog.vue'
import { VcViewer } from 'vue-cesium'
import type { VcReadyObject } from 'vue-cesium/es/utils/types'
import type { Ref } from 'vue'
import PoiRealtimeInfo from '../components/poi/PoiRealtimeInfo.vue'
import { Back } from '@element-plus/icons-vue'
import ExitFocusButton from '../components/map/ExitFocusButton.vue'

const router = useRouter()
const userStore = useUserStore()
const viewerRef = shallowRef<any>(null)
const cesiumRef = shallowRef<any>(null)  // 保存Cesium引用

const {
  pois,
  poisLoaded,
  loadError,
  loadPois,
  addPoi,
  updatePoi,
  deletePoi
} = usePoi()

const {
  mapConfig,
  loadMapConfig
} = useMapConfig()

const poiDialogVisible = ref(false)
const poiFormVisible = ref(false)
const editingPoi = ref<Poi | null>(null)
const userDialogVisible = ref(false)

let isViewerReady = false

// 可见的POI类型
const visibleTypes = ref<PoiType[]>(['sport', 'education', 'transportation'])
const showBuildings = ref(false)  // 默认不显示白膜

// 过滤显示的POI
const visiblePois = computed(() => {
  return pois.value.filter(poi => visibleTypes.value.includes(poi.type))
})

// POI 信息相关
const selectedPoi = ref<Poi | null>(null)
const poiInfoVisible = ref(false)

// 实时信息对话框
const realtimeInfoVisible = ref(false)
const realtimePoi = ref<Poi | undefined>()

// 聚焦状态
const isFocusing = ref(false)

// 点击事件处理
const handlePoiClick = (poi: Poi) => {
  selectedPoi.value = {
    id: Number(poi.id),
    name: String(poi.name),
    type: poi.type,
    longitude: Number(poi.longitude),
    latitude: Number(poi.latitude),
    height: Number(poi.height),
    description: poi.description,
    created_at: poi.created_at
  }
  poiInfoVisible.value = true
}

// 关闭信息对话框
const handleCloseInfo = () => {
  poiInfoVisible.value = false
  selectedPoi.value = null
}

// 处理显示实时信息
const handleShowRealtime = (poi: Poi) => {
  realtimePoi.value = poi
  realtimeInfoVisible.value = true
  isFocusing.value = true
}

// 退出聚焦
const handleExitFocus = () => {
  // 恢复图例显示
  const mapLegend = document.querySelector('.map-legend') as HTMLElement
  if (mapLegend) {
    mapLegend.style.display = 'block'
  }

  // 关闭实时信息面板
  realtimeInfoVisible.value = false
}

// 初始化
onMounted(async () => {
  await loadMapConfig()
  await loadPois()
})

// 视图准备完成
const onViewerReady = async ({ Cesium, viewer }: VcReadyObject) => {
  if (isViewerReady) return
  isViewerReady = true

  // 保存Cesium引用
  cesiumRef.value = Cesium

  // 缩放到武汉大学
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      mapConfig.value.whuPosition[0],
      mapConfig.value.whuPosition[1],
      mapConfig.value.whuPosition[2]
    ),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-40),
      roll: 0
    },
    duration: 2
  })

  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
    Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
  )
  // 加载建筑白膜
  const promise = Cesium.GeoJsonDataSource.load(whuGeojsonUrl)
  promise.then((dataSource) => {
    viewer.dataSources.add(dataSource)
    const entities = dataSource.entities.values
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i] as any
      if (entity.polygon) {
        entity.name = `${entity.name}-白膜`
        entity.polygon.material = new Cesium.ColorMaterialProperty(new Cesium.Color(0.9, 0.9, 1.0, 0.5))
        entity.polygon.extrudedHeight = new Cesium.ConstantProperty(40)
        entity.polygon.outlineColor = new Cesium.ConstantProperty(Cesium.Color.WHITE)
        entity.polygon.heightReference = new Cesium.ConstantProperty(Cesium.HeightReference.RELATIVE_TO_GROUND)
        entity.show = showBuildings.value
        // 添加对显示状态的监听
        watch(showBuildings, (show) => {
          entity.show = show
        })
      }
    }
  }).catch((error) => {
    console.log(error)
  })
}

// POI 操作处理
const handleEditPoi = (poi: Poi) => {
  editingPoi.value = poi
  poiFormVisible.value = true
}

const handleAddPoi = () => {
  editingPoi.value = null
  poiFormVisible.value = true
}

const handleDeletePoi = async (poi: Poi) => {
  try {
    await deletePoi(poi.id)
    ElMessage.success('删除成功')
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleSubmitPoi = async (formData: any) => {
  try {
    if (editingPoi.value) {
      await updatePoi(editingPoi.value.id, formData)
      ElMessage.success('更新成功')
    } else {
      await addPoi(formData)
      ElMessage.success('添加成功')
    }
    poiFormVisible.value = false

  } catch (error) {
    ElMessage.error(editingPoi.value ? '更新失败' : '添加失败')
    throw error
  }
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}

const whuGeojsonUrl = 'http://localhost:3000/static/geojson/whu.geojson'

const measurementsRef = ref<any>(null)
const measurementType = ref<string>('point')

// 主按钮配置
const mainFabOpts = {
  direction: 'right',
  icon: 'vc-icons-measurement-button-clear',
  activeIcon: 'vc-icons-measurement-button-clear',
  verticalActionsAlign: 'center',
  hideInactiveActs: false,
  activeBgColor: '#e9e9e9',
  inactiveBgColor: '#ffffff',
  size: 'small'
} as const

// 点样式配置
const pointOpts = {
  show: true,
  color: '#ffffff',
  pixelSize: 8,
  outlineColor: '#ffa500',
  outlineWidth: 2,
  disableDepthTestDistance: Number.POSITIVE_INFINITY
} as const

// 线样式配置
const polylineOpts = {
  show: true,
  width: 2,
  material: 'yellow'
} as const

// 处理量算事件
const measureMouseEvt = (_e: any, _viewer: any) => {
  // console.log('e: ', e)
  // console.log('viewer: ', viewer)
}

const poiFormRef = ref<any>(null)

const measureDrawEvt = (e: any, _viewer: any) => {
  if (e.finished === true) {
    const [longitude, latitude, height] = toRaw(e.positionDegrees)

    // 弹出确认对话框
    ElMessageBox.confirm('是否要在此位置创建新的POI？', '提示', {
      confirmButtonText: '创建',
      cancelButtonText: '取消',
      type: 'info'
    }).then(() => {
      // 打开POI表单
      editingPoi.value = null
      poiFormVisible.value = true

      // 设置默认位置
      nextTick(() => {
        if (poiFormRef.value) {
          poiFormRef.value.setPosition({
            longitude: Number(longitude).toFixed(6),
            latitude: Number(latitude).toFixed(6),
            height: Number(height || 0).toFixed(2)
          })
        }
      })
    }).catch(() => {
      // 取消创建时清除测量点
      if (measurementsRef.value) {
        measurementsRef.value.clear()
      }
    })
  }
}

const locationIcon = 'data:image/svg+xml;base64,' + btoa(`
<svg t="1710420831144" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4286" width="32" height="32">
  <path d="M512 85.333333c-164.949333 0-298.666667 133.738667-298.666667 298.666667 0 164.949333 298.666667 554.666667 298.666667 554.666667s298.666667-389.717333 298.666667-554.666667c0-164.928-133.717333-298.666667-298.666667-298.666667z m0 448a149.333333 149.333333 0 1 1 0-298.666666 149.333333 149.333333 0 0 1 0 298.666666z" fill="#FFFFFF" p-id="4287"></path>
</svg>
`)

</script>

<style scoped>
.map-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  background-color: #fff;
  border-right: 1px solid #dcdfe6;
}

.menu {
  height: 100%;
}

.map-container {
  flex: 1;
  position: relative;
  height: 100%;
}

.map-container.with-sidebar {
  width: calc(100% - 200px);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.loading-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

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

/* 退出聚焦按钮样式 */
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
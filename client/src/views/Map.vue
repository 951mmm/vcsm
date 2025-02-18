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
      <el-aside v-if="userStore.isAdmin" width="200px" class="sidebar">
        <el-menu default-active="1" class="menu">
          <el-menu-item index="1" @click="poiDialogVisible = true">
            <el-icon>
              <Location />
            </el-icon>
            <span>修改POI</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

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

            <!-- POI点 -->
            <vc-entity v-for="poi in visiblePois" :key="poi.id" :position="[poi.longitude, poi.latitude, poi.height]"
              @click="handlePoiClick(poi)">
              <vc-graphics-point :pixelSize="10" :color="getPoiColor(poi.type)" />
            </vc-entity>

          </vc-viewer>

          <!-- 图例 -->
          <MapLegend v-model="visibleTypes" />
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

    <PoiForm v-if="userStore.isAdmin" v-model="poiFormVisible" :editing-poi="editingPoi"
      :default-position="mapConfig.whuPosition" @submit="handleSubmitPoi" />

    <!-- POI信息对话框 -->
    <PoiInfoDialog v-model="poiInfoVisible" :poi="selectedPoi" @focus="handleFocus" @close="handleCloseInfo" />
  </div>
</template>

<script setup>
import { ref, onMounted, shallowRef, computed, nextTick } from 'vue'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Location } from '@element-plus/icons-vue'
import PoiDialog from '../components/poi/PoiDialog.vue'
import PoiForm from '../components/poi/PoiForm.vue'
import PoiInfoDialog from '../components/poi/PoiInfoDialog.vue'
import { getPoiColor, poiTypeMap } from '../constants/poi'
import { usePoi } from '../composables/usePoi'
import { useMapConfig } from '../composables/useMapConfig'
import { usePoiInfo } from '../composables/usePoiInfo'
import MapLegend from '../components/map/MapLegend.vue'
// import type { PoiType } from '../constants/poi'

const router = useRouter()
const userStore = useUserStore()
const viewerRef = shallowRef(null)

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
const editingPoi = ref(null)

let isViewerReady = false


// 可见的POI类型
const visibleTypes = ref(['sport', 'education', 'transportation'])

// 过滤显示的POI
const visiblePois = computed(() => {
  return pois.value.filter(poi => visibleTypes.value.includes(poi.type))
})

// POI 信息相关
const {
  selectedPoi,
  poiInfoVisible,
  handlePoiClick,
  handleCloseInfo,
  focusOnPoi
} = usePoiInfo()

// 格式化坐标
const formatCoordinate = (value) => {
  const num = Number(value)
  return isNaN(num) ? '0.000000' : num.toFixed(6)
}

// 初始化
onMounted(async () => {
  await loadMapConfig()
  await loadPois()
})

// 视图准备完成
const onViewerReady = async ({ Cesium, viewer }) => {
  if (isViewerReady) return
  isViewerReady = true

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
}

// POI 操作处理
const handleEditPoi = (poi) => {
  editingPoi.value = poi
  poiFormVisible.value = true
}

const handleAddPoi = () => {
  editingPoi.value = null
  poiFormVisible.value = true
}

const handleDeletePoi = async (poi) => {
  try {
    await deletePoi(poi.id)
    ElMessage.success('删除成功')
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleSubmitPoi = async (formData) => {
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

// 处理聚焦
const handleFocus = (poi) => {
  focusOnPoi(poi, viewerRef.value)
}
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
</style>
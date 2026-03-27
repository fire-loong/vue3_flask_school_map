<template>
  <div class="cesium-container">
    <div v-if="loading" class="loading">正在加载建筑数据...</div>
    <div class="search-box">
      <input v-model="searchName" @keyup.enter="flyToBuilding" placeholder="搜索图书馆/信息楼/一田" />
      <button @click="flyToBuilding">搜索</button>
    </div>
    <div id="cesium-container" class="cesium-view"></div>
    <div v-if="showInfo" class="info-panel">
      <h3>{{ currentInfo.name }}</h3>
      <p>楼层：{{ currentInfo.floor }}</p>
      <p>教室数量：{{ currentInfo.classroomCount }}</p>
      <p>用途：{{ currentInfo.usage }}</p>
      <button @click="showInfo = false">关闭</button>
    </div>

    <div class="sidebar-toggle" :class="{ open: sidebarOpen }" @click="toggleSidebar">
      {{ sidebarOpen ? '〈' : '〉' }}
    </div>

    <div class="sidebar" :class="{ open: sidebarOpen }" @click.stop>
      <h3>建筑管理</h3>
      <div class="building-list">
        <div 
          v-for="building in buildings" 
          :key="building.name"
          class="building-item"
          :class="{ active: visibleBuildings.includes(building.name) }"
          @click="toggleBuilding(building.name)"
        >
          <span class="building-icon">🏢</span>
          <span>{{ building.name }}</span>
        </div>
      </div>
      <h3 style="margin-top: 20px;">路径导航</h3>
      <div class="navigation-box">
        <select v-model="startBuilding">
          <option value="">选择起点</option>
          <option v-for="b in buildings" :key="b.name" :value="b.name">{{ b.name }}</option>
        </select>
        <span class="arrow">→</span>
        <select v-model="endBuilding">
          <option value="">选择终点</option>
          <option v-for="b in buildings" :key="b.name" :value="b.name">{{ b.name }}</option>
        </select>
        <button @click="startNavigation" class="nav-btn" :disabled="!startBuilding || !endBuilding">
          开始导航
        </button>
        <button v-if="hasNavigation" @click="clearNavigation" class="clear-btn">
          清除路径
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import * as Cesium from 'cesium'
import { ref, onMounted, onUnmounted } from 'vue'
import { getBuildings } from '@/api'

let viewer = null
let entityMap = {}
let navigationEntities = []
let selectedEntity = null
const searchName = ref('')
const showInfo = ref(false)
const currentInfo = ref({})
const startBuilding = ref('')
const endBuilding = ref('')
const hasNavigation = ref(false)
const visibleBuildings = ref([])
const buildings = ref([])
const loading = ref(true)

const sidebarOpen = ref(false)
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleClickOutside = (e) => {
  if (sidebarOpen.value && !e.target.closest('.sidebar') && !e.target.closest('.sidebar-toggle')) {
    sidebarOpen.value = false
  }
}

onMounted(async () => {
  await loadBuildings()
  initCesium()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (viewer) viewer.destroy()
})

async function loadBuildings() {
  try {
    const res = await getBuildings()
    if (res.code === 1) {
      buildings.value = res.data
      visibleBuildings.value = buildings.value.map(b => b.name)
      console.log('建筑数据加载成功:', buildings.value.length, '条')
    } else {
      alert('加载建筑数据失败: ' + res.msg)
    }
  } catch (error) {
    console.error('加载建筑数据错误:', error)
    alert('加载建筑数据失败，请检查后端服务')
  } finally {
    loading.value = false
  }
}

function initCesium() {
  viewer = new Cesium.Viewer('cesium-container', {
    timeline: false,
    animation: false,
    baseLayerPicker: false,
    homeButton: false,
    geocoder: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    fullscreenButton: false,
    requestRenderMode: true,
    maximumScreenError: 0.5,
    infoBox: false,
    selectionIndicator: true,
  })

  const GAODE_KEY = '8db0af2b051302e84339c5213aa169ac'
  viewer.imageryLayers.removeAll()
  const gaodeSat = new Cesium.UrlTemplateImageryProvider({
    url: `https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}&key=${GAODE_KEY}`,
    subdomains: ['1', '2', '3', '4'],
    maximumLevel: 18
  })
  viewer.imageryLayers.addImageryProvider(gaodeSat)

  viewer.clock.shouldAnimate = false
  viewer.scene.screenSpaceCameraController.minimumZoomDistance = 100
  viewer.scene.screenSpaceCameraController.maximumZoomDistance = 2000
  viewer.cesiumWidget.creditContainer.style.display = 'none'

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(103.9885, 30.5819, 600),
    duration: 1.5
  })

  buildings.value.forEach(item => {
    const entity = viewer.entities.add({
      name: item.name,
      position: Cesium.Cartesian3.fromDegrees(item.longitude, item.latitude),
      model: { 
        uri: '/asia_building.glb', 
        scale: 0.2,
        color: Cesium.Color.WHITE,
        colorBlendMode: Cesium.ColorBlendMode.HIGHLIGHT,
        colorBlendAmount: 0.0
      },
      label: {
        text: item.name,
        font: '16px Microsoft YaHei',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        pixelOffset: new Cesium.Cartesian2(0, -40),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    })
    entityMap[item.name] = entity
  })

  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  handler.setInputAction((e) => {
    const res = viewer.scene.pick(e.position)
    if (Cesium.defined(res)) {
      const name = res.id.name
      const tar = buildings.value.find(b => b.name === name)
      if (tar) {
        if (selectedEntity && selectedEntity !== res.id) {
          selectedEntity.model.colorBlendAmount = 0.0
          selectedEntity.model.color = Cesium.Color.WHITE
        }
        
        selectedEntity = res.id
        res.id.model.color = Cesium.Color.fromCssColorString('#409eff')
        res.id.model.colorBlendAmount = 0.8
        
        viewer.selectedEntity = res.id
        currentInfo.value = tar
        showInfo.value = true
      }
    } else {
      closeAndDeselect()
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}

const flyToBuilding = () => {
  const tar = buildings.value.find(b => b.name.includes(searchName.value))
  if (tar) {
    viewer.camera.flyTo({ 
      destination: Cesium.Cartesian3.fromDegrees(tar.longitude, tar.latitude, 300), 
      duration: 1.2 
    })
  } else {
    alert('未找到')
  }
}

const closeAndDeselect = () => {
  showInfo.value = false
  viewer.selectedEntity = null
  if (selectedEntity) {
    selectedEntity.model.colorBlendAmount = 0.0
    selectedEntity.model.color = Cesium.Color.WHITE
    selectedEntity = null
  }
}

const toggleBuilding = (name) => {
  const index = visibleBuildings.value.indexOf(name)
  const entity = entityMap[name]
  
  if (index > -1) {
    visibleBuildings.value = visibleBuildings.value.filter(n => n !== name)
    entity.show = false
  } else {
    visibleBuildings.value = [...visibleBuildings.value, name]
    entity.show = true
  }
}

const startNavigation = () => {
  if (!startBuilding.value || !endBuilding.value) return
  clearNavigation()
  
  const start = buildings.value.find(b => b.name === startBuilding.value)
  const end = buildings.value.find(b => b.name === endBuilding.value)
  if (!start || !end) return
  
  const pathPoints = []
  const segments = 50
  const midLong = (start.longitude + end.longitude) / 2
  const midLat = (start.latitude + end.latitude) / 2
  const arcHeight = Math.max(start.height, end.height) + 150
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const mt = 1 - t
    const x = mt*mt*start.longitude + 2*mt*t*midLong + t*t*end.longitude
    const y = mt*mt*start.latitude + 2*mt*t*midLat + t*t*end.latitude
    const z = mt*mt*(start.height+20) + 2*mt*t*arcHeight + t*t*(end.height+20)
    pathPoints.push(Cesium.Cartesian3.fromDegrees(x, y, z))
  }
  
  const lineEntity = viewer.entities.add({
    polyline: {
      positions: pathPoints,
      width: 5,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.3,
        color: Cesium.Color.fromCssColorString('#409eff')
      })
    }
  })
  navigationEntities.push(lineEntity)
  
  const navPoint = viewer.entities.add({
    position: pathPoints[0],
    point: {
      pixelSize: 15,
      color: Cesium.Color.fromCssColorString('#ff6b6b'),
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 3
    }
  })
  navigationEntities.push(navPoint)
  
  let progress = 0
  const movePoint = () => {
    if (progress <= 1) {
      const idx = Math.floor(progress * segments)
      navPoint.position = pathPoints[Math.min(idx, segments)]
      progress += 0.005
      requestAnimationFrame(movePoint)
    }
  }
  movePoint()
  
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(start.longitude, start.latitude, 300),
    duration: 1.5,
    complete: () => {
      setTimeout(() => {
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(end.longitude, end.latitude, 300),
          duration: 3
        })
      }, 500)
    }
  })
  
  hasNavigation.value = true
}

const clearNavigation = () => {
  navigationEntities.forEach(e => viewer.entities.remove(e))
  navigationEntities = []
  hasNavigation.value = false
}
</script>

<style scoped>
.cesium-container { width: 100vw; height: 100vh; position: relative; }
.cesium-view { width: 100%; height: 100%; }
.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px 40px;
  border-radius: 8px;
  font-size: 16px;
}
.search-box {
  position: absolute;
  top: 60px;
  left: 46%;
  transform: translateX(-50%);
  z-index: 999;
  display: flex;
  gap: 10px;
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.search-box input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 200px;
}
.search-box button {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}
.search-box button:hover {
  background: #2563eb;
}
.info-panel {
  position: absolute;
  top: 120px;
  right: 20px;
  z-index: 999;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  min-width: 300px;
}
.info-panel h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid #3b82f6;
  padding-bottom: 10px;
}
.info-panel p {
  margin: 10px 0;
  color: #666;
  line-height: 1.6;
}
.info-panel button {
  margin-top: 15px;
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}
.info-panel button:hover {
  background: #dc2626;
}
.sidebar-toggle {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  z-index: 999;
  background: #1f2937;
  color: white;
  padding: 10px 5px;
  cursor: pointer;
  border-radius: 0 8px 8px 0;
  transition: all 0.3s;
}
.sidebar-toggle.open {
  left: 240px;
}
.sidebar {
  position: absolute;
  top: 0;
  left: -240px;
  width: 240px;
  height: 100%;
  background: #1f2937;
  color: white;
  z-index: 998;
  transition: all 0.3s;
  overflow-y: auto;
}
.sidebar.open {
  left: 0;
}
.sidebar h3 {
  padding: 20px;
  margin: 0;
  background: #111827;
  color: white;
  font-size: 16px;
}
.building-list {
  padding: 10px 0;
}
.building-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s;
}
.building-item:hover {
  background: #374151;
}
.building-item.active {
  background: #3b82f6;
}
.building-icon {
  font-size: 20px;
}
.navigation-box {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.navigation-box select {
  padding: 8px 12px;
  border: 1px solid #374151;
  border-radius: 4px;
  background: #374151;
  color: white;
  font-size: 14px;
}
.navigation-box select option {
  background: #1f2937;
  color: white;
}
.arrow {
  text-align: center;
  color: #9ca3af;
}
.nav-btn {
  padding: 10px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}
.nav-btn:hover:not(:disabled) {
  background: #059669;
}
.nav-btn:disabled {
  background: #6b7280;
  cursor: not-allowed;
}
.clear-btn {
  padding: 10px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}
.clear-btn:hover {
  background: #dc2626;
}
</style>
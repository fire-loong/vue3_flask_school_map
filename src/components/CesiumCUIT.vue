<template>
  <div class="cesium-container">
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
    <div class="sidebar">
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
import axios from 'axios'

// 连接你的 Flask 后端
const request = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 5000
})

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
const buildings = ref([]) // 数据从后端来

// 从 Flask + 数据库加载建筑
async function loadBuildings() {
  try {
    const res = await request.get('/api/buildings')
    console.log("✅ 从数据库读取建筑成功：", res.data)
    
    buildings.value = res.data
    visibleBuildings.value = buildings.value.map(b => b.name)
    
    // 数据加载完成 → 初始化 Cesium
    initCesium()
  } catch (err) {
    console.error("❌ 加载建筑数据失败", err)
  }
}

// Cesium 初始化（从后端取到数据才执行）
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

  // 根据数据库数据创建模型
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

  // 点击事件
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

onMounted(() => {
  loadBuildings() // 页面加载 → 读后端数据库
})

// 搜索飞行（调用后端接口）
const flyToBuilding = async () => {
  try {
    const res = await request.get('/api/building/search', {
      params: { name: searchName.value }
    })
    const tar = res.data
    if (tar) {
      viewer.camera.flyTo({ 
        destination: Cesium.Cartesian3.fromDegrees(tar.longitude, tar.latitude, 300), 
        duration: 1.2 
      })
    } else {
      alert('未找到')
    }
  } catch (err) {
    alert('查询失败')
  }
}

// 关闭信息
const closeAndDeselect = () => {
  showInfo.value = false
  viewer.selectedEntity = null
  if (selectedEntity) {
    selectedEntity.model.colorBlendAmount = 0.0
    selectedEntity.model.color = Cesium.Color.WHITE
    selectedEntity = null
  }
}

// 切换建筑显示隐藏
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

// 导航
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

onUnmounted(() => viewer && viewer.destroy())
</script>

<style scoped>
.cesium-container { width: 100vw; height: 100vh; position: relative; }
.cesium-view { width: 100%; height: 100%; }
.search-box { position: absolute; top: 20px; left: 50%; transform: translateX(-50%); z-index: 999; }
.search-box input { width: 380px; padding: 10px 15px; border-radius: 8px; border: none; outline: none; }
.search-box button { margin-left: 8px; padding: 10px 16px; background: #409eff; color: white; border: none; border-radius: 8px; cursor: pointer; }
.info-panel { position: absolute; top: 80px; right: 20px; width: 320px; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 15px rgba(0,0,0,0.2); z-index:999; }
.info-panel button { background: #f56c6c; color: white; border: none; padding: 6px 12px; border-radius:6px; cursor:pointer; }

.sidebar {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 280px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0,0,0,0.2);
  padding: 20px;
  z-index: 999;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

.sidebar h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
  border-bottom: 2px solid #409eff;
  padding-bottom: 10px;
}

.building-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.building-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.building-item:hover {
  background: #ecf5ff;
  transform: translateX(5px);
}

.building-item.active {
  background: #ecf5ff;
  border-color: #409eff;
}

.building-item.active .building-icon {
  color: #409eff;
}

.building-icon {
  font-size: 20px;
  transition: color 0.3s ease;
}

.navigation-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}

.navigation-box select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  outline: none;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.navigation-box select:focus {
  border-color: #409eff;
}

.navigation-box .arrow {
  text-align: center;
  color: #409eff;
  font-size: 18px;
  font-weight: bold;
}

.nav-btn {
  padding: 12px;
  background: linear-gradient(135deg, #409eff, #66b1ff);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.nav-btn:disabled {
  background: #c0c4cc;
  cursor: not-allowed;
}

.clear-btn {
  padding: 10px;
  background: #f56c6c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: #f78989;
}
</style>
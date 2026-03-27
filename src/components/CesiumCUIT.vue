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

const buildings = ref([
  {"name": "学生公寓3", "longitude": 103.9865, "latitude": 30.5805, "height": 22, "floor": 7, "classroomCount": 0, "usage": "学生住宿，提供标准宿舍，配备基础生活设施，如卫生间、阳台、空调等，满足学生日常生活需求"},
  {"name": "学生公寓4", "longitude": 103.9867, "latitude": 30.5807, "height": 20, "floor": 6, "classroomCount": 0, "usage": "学生住宿，提供标准宿舍，配备基础生活设施，如卫生间、阳台、空调等，满足学生日常生活需求"},
  {"name": "学生公寓5", "longitude": 103.9869, "latitude": 30.5809, "height": 23, "floor": 7, "classroomCount": 0, "usage": "学生住宿，提供标准宿舍，配备基础生活设施，如卫生间、阳台、空调等，满足学生日常生活需求"},
  {"name": "学生公寓6", "longitude": 103.9871, "latitude": 30.5811, "height": 19, "floor": 6, "classroomCount": 0, "usage": "学生住宿，提供标准宿舍，配备基础生活设施，如卫生间、阳台、空调等，满足学生日常生活需求"},
  {"name": "学生公寓7", "longitude": 103.9873, "latitude": 30.5813, "height": 21, "floor": 7, "classroomCount": 0, "usage": "学生住宿，提供标准宿舍，配备基础生活设施，如卫生间、阳台、空调等，满足学生日常生活需求"},
  {"name": "学生公寓8", "longitude": 103.9875, "latitude": 30.5815, "height": 24, "floor": 8, "classroomCount": 0, "usage": "学生住宿，提供标准宿舍，配备基础生活设施，如卫生间、阳台、空调等，满足学生日常生活需求"},
  {"name": "学生公寓9", "longitude": 103.9877, "latitude": 30.5817, "height": 22, "floor": 7, "classroomCount": 0, "usage": "学生住宿，提供标准宿舍，配备基础生活设施，如卫生间、阳台、空调等，满足学生日常生活需求"},
  {"name": "学生公寓10", "longitude": 103.9879, "latitude": 30.5819, "height": 20, "floor": 6, "classroomCount": 0, "usage": "学生住宿，提供标准宿舍，配备基础生活设施，如卫生间、阳台、空调等，满足学生日常生活需求"},
  {"name": "学生公寓11", "longitude": 103.9881, "latitude": 30.5804, "height": 23, "floor": 7, "classroomCount": 0, "usage": "学生住宿，提供标准宿舍，配备基础生活设施，如卫生间、阳台、空调等，满足学生日常生活需求"},
  {"name": "学生公寓12", "longitude": 103.9883, "latitude": 30.5806, "height": 19, "floor": 6, "classroomCount": 0, "usage": "学生住宿，提供标准宿舍，配备基础生活设施，如卫生间、阳台、空调等，满足学生日常生活需求"},
  {"name": "学生公寓13", "longitude": 103.9885, "latitude": 30.5808, "height": 21, "floor": 7, "classroomCount": 0, "usage": "学生住宿，提供标准宿舍，配备基础生活设施，如卫生间、阳台、空调等，满足学生日常生活需求"},
  {"name": "学生公寓14", "longitude": 103.9887, "latitude": 30.5810, "height": 24, "floor": 8, "classroomCount": 0, "usage": "学生住宿，提供标准宿舍，配备基础生活设施，如卫生间、阳台、空调等，满足学生日常生活需求"},
  {"name": "学生公寓15", "longitude": 103.9889, "latitude": 30.5812, "height": 22, "floor": 7, "classroomCount": 0, "usage": "学生住宿，提供标准宿舍，配备基础生活设施，如卫生间、阳台、空调等，满足学生日常生活需求"},
  {"name": "学生公寓16", "longitude": 103.9891, "latitude": 30.5814, "height": 20, "floor": 6, "classroomCount": 0, "usage": "学生住宿，提供标准宿舍，配备基础生活设施，如卫生间、阳台、空调等，满足学生日常生活需求"},
  {"name": "学生公寓17", "longitude": 103.9864, "latitude": 30.5816, "height": 23, "floor": 7, "classroomCount": 0, "usage": "学生住宿，提供标准宿舍，配备基础生活设施，如卫生间、阳台、空调等，满足学生日常生活需求"},
  {"name": "学生公寓1", "longitude": 103.9866, "latitude": 30.5818, "height": 19, "floor": 6, "classroomCount": 0, "usage": "学生住宿，提供标准宿舍，配备基础生活设施，如卫生间、阳台、空调等，满足学生日常生活需求"},
  {"name": "学生公寓2", "longitude": 103.9868, "latitude": 30.5820, "height": 21, "floor": 7, "classroomCount": 0, "usage": "学生住宿，提供标准宿舍，配备基础生活设施，如卫生间、阳台、空调等，满足学生日常生活需求"},
  {"name": "学生公寓19", "longitude": 103.9870, "latitude": 30.5803, "height": 24, "floor": 8, "classroomCount": 0, "usage": "学生住宿，提供标准宿舍，配备基础生活设施，如卫生间、阳台、空调等，满足学生日常生活需求"},
  {"name": "学生公寓20", "longitude": 103.9872, "latitude": 30.5805, "height": 22, "floor": 7, "classroomCount": 0, "usage": "学生住宿，提供标准宿舍，配备基础生活设施，如卫生间、阳台、空调等，满足学生日常生活需求"},
  {"name": "学生公寓21", "longitude": 103.9874, "latitude": 30.5807, "height": 20, "floor": 6, "classroomCount": 0, "usage": "学生住宿，提供标准宿舍，配备基础生活设施，如卫生间、阳台、空调等，满足学生日常生活需求"},
  {"name": "教学楼1", "longitude": 103.9876, "latitude": 30.5809, "height": 25, "floor": 6, "classroomCount": 42, "usage": "日常教学活动，包含普通教室、阶梯教室、多媒体教室，用于理论课程教学和学生自习"},
  {"name": "教学楼2", "longitude": 103.9878, "latitude": 30.5811, "height": 23, "floor": 5, "classroomCount": 38, "usage": "日常教学活动，包含普通教室、阶梯教室、多媒体教室，用于理论课程教学和学生自习"},
  {"name": "教学楼3", "longitude": 103.9880, "latitude": 30.5813, "height": 27, "floor": 7, "classroomCount": 48, "usage": "日常教学活动，包含普通教室、阶梯教室、多媒体教室，用于理论课程教学和学生自习"},
  {"name": "教学楼4", "longitude": 103.9882, "latitude": 30.5815, "height": 24, "floor": 6, "classroomCount": 40, "usage": "日常教学活动，包含普通教室、阶梯教室、多媒体教室，用于理论课程教学和学生自习"},
  {"name": "第一食堂", "longitude": 103.9884, "latitude": 30.5817, "height": 10, "floor": 2, "classroomCount": 0, "usage": "师生餐饮服务，提供早中晚餐，包含不同风味窗口，满足多样化饮食需求，配备就餐座位区"},
  {"name": "第二食堂", "longitude": 103.9886, "latitude": 30.5819, "height": 11, "floor": 3, "classroomCount": 0, "usage": "师生餐饮服务，提供早中晚餐，包含不同风味窗口，满足多样化饮食需求，配备就餐座位区"},
  {"name": "教师食堂", "longitude": 103.9888, "latitude": 30.5804, "height": 9, "floor": 2, "classroomCount": 0, "usage": "教师餐饮服务，提供营养套餐，环境舒适，满足教师就餐需求，配备专属服务设施"},
  {"name": "运动场", "longitude": 103.9890, "latitude": 30.5806, "height": 5, "floor": 1, "classroomCount": 0, "usage": "体育教学和课外活动，用于田径训练、球类运动、体能锻炼，配备相应运动设施"},
  {"name": "第一田径场", "longitude": 103.9892, "latitude": 30.5808, "height": 6, "floor": 1, "classroomCount": 0, "usage": "体育教学和课外活动，用于田径训练、球类运动、体能锻炼，配备相应运动设施"},
  {"name": "第二田径场", "longitude": 103.9863, "latitude": 30.5810, "height": 5, "floor": 1, "classroomCount": 0, "usage": "体育教学和课外活动，用于田径训练、球类运动、体能锻炼，配备相应运动设施"},
  {"name": "体育馆", "longitude": 103.9865, "latitude": 30.5812, "height": 18, "floor": 2, "classroomCount": 0, "usage": "室内体育活动，可举办体育比赛、健身训练，包含运动场地和配套服务设施"},
  {"name": "篮球场", "longitude": 103.9867, "latitude": 30.5814, "height": 4, "floor": 1, "classroomCount": 0, "usage": "体育教学和课外活动，用于田径训练、球类运动、体能锻炼，配备相应运动设施"},
  {"name": "图书馆", "longitude": 103.9892, "latitude": 30.5817, "height": 25, "floor": 6, "classroomCount": 50, "usage": "文献借阅和学习研究，收藏各类图书、期刊、电子资源，提供自习区、阅览室、研讨室"},
  {"name": "资环楼", "longitude": 103.9889, "latitude": 30.5818, "height": 22, "floor": 6, "classroomCount": 32, "usage": "资环楼教学与科研，包含专业实验室、实训场地、教师办公室，用于专业课程教学和科研项目开展"},
  {"name": "金工楼", "longitude": 103.9887, "latitude": 30.5819, "height": 20, "floor": 5, "classroomCount": 28, "usage": "金工楼教学与科研，包含专业实验室、实训场地、教师办公室，用于专业课程教学和科研项目开展"},
  {"name": "探测楼", "longitude": 103.9885, "latitude": 30.5820, "height": 23, "floor": 6, "classroomCount": 35, "usage": "探测楼教学与科研，包含专业实验室、实训场地、教师办公室，用于专业课程教学和科研项目开展"},
  {"name": "气象楼", "longitude": 103.9883, "latitude": 30.5803, "height": 21, "floor": 5, "classroomCount": 30, "usage": "气象楼教学与科研，包含专业实验室、实训场地、教师办公室，用于专业课程教学和科研项目开展"},
  {"name": "笃学楼", "longitude": 103.9881, "latitude": 30.5805, "height": 24, "floor": 6, "classroomCount": 38, "usage": "笃学楼教学与科研，包含专业实验室、实训场地、教师办公室，用于专业课程教学和科研项目开展"},
  {"name": "实验楼", "longitude": 103.9879, "latitude": 30.5807, "height": 22, "floor": 5, "classroomCount": 33, "usage": "实验楼教学与科研，包含专业实验室、实训场地、教师办公室，用于专业课程教学和科研项目开展"},
  {"name": "信息楼", "longitude": 103.9890, "latitude": 30.5820, "height": 20, "floor": 5, "classroomCount": 35, "usage": "信息楼教学与科研，包含专业实验室、实训场地、教师办公室，用于专业课程教学和科研项目开展"},
  {"name": "行政办公楼", "longitude": 103.9877, "latitude": 30.5809, "height": 18, "floor": 5, "classroomCount": 0, "usage": "行政办公和管理服务，包含各职能部门办公室、会议室、接待区，处理学校行政事务和对外服务"},
  {"name": "新气象楼", "longitude": 103.9875, "latitude": 30.5811, "height": 20, "floor": 6, "classroomCount": 0, "usage": "行政办公和管理服务，包含各职能部门办公室、会议室、接待区，处理学校行政事务和对外服务"},
  {"name": "双中心", "longitude": 103.9873, "latitude": 30.5813, "height": 16, "floor": 4, "classroomCount": 0, "usage": "双中心教学与科研，包含专业实验室、实训场地、教师办公室，用于专业课程教学和科研项目开展"}
])

const sidebarOpen = ref(false)
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleClickOutside = (e) => {
  if (sidebarOpen.value && !e.target.closest('.sidebar') && !e.target.closest('.sidebar-toggle')) {
    sidebarOpen.value = false
  }
}

onMounted(() => {
  visibleBuildings.value = buildings.value.map(b => b.name)
  initCesium()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (viewer) viewer.destroy()
})

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
.search-box {
  position: absolute;
  top: 60px;
  left: 46%;
  transform: translateX(-50%);
  z-index: 999;
  display: flex;
  align-items: stretch;
  gap: 0;
}
.search-box input {
  width: 420px;
  padding: 0 24px;
  height: 48px;
  border-radius: 50px 0 0 50px;
  border: none;
  outline: none;
  font-size: 15px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}
.search-box input:focus {
  background: #fff;
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.25);
  transform: translateY(-1px);
}
.search-box button {
  padding: 0 28px;
  height: 48px;
  background: linear-gradient(135deg, #409eff, #51a5ff);
  color: white;
  border: none;
  border-radius: 0 50px 50px 0;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}
.search-box button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(64, 158, 255, 0.4);
  background: linear-gradient(135deg, #59a6ff, #6bb8ff);
}
.search-box button:active {
  transform: translateY(0);
}
.info-panel { position: absolute; top: 80px; right: 20px; width: 320px; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 15px rgba(0,0,0,0.2); z-index:999; }
.info-panel button { background: #f56c6c; color: white; border: none; padding: 6px 12px; border-radius:6px; cursor:pointer; }

.sidebar-toggle {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 60px;
  background: rgba(255,255,255,0.9);
  border-radius: 0 8px 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}
.sidebar-toggle.open {
  left: calc(20px + 280px);
  border-radius: 8px 0 0 8px;
}

.sidebar {
  position: absolute;
  top: 20px;
  left: -300px;
  width: 280px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0,0,0,0.2);
  padding: 20px;
  z-index: 999;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  transition: left 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.sidebar.open {
  left: 20px;
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

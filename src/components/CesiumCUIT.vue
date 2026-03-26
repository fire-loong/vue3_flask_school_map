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
  </div>
</template>

<script setup>
import * as Cesium from 'cesium'
import { ref, onMounted, onUnmounted } from 'vue'

let viewer = null
const searchName = ref('')
const showInfo = ref(false)
const currentInfo = ref({})

const buildings = [
  { name: '图书馆', longitude: 103.9892, latitude: 30.5817, height: 25, floor: 6, classroomCount: 50, usage: '自习、借阅、学习' },
  { name: '信息楼', longitude: 103.9890, latitude: 30.5820, height: 20, floor: 5, classroomCount: 35, usage: '计算机教学、实验室' },
  { name: '一田', longitude: 103.9863, latitude: 30.5803, height: 5, floor: 1, classroomCount: 0, usage: '运动、活动' }
]

onMounted(() => {
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
    maximumScreenSpaceError: 0.5,

    // 关键：只关 infoBox，开 selectionIndicator
    infoBox: false,
    selectionIndicator: true, // 强制开启小眼睛
  })

  // 强制显示 selectionIndicator 控件
  viewer.selectionIndicator.container.style.visibility = 'visible'
  viewer.selectionIndicator.container.style.zIndex = 9999

  // 高德卫星图
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

  // 加载模型
  buildings.forEach(item => {
    viewer.entities.add({
      name: item.name,
      position: Cesium.Cartesian3.fromDegrees(item.longitude, item.latitude),
      model: { uri: '/asia_building.glb', scale: 0.2 },
      label: { 
        text: item.name, 
        font: '16px Microsoft YaHei', 
        fillColor: Cesium.Color.WHITE, 
        outlineColor: Cesium.Color.BLACK,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      }
    })
  })

  // 点击事件
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  handler.setInputAction((e) => {
    const res = viewer.scene.pick(e.position)
    if (Cesium.defined(res)) {
      const name = res.id.name
      const tar = buildings.find(b => b.name === name)
      if (tar) {
        currentInfo.value = tar
        showInfo.value = true
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
})

const flyToBuilding = () => {
  const tar = buildings.find(b => b.name === searchName.value)
  if (tar) {
    viewer.camera.flyTo({ 
      destination: Cesium.Cartesian3.fromDegrees(tar.longitude, tar.latitude, 300), 
      duration: 1.2 
    })
  } else {
    alert('未找到')
  }
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
</style>
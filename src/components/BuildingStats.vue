<template>
  <div class="stats-page">
    <div class="stats-container">
      <h2>校园建筑数据统计分析</h2>

      <!-- ECharts 图表容器 -->
      <div class="chart-wrapper">
        <div ref="pieChartRef" class="chart-box"></div>
      </div>

      <!-- 数据统计卡片 -->
      <div class="info-cards">
        <div class="card" v-for="(item, index) in statsData" :key="index">
          <h4>{{ item.name }}</h4>
          <p class="count">{{ item.value }} 栋</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import * as echarts from 'echarts'
import axios from 'axios'

const pieChartRef = ref(null)
let pieChart = null

// 建筑列表（从后端获取）
const buildings = ref([])
const request = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 5000
})

// 加载建筑数据
async function loadBuildings() {
  try {
    const res = await request.get('/api/buildings')
    buildings.value = res.data
    initChart()
  } catch (err) {
    console.error('获取数据失败', err)
  }
}

// 自动统计类型分布
const statsData = computed(() => {
  const typeMap = {}
  buildings.value.forEach(b => {
    let type = '其他'
    if (b.name.includes('公寓')) type = '学生公寓'
    else if (b.name.includes('教学楼')) type = '教学楼'
    else if (b.name.includes('食堂')) type = '食堂'
    else if (b.name.includes('图书馆')) type = '图书馆'
    else if (b.name.includes('楼') || b.name.includes('中心')) type = '办公楼/实验楼'

    typeMap[type] = (typeMap[type] || 0) + 1
  })

  return Object.entries(typeMap).map(([name, value]) => ({ name, value }))
})

// 初始化饼图
function initChart() {
  if (!pieChartRef.value) return
  pieChart = echarts.init(pieChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 栋 ({d}%)'
    },
    legend: {
      top: 'bottom',
      textStyle: { fontSize: 14 }
    },
    color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#C678DD'],
    series: [
      {
        name: '建筑类型',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '42%'],
        data: statsData.value,
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          fontSize: 13
        }
      }
    ]
  }

  pieChart.setOption(option)
  window.addEventListener('resize', () => pieChart.resize())
}

onMounted(() => {
  loadBuildings()
})
</script>

<style scoped>
.stats-page {
  width: 100%;
  min-height: 100vh;
  background: #f5f7fa;
  padding: 30px 20px;
  box-sizing: border-box;
}

.stats-container {
  max-width: 1000px;
  margin: 0 auto;
}

.stats-container h2 {
  text-align: center;
  font-size: 24px;
  color: #333;
  margin-bottom: 30px;
}

/* 图表 */
.chart-wrapper {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.chart-box {
  width: 100%;
  height: 460px;
}

/* 统计卡片 */
.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.card {
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card h4 {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #666;
}

.count {
  font-size: 22px;
  font-weight: bold;
  color: #409eff;
  margin: 0;
}
</style>
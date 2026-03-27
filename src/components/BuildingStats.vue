<template>
  <div class="stats-page">
    <div class="stats-container">
      <h2>校园建筑数据统计分析</h2>

      <div class="chart-wrapper">
        <div ref="pieChartRef" class="chart-box"></div>
      </div>

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

const pieChartRef = ref(null)
let pieChart = null

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
  initChart()
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

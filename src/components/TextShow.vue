<template>
  <div class="text-container">
    <h1>校园建筑信息表</h1>

    <!-- el-table 表格 -->
    <el-table :data="buildingList" border style="width: 100%">
      <el-table-column label="建筑名称" prop="name" />
      <el-table-column label="经度" prop="longitude" />
      <el-table-column label="纬度" prop="latitude" />
      <el-table-column label="高度" prop="height" />
      <el-table-column label="楼层" prop="floor" />
      <el-table-column label="说明" prop="usage" />
    </el-table>
  </div>
</template>

<script setup>
// 直接把 Flask 里的 43 条建筑数据拿来用
const buildingList = [
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
]
</script>

<style scoped>
.text-container {
  padding: 30px;
  height: 100%;
  box-sizing: border-box;
}

.text-container h1 {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}
</style>
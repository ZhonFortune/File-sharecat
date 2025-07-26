<template>
  <a-space direction="vertical" :style="{ width: '100%' }" size="large">
    <!-- 欢迎语 -->
    <a-flex style="text-align: left; padding: 20px 20px;" vertical>
      <h2>欢迎回来，管理员</h2>
      <p style="color: #888">这是您的仪表盘首页,您可以在此处看到统计信息</p>
    </a-flex>

    <!-- 统计信息 -->
    <a-row gutter="16" justify="space-around" align="middle">
      <a-col :span="6">
        <a-statistic title="公共资源总数" :value="publicResourceNum" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="私密资源总数" :value="tokenResourceNum" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="标签组 / 标签总数" :value="labelNum" />
      </a-col>
    </a-row>

    <!-- 版本更新日志 -->
    <a-card title="版本更新日志" style="margin-top: 20px; text-align: left;">
      <a-timeline>
        <a-timeline-item v-for="(item, index) in announcements" :key="index">
          {{ item }}
        </a-timeline-item>
      </a-timeline>
    </a-card>

  </a-space>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API_URL = BACKEND_URL + '/api/v1';

let labelNum = ref(0);
let publicResourceNum = ref(0);
let tokenResourceNum = ref(0);

function getResourceNum() {
  axios.get(API_URL + '/resource/getnum').then((response) => {
    publicResourceNum.value = response.data.data.publicNum;
    tokenResourceNum.value = response.data.data.tokenNum;
  }).catch((error) => {
    console.error(error);
  });
}

function getLabelNum() {
  axios.get(API_URL + '/label/getnum').then((response) => {
    labelNum.value = response.data.data.groupCount + ' / ' + response.data.data.labelCount;
  }).catch((error) => {
    console.error(error);
  });
}

onMounted(() => {
  getResourceNum()
  getLabelNum()
})
const announcements = [
  'Beta 0.1.0 - 新增对象存储环境变量',
]
</script>

<style scoped>
a-card {
  transition: all 0.3s ease;
}
a-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style>

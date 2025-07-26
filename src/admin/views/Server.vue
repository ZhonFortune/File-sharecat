<template>
  <a-space direction="vertical" size="large" style="width: 100%; text-align: left;">
    <!-- 标题 -->
    <a-typography-title :level="4">部署面板</a-typography-title>

    <!-- 基本信息 -->
    <a-card title="基本信息" style="border: none; box-shadow: none;">
      <a-descriptions bordered :column="2">
        <a-descriptions-item label="当前环境">{{ basic.env }}</a-descriptions-item>
        <a-descriptions-item label="主机">{{ basic.host }}</a-descriptions-item>
        <a-descriptions-item label="端口">{{ basic.port }}</a-descriptions-item>
        <a-descriptions-item label="域名">{{ basic.domain }}</a-descriptions-item>
      </a-descriptions>
    </a-card>

    <!-- 数据库信息 -->
    <a-card title="数据库信息" style="border: none; box-shadow: none;">
      <a-descriptions bordered :column="1">
        <a-descriptions-item label="MongoDB数据库">{{ db.mongo }}</a-descriptions-item>
        <a-descriptions-item label="对象存储数据库">{{ db.objectStore }}</a-descriptions-item>
      </a-descriptions>
    </a-card>
  </a-space>
</template>

<script setup lang="js">
import { reactive } from 'vue'

// 模拟数据，建议在实际开发中通过后端 API 获取
const basic = reactive({
  env: import.meta.env.MODE === 'development' ? '开发环境' : '生产环境',
  host: location.hostname,
  port: location.port || '80',
  domain: location.origin,
})

const db = reactive({
  mongo: 'N/A',
  objectStore: 'N/A',
})
</script>

<style scoped lang="css">
</style>

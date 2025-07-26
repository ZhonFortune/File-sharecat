<template>
  <a-flex style="padding: 20px 40px; padding-bottom: 0px; height: 100vh" gap="large">
    <!-- 左侧输入区域 -->
    <a-flex vertical style="width: 280px;" justify="flex-start">
      <a-typography-title :level="5" style="text-align: left; margin-top: 150px;" >请输入TOKEN</a-typography-title>
      <a-input
        v-model:value="inputToken"
        placeholder="输入访问TOKEN"
        allow-clear
        style="width: 100%; margin-top: 40px; height: 40px; border-radius: 15px;"
      />
      <a-button type="primary" style="margin-top: 10px; height: 30px;" @click="submitToken">
        获取
      </a-button>
      <a-button type="link" style="padding: 10px 0; font-size: 0.8rem; text-align: left;"
       @click="openFAQdialog">
      如何获取TOKEN?</a-button>
    </a-flex>

    <!-- 右侧内容区 -->
    <a-flex
      style="flex: 1;"
      align="center"
      justify="center"
      :style="{ background: '#fff', borderRadius: '15px'}"
    >
      <a-card v-if="resource" class="content-card" :bordered="true">
        <a-flex vertical align="flex-start">
          <h3 style="margin-top: 20px; font-size: 1.2rem;">{{ resource.title }}</h3>
          <p style="margin-top: 5px; font-size: 0.8rem; color: #999; text-align: left;">{{ resource.desc }}</p>

          <a-flex style="margin-top: 30px; margin-bottom: 20px;" wrap>
            <a-tag v-for="tag in resource.tag" :key="tag">{{ tag }}</a-tag>
          </a-flex>

          <a-flex vertical justify="center" align="flex-start" style="margin-bottom: 5px;">
            <a-span style="color: gray; font-size: 0.8rem; padding: 0;"
            >更新时间：{{ resource.time }}</a-span>
            <a-span style="color: gray; font-size: 0.8rem; padding: 0;"
            >过期时间：{{ resource.timeout }}</a-span>
            <a-span style="color: gray; font-size: 0.8rem; padding: 0;">大小：{{ resource.size }}</a-span>
          </a-flex>

          <a-tooltip :title=" '点击下载' + ' ' + resource.title + ' ( ' + resource.size + ' )'" placement="bottom">
            <a-button type="primary" style="margin-top: 20px; height: 40px;" @click="downloadResource(resource.download)">
              下载资源
            </a-button>
          </a-tooltip>
        </a-flex>
      </a-card>

      <a-empty v-else :description="emptyDescription" />

    </a-flex>
  </a-flex>

  <a-modal :open="faqVisible" title="如何获取 TOKEN" @cancel="closeFAQdialog">
    <template #default>
        <p>本项目为文件分享工具,内置公共资源模块和私人访问模块,私人访问模块需要TOKEN来打开特定的资源.</p>
        <p>在部署方(管理员)将资源上传至私人访问模块时会立刻生成TOKEN,部署方(管理员)可以通过分享该TOKEN以使他人访问特定资源</p>
        <p>因此您只能通过他人分享的方式拿到TOKEN,当然您以可以分享您自己的资源.但需要您自行部署本项目</p>
        <a-button type="link" href="https://github.com/ZhonFortune/file-sharecat" target="_blank"
         style="padding: 40px 0px;"
        >项目地址</a-button>
    </template>

    <template #footer style="height: 35px;" >
      <a-button type="primary" @click="closeFAQdialog">确定</a-button>
    </template>
  </a-modal>

</template>

<script setup lang="js">
import { ref } from 'vue'
import axios from 'axios'
import { message } from 'ant-design-vue'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''
const API_URL = `${BACKEND_URL}/api/v1`

const resource = ref(null)
const faqVisible = ref(false)
const inputToken = ref('')
const emptyDescription = ref('请输入TOKEN')

// console.log(resource.value)

const openFAQdialog = () => {
  faqVisible.value = true
}

const closeFAQdialog = () => {
  faqVisible.value = false
}

const submitToken = () => {
  const reqToken = inputToken.value
  if(!reqToken) {
    message.error('请输入TOKEN')
    return false
  }

  axios.get(`${API_URL}/resource/tokenget?token=${reqToken}`).then((res) => {
    if(res.data.msg == '资源不存在'){
      emptyDescription.value = '资源不存在'
      message.error('资源不存在')
      return false
    }

    if(res.data.msg == '资源已过期'){
      emptyDescription.value = '资源已过期'
      message.error('资源已过期')
      return false
    }

    message.success('资源已成功加载')

    resource.value = res.data.data[0]

  }).catch((err) => {
    console.log(err)
  })
}
</script>

<style scoped>
.content-card {
  width: 100%;
  padding: 20px 40px;
  padding-bottom: 0px;
  height: auto;
  border: none;
}
</style>

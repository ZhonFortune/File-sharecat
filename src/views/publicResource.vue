<template>
  <a-flex justify="space-between" align="flex-start" gap="small">

    <!-- 标签栏 -->
    <a-flex vertical justify="flex-start" gap="small" class="option-full">
      <a-slot style="padding: 10px 0px;" v-for="Item in optionGroup" :id="Item._id" :key="Item._id">
        <a-divider style="font-size: 0.8rem; padding: 0 20px; padding-bottom: 10px;">{{ Item.title }}</a-divider>
        <a-checkbox-group class="checkbox-group">
          <a-flex vertical justify="flex-start" gap="small">
            <a-checkbox @change="handleFilterLable" :value="Item.title" :id="Item.id" v-for="Item in Item.options"
              :key="Item.id">{{ Item.title }}</a-checkbox>
          </a-flex>
        </a-checkbox-group>
      </a-slot>
    </a-flex>

    <!-- 资源栏 -->
    <a-flex gap="small" class="content" vertical>
      <!-- 搜索 -->
      <a-flex class="content-header" :justify="!isMobile ? 'flex-end' : 'center'" align="center">
        <!-- 宽度足够时使用侧边栏分类器 -->
        <a-flex v-if="!isMobile" justify="flex-end" align="center">
          <a-input placeholder="搜索资源" style="width: 250px;" @pressEnter="handleSearch" v-model:value="searchValue" />
          <a-button type="primary" @click="handleSearch" shape="circle" :icon="h(SearchOutlined)"
            style="margin-left: 20px;" />
        </a-flex>

        <!-- 宽度不足时 -->
        <a-flex v-else vertical justify="center" align="center">
          <a-input placeholder="搜索资源" style="width: 300px;" />
          <a-button type="primary" :icon="h(SearchOutlined)" @click="handleSearch"
            style="margin-top: 10px; margin-bottom: 25px;">搜索</a-button>
          <a-checkbox-group class="checkbox-group-collapse" v-for="Item in optionGroup" :key="Item.id"
            v-model:value="filterLabelChecked">
            <a-flex justify="flex-start" gap="small" wrap="wrap">
              <a-text style="font-size: 0.8rem; font-weight: bold;">{{ Item.title }}</a-text>
              <a-checkbox v-for="Item in Item.options" @change="handleFilterLable" :value="Item.title" :id="Item.id">{{
                Item.title }}</a-checkbox>
            </a-flex>
          </a-checkbox-group>
        </a-flex>
      </a-flex>

      <a-divider style="font-size: 0.9rem; padding: 20px 40px; padding-bottom: 10px;">资源列表</a-divider>

      <!-- 资源展示 -->
      <div style="width: 100%; min-height: 300px;">
        <div v-if="loading" class="custom-loading-wrapper">
          <div class="custom-spinner"></div>
        </div>
        <template v-else-if="resourceList.length === 0">
          <a-empty description="暂无资源" style="width: 100%; padding: 80px 40px; margin: 0;" />
        </template>
        <div class="grid-wrapper" v-else>
          <template v-if="Array.isArray(resourceListView) && resourceListView.length > 0">
            <div class="item-card" v-for="Item in resourceListView" :key="Item._id">
              <a-card :bordered="true">
                <a-card-meta :title="Item.title" :description="Item.desc"
                  style="text-align: left; margin-bottom: 40px;" />
                <a-flex align="center" style="margin-bottom: 15px;">
                  <a-tag v-for="tag in Item.tags" :key="tag" :color="tagProps.color">{{ tag }}</a-tag>
                </a-flex>
                <a-flex>
                  <a-button type="default" size="small" style="width: 100%; font-size: 0.8rem;"
                    @click="itemDetail(Item)">详细</a-button>
                  <a-button type="primary" size="small"
                    style="width: 100%; margin-left: 10px; font-size: 0.8rem" @click="downloadFile(Item)"
                  >
                    下载
                  </a-button>
                </a-flex>
              </a-card>
            </div>
          </template>
        </div>
      </div>

    </a-flex>

    <a-modal :open="cardDetailDialogVisible" class="item-detail" :footer="null"
      @cancel="cardDetailDialogVisible = false" title="资源详情">
      <div v-if="currentItem" style="padding: 0 20px 40px 20px">
        <h3 style="margin-top: 40px; font-size: 1.2rem;">{{ currentItem.title }}</h3>
        <p style="margin-top: 5px; font-size: 0.8rem; color: #999">{{ currentItem.desc }}</p>
        <a-flex style="margin-top: 50px; margin-bottom: 25px;" wrap>
          <a-tag v-for="tag in currentItem.tags" :key="tag">{{ tag }}</a-tag>
        </a-flex>
        <a-flex vertical justify="center" align="flex-start" style="margin-bottom: 5px;">
          <a-span style="color: gray; font-size: 0.8rem;">上传时间：{{ currentItem.time }}</a-span>
          <a-span style="color: gray; font-size: 0.8rem;">大小：{{ currentItem.size }}</a-span>
        </a-flex>
        <a-button type="link" @click="downloadFile(currentItem)"
          style="padding: 0;"
        >下载资源 - {{ currentItem.title }} - {{ currentItem.size }}</a-button>
      </div>
    </a-modal>
  </a-flex>

  <BackTop />
</template>

<script setup lang="js">
import { h, ref, onMounted, onUnmounted } from 'vue';
import BackTop from '@/components/BackTop.vue';
import { SearchOutlined } from '@ant-design/icons-vue';
import { tagProps } from 'ant-design-vue/es/tag';
import axios from 'axios';
import { message } from 'ant-design-vue';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''
const API_URL = `${BACKEND_URL}/api/v1`

const optionGroup = ref([])
const cardDetailDialogVisible = ref(false)
const resourceList = ref([])

const resourceListView = ref([])
const pageSize = 20
const loadedCount = ref(0)
const currentItem = ref(null)

const currentFilterLabel = ref([])
const filterLabelChecked = ref([])
const searchValue = ref('')

const isMobile = ref(false)
const loading = ref(true)

// 监听窗口大小变化
const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

// 标签过滤
const handleFilterLable = (e) => {
  const title = e.target.value
  const checked = e.target.checked
  if (checked) {
    currentFilterLabel.value.push(title)
  } else {
    const index = currentFilterLabel.value.indexOf(title)
    currentFilterLabel.value.splice(index, 1)
  }

  getResourceList(currentFilterLabel.value.length > 0 ? currentFilterLabel.value : null, 'tag')
}

// 获取标签组
function getOptionGroup() {
  axios.get(`${API_URL}/label/get`)
    .then((response) => {
      optionGroup.value = response.data.data
    })
    .catch((error) => {
      console.log(error)
    })
}

// 获取资源列表
function getResourceList(FilterArray, FilterType) {
  loading.value = true

  let filterSet
  if (FilterType == 'tag') {
    filterSet = FilterArray?.join(',') ?? ''
  } else {
    filterSet = FilterArray ?? ''
  }

  const url = FilterArray?.length > 0
    ? `${API_URL}/resource/publicget?&type=${FilterType}&filter=${filterSet}`
    : `${API_URL}/resource/publicget`

  axios.get(url)
    .then((response) => {
      const result = response.data.data
      resourceList.value = result
      resourceListView.value = []
      loadedCount.value = 0
      lazyLoadResourceList()
    })
    .catch((error) => {
      console.log(error)
    })
    .finally(() => {
      loading.value = false
    })
}

// 懒加载资源列表
function lazyLoadResourceList() {
  const nextBatch = resourceList.value.slice(loadedCount.value, loadedCount.value + pageSize)
  resourceListView.value.push(...nextBatch)
  loadedCount.value += nextBatch.length
}

// 滚动事件处理
function handleScroll() {
  const scrollContainer = document.documentElement
  const scrollTop = scrollContainer.scrollTop
  const clientHeight = scrollContainer.clientHeight
  const scrollHeight = scrollContainer.scrollHeight
  const bottomDistance = scrollHeight - (scrollTop + clientHeight)

  if (bottomDistance < 100 && loadedCount.value < resourceList.value.length) {
    lazyLoadResourceList()
  }
}

const itemDetail = (item) => {
  currentItem.value = item
  cardDetailDialogVisible.value = true
}

const handleSearch = () => {
  if (searchValue.value == '') {
    getResourceList()
  } else {
    getResourceList(searchValue.value, 'title')
  }
}

// 下载文件
const downloadFile = (item) => {
  const hide = message.loading('正在下载...', 0)
  
  const modal = 'public'
  axios.post(`${API_URL}/resource/reqdownload`, {
    modal: modal,
    key: item.filekey
  }).then((res) => {
    if( res.data.code == 200 ) {
      const downloadUrl = `${API_URL}/resource/download?token=${res.data.data.token}&title=${item.title}`
      window.location.href = downloadUrl
    } else {
      message.error('请求下载失败: ' + res.data.msg)
    }
  }).catch((error) => {
    console.log(error)
  }).finally(() => {
    hide()
    message.success('完成')
  })
}

// 挂载初始化
onMounted(() => {
  getOptionGroup()
  getResourceList()
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll)
  handleResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.option-full {
  padding: 10px 10px 20px 10px;
  width: 220px;
  margin: 20px 0 0 40px;
  border-radius: 15px;
  min-height: 250px;
  background-color: #fff;
}

.content {
  flex: 1;
  min-height: 100vh;
  margin-top: 20px;
  margin-right: 40px;
  margin-left: 20px;
  border-radius: 15px;
  background-color: #fff;
}

.checkbox-group {
  text-align: left;
  justify-content: flex-start;
  display: flex;
  padding: 20px 20px;
  padding-bottom: 0px;
}

.checkbox-group-collapse {
  width: 100%;
  text-align: left;
  display: flex;
  justify-content: flex-start;
  padding: 10px 20px;
}

.content-header {
  padding: 20px 40px;
  padding-bottom: 0px;
}

.grid-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px 40px;
}

.item-card {
  display: flex;
  height: 100%;
}

.custom-loading-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 150px 0;
}

.custom-spinner {
  width: 36px;
  height: 36px;
  border: 4px solid #2b2b2b;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.8s linear infinite;
  box-sizing: border-box;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media screen and (max-width: 920px) {
  .item-card {
    width: 100%;
  }
}

@media screen and (max-width: 768px) {
  .option-full {
    display: none;
  }

  .content {
    margin: 0px auto;
    margin-top: 30px;
    /* padding: 20px 40px; */
    /* margin-right: 20px; */
  }
}
</style>

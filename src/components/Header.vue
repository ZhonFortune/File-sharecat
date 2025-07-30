<template>
  <!-- PC 端布局 -->
  <a-flex
    v-if="!isMobile"
    justify="flex-start"
    align="center"
    :style="{ width: '100%', background: '#fff' }"
    gap="default"
  >
    <a-flex align="center">
      <a-text class="title">FILE-SHARECAT</a-text>
    </a-flex>
    <a-divider type="vertical" style="height: 30px;" />
    <a-flex flex="0">
      <a-menu
        mode="horizontal"
        :items="menuItem"
        v-model:selectedKeys="current"
        @select="handleSelect"
        :style="{ padding: '0 10px', margin: '0px' }"
      />
    </a-flex>
  </a-flex>

  <!-- 移动端布局 -->
  <a-flex
    v-else
    justify="space-between"
    align="center"
    :style="{ width: '100%', background: '#fff', padding: 'env(safe-area-inset-top, 10px) 20px 10px'}"
  >
    <div style="width: 32px;" />
    <a-text class="mobile-title">FILE-SHARECAT</a-text>
    <a-button type="text" @click="drawerVisible = true" :icon="h(MenuOutlined)" />
  </a-flex>

  <!-- 抽屉菜单 -->
  <a-drawer
    placement="left"
    :open="drawerVisible"
    @close="drawerVisible = false"
    title="导航菜单"
  >
    <a-menu
      mode="vertical"
      :items="menuItem"
      v-model:selectedKeys="current"
      @select="onMobileSelect"
    />
  </a-drawer>
</template>

<script setup lang='js'>
import { ref, h, onMounted, onUnmounted , watch} from 'vue'
import { useRouter , useRoute } from 'vue-router'
import { MenuOutlined } from '@ant-design/icons-vue'

const current = ref(['publicResource'])
const drawerVisible = ref(false)
const isMobile = ref(false)

const menuItem = [
  {
    key: 'publicResource',
    label: '公开资源',
    name: 'publicResource',
    path: '/'
  },
  {
    key: 'tokenDownload',
    label: '口令下载',
    name: 'tokenDownload',
    path: '/tload'
  }
]

const router = useRouter()
const route = useRoute()

const handleSelect = ({ key }) => {
  const item = menuItem.find(i => i.key === key)
  if (item) {
    router.push({ name: item.name })
  }
}

const onMobileSelect = (e) => {
  handleSelect(e)
  drawerVisible.value = false
}

// 导航显示选择为当前路由
const updateMenuSelected = (route) => {
  // 选择当前路径与菜单项匹配的菜单项
  const item = menuItem.find(i => i.name === route.name)
  // console.log(item)
  if (item) {
    current.value = [item.key]
  }else {
    current.value = []
  }
}

// 响应式窗口监听
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

watch(
  () => route.name,
  () => updateMenuSelected(route),
  { immediate: true }
)

onMounted(() => {
  checkMobile()
  updateMenuSelected(route)
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

</script>

<style scoped lang='css'>
.title {
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  padding: 0 40px;
  padding-right: 25px;
}

.mobile-title {
  line-height: auto;
  font-size: 1rem;
  font-weight: 500;
  margin: 0 auto;
}

</style>
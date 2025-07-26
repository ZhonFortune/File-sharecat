<template>
    <a-layout v-if="!isMobile">
        <!-- 浅色侧边栏 -->
        <a-layout-sider theme="light" collapsible :trigger="null" v-model:collapsed="collapsed">
            <a-menu mode="inline" style="padding: 20px 10px;" v-model:selectedKeys="selectedKeys" :items="menuItems"
                @select="handleSelect" />
        </a-layout-sider>

        <a-layout>
            <a-layout-header class="header">
                <a-flex justify="space-between" align="center">
                    <!-- 侧边栏收起按钮 -->
                    <a-tooltip title="收起/展开 侧边栏">
                        <a-button type="text" @click="collapsed = !collapsed">
                            <menu-unfold-outlined v-if="collapsed" />
                            <menu-fold-outlined v-else />
                        </a-button>
                    </a-tooltip>

                    <!-- 主标题 -->
                    <a-text class="title">FILE-SHARECAT</a-text>

                    <!-- GITHUB -->
                    <a-button type="primary" shape="circle" style="background-color: rgb(242 242 242)" size="default"
                        href="https://github.com/ZhonFortune/file-sharecat" target="_blank">
                        <GithubOutlined style="color: #000" />
                    </a-button>
                </a-flex>
                <div class="header-title"></div>
            </a-layout-header>

            <a-layout-content class="content">
                <router-view></router-view>
            </a-layout-content>

            <a-layout-footer class="footer">
                <a-text>Powered by <a href="https://github.com/ZhonFortune"
                        target="_blank">Github@ZhonFortune</a></a-text>
            </a-layout-footer>
        </a-layout>
    </a-layout>

    <a-layout v-else>
        <a-flex vertical align="center" justify="center" style="height: 100vh">
            <a-text style="margin: 0 20px;">请使用宽度大于 1200px 的设备访问后台</a-text>
            <a-button type="primary" style="margin-top: 20px;" @click="router.push({ name: 'publicResource'})">
                返回首页
            </a-button>
        </a-flex>
    </a-layout>
</template>

<script setup>
import { ref, h, onMounted, onUnmounted, watch} from 'vue'
import {
    DashboardOutlined, GithubOutlined, TagsOutlined, SafetyOutlined
    , MenuFoldOutlined, MenuUnfoldOutlined, FolderOpenOutlined, DeploymentUnitOutlined
} from '@ant-design/icons-vue'
import { useRouter,useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const collapsed = ref(false)
const selectedKeys = ref(['home'])

const isMobile = ref(false)

const menuItems = [
    {
        key: 'home',
        icon: () => h(DashboardOutlined),
        label: '首页',
        name: 'adminDashboardHome'
    },
    {
        key: 'labels',
        icon: () => h(TagsOutlined),
        label: '标签',
        name: 'adminDashboardLabels'
    },
    {
        key: 'resource',
        icon: () => h(FolderOpenOutlined),
        label: '资源',
        name: 'adminDashboardResources'
    }, {
        key: 'server',
        icon: () => h(DeploymentUnitOutlined),
        label: '部署',
        name: 'adminDashboardServer'
    }, {
        key: 'secure',
        icon: () => h(SafetyOutlined),
        label: '安全',
        name: 'adminDashboardSecure'
    }
]

// 检测是否为移动端
const handleResize = () => {
    isMobile.value = window.innerWidth <= 1200
}

const handleSelect = ({ key }) => {
    const item = menuItems.find(i => i.key === key)
    if (item) {
        router.push({ name: item.name })
    }
}

// 根据路由更新菜单选中状态
const updateMenuSelected = (route) => {
  // 选择当前路径与菜单项匹配的菜单项
  const item = menuItems.find(i => i.name === route.name)
  // console.log(item)
  if (item) {
    selectedKeys.value = [item.key]
  }else {
    selectedKeys.value = []
  }
}

watch(
  () => route.name,
  () => updateMenuSelected(route),
  { immediate: true }
)

onMounted(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
})

</script>

<style scoped>
.title {
    text-align: center;
    font-weight: bold;
    letter-spacing: 1.2px;
    font-size: 0.9rem;
    color: rgba(0, 0, 0, 0.85);
    user-select: none;
}

.header {
    background: #fff;
    padding: 0 24px;
    box-shadow: 0 2px 8px #f0f1f2;
}

.header-title {
    font-size: 18px;
    font-weight: 600;
    line-height: 64px;
}

.content {
    height: calc(100vh - 64px - 24px - 24px - 20px);
    /* flex: 1; */
    margin: 20px 20px;
    margin-bottom: 0px;
    border-radius: 15px;
    padding: 24px;
    background: #fff;
}

.footer {
    padding: 10px 20px;
    text-align: right;
    color: #aaa;
}
</style>

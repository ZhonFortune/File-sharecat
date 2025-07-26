<template>
    <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="public" tab="公共资源">
            <a-table :columns="publicColumns" :dataSource="publicData" :loading="loading" rowKey="_id"
                :scroll="{ y: 'calc(100vh - 350px)' }" bordered pagination={{ pageSize: 5, showSizeChanger: true,
                showQuickJumper: true }}>
                <!-- 自定义列渲染 -->
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'tag'">
                        <span>
                            <a-tag v-for="tag in record.tag" :key="tag" color="default" style="margin-right: 4px">
                                {{ tag }}
                            </a-tag>
                        </span>
                    </template>

                    <template v-else-if="column.key === 'action'">
                        <a-space>
                            <a-button type="primary" size="small" 
                                style="padding: 0 10px; font-size: 0.8rem;"
                            @click="editPulicResource(record._id)">编辑</a-button>
                            <a-button type="primary" size="small" danger
                                style="padding: 0 10px; font-size: 0.8rem;"
                                @click="deletePulicResource(record._id)">删除</a-button>
                        </a-space>
                    </template>
                </template>
            </a-table>
        </a-tab-pane>

        <a-tab-pane key="token" tab="私密资源">
            <a-table :columns="tokenColumns" :dataSource="tokenData" :loading="loading" rowKey="_id"
                :scroll="{ y: 'calc(100vh - 350px)' }" bordered pagination={{ pageSize: 5, showSizeChanger: true,
                showQuickJumper: true }}>
                <!-- 自定义列渲染 -->
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'tag'">
                        <span>
                            <a-tag v-for="tag in record.tag" :key="tag" color="default" style="margin-right: 4px">
                                {{ tag }}
                            </a-tag>
                        </span>
                    </template>

                    <template v-else-if="column.key === 'action'">
                        <a-space>
                            <a-button type="primary" size="small"
                                style="padding: 0 10px; font-size: 0.8rem;"
                                @click="copyThisToken(record.token)"
                            >复制令牌</a-button>

                            <a-button type="primary" size="small" 
                                style="padding: 0 10px; font-size: 0.8rem;"
                            @click="editPulicResource(record._id)">编辑</a-button>
                            <a-button type="primary" size="small" danger
                                style="padding: 0 10px; font-size: 0.8rem;"
                                @click="deletePulicResource(record._id)">删除</a-button>
                        </a-space>
                    </template>
                </template>
            </a-table>
        </a-tab-pane>

        <a-tab-pane key="upload">
            <template #tab>
                <a-button type="primary" @click="uploadResource">上传资源</a-button>
            </template>
            <a-empty description="上传资源开发中..." />
        </a-tab-pane>
    </a-tabs>
</template>

<script setup lang="js">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''
const activeTab = ref('public')
const loading = ref(false)

const publicData = ref([])
const tokenData = ref([])

const publicColumns = [
    {
        title: '资源标题',
        dataIndex: 'title',
        key: 'title',
        width: 200,
        ellipsis: true
    },
    {
        title: '简介',
        dataIndex: 'desc',
        key: 'desc',
        width: 300,
        ellipsis: true
    },
    {
        title: '标签',
        dataIndex: 'tag',
        key: 'tag'
    },
    {
        title: '时间',
        dataIndex: 'time',
        key: 'time',
        width: 120
    },
    {
        title: '大小',
        dataIndex: 'size',
        key: 'size',
        width: 80
    },
    {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        width: 140,
        fixed: 'right'
    }
]

const tokenColumns = [
    {
        title: '资源标题',
        dataIndex: 'title',
        key: 'title',
        width: 200,
        ellipsis: true
    },
    {
        title: '简介',
        dataIndex: 'desc',
        key: 'desc',
        width: 300,
        ellipsis: true
    },
    {
        title: '标签',
        dataIndex: 'tag',
        key: 'tag',
        width: 200
    },
    {
        title: '时间',
        dataIndex: 'time',
        key: 'time',
        width: 120
    },
    {
        title: '过期时间',
        dataIndex: 'timeout',
        key: 'timeout',
        width: 120
    },
    {
        title: '访问令牌',
        dataIndex: 'token',
        key: 'token',
        width: 140
    },
    {
        title: '大小',
        dataIndex: 'size',
        key: 'size',
        width: 80
    },
    {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        width: 220,
        fixed: 'right'
    }
]


// 获取公共资源数据
const fetchPublicData = async () => {
    loading.value = true
    try {
        const res = await axios.get(`${BACKEND_URL}/api/v1/resource/publicget`)
        if (res.data?.code === 200) {
            publicData.value = res.data.data
        } else {
            message.error('资源获取失败')
        }
    } catch (err) {
        console.error(err)
        message.error('请求出错')
    } finally {
        loading.value = false
    }
}

// 获取私密资源数据
const fetchPrivateData = async () => {
    loading.value = true
    try {
        const res = await axios.get(`${BACKEND_URL}/api/v1/admin/oper/resource/token/get`)
        if (res.data?.code === 200) {
            tokenData.value = res.data.data
        } else {
            message.error('资源获取失败')
        }
    } catch (err) {
        console.error(err)
        message.error('请求出错')
    } finally {
        loading.value = false
    }
}

// 复制令牌
const copyThisToken = (token) => {
    navigator.clipboard.writeText(token)
    message.success('令牌已复制')
}


onMounted(() => {
    fetchPublicData()
    fetchPrivateData()
})
</script>

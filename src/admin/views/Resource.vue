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
                            <a-tag v-for="tag in record.tags" :key="tag" color="default" style="margin-right: 4px">
                                {{ tag }}
                            </a-tag>
                        </span>
                    </template>

                    <template v-else-if="column.key === 'action'">
                        <a-space>
                            <a-button type="primary" size="small" style="padding: 0 10px; font-size: 0.8rem;"
                                @click="editPublicResource(record)">编辑</a-button>
                            <a-button type="primary" size="small" danger style="padding: 0 10px; font-size: 0.8rem;"
                                @click="deletePublicResource(record)">删除</a-button>
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
                            <a-tag v-for="tag in record.tags" :key="tag" color="default" style="margin-right: 4px">
                                {{ tag }}
                            </a-tag>
                        </span>
                    </template>

                    <template v-else-if="column.key === 'action'">
                        <a-space>
                            <a-button type="primary" size="small" style="padding: 0 10px; font-size: 0.8rem;"
                                @click="copyThisToken(record.token)">复制令牌</a-button>

                            <a-button type="primary" size="small" style="padding: 0 10px; font-size: 0.8rem;"
                                @click="editTokenResource(record)">编辑</a-button>
                            <a-button type="primary" size="small" danger style="padding: 0 10px; font-size: 0.8rem;"
                                @click="deleteTokenResource(record)">删除</a-button>
                        </a-space>
                    </template>
                </template>
            </a-table>
        </a-tab-pane>

        <a-tab-pane key="upload">
            <template #tab>
                <a-button type="primary" @click="uploadResource">上传资源</a-button>
            </template>

            <template #default>
                <a-flex vertical align="center" style="max-height: calc(100vh - 350px); overflow-y: auto; width: 100%; 
                    padding: 40px 180px;
                ">
                    <a-form style="width: 100%;" layout="vertical" :model="uploadResourceData" :rules="rules"
                        ref="formRef" @finish="onFinish
                        ">
                        <!-- 标题 -->
                        <a-form-item label="标题" name="title">
                            <a-input v-model:value="uploadResourceData.title" placeholder="请输入资源标题" />
                        </a-form-item>

                        <!-- 描述 -->
                        <a-form-item label="资源描述" name="desc">
                            <a-input v-model:value="uploadResourceData.desc" rows="4" placeholder="请输入资源描述" />
                        </a-form-item>

                        <a-flex justify="space-between" align="center">
                            <!-- 标签 多选 -->
                            <a-form-item label="标签" name="tags">
                                <a-select style="min-width: 250px" v-model:value="uploadResourceData.tags"
                                    mode="multiple" placeholder="请选择标签
                                ">
                                    <a-select-option v-for="tag in tagData" :key="tag" :value="tag">
                                        {{ tag }}
                                    </a-select-option>
                                </a-select>
                            </a-form-item>

                            <!-- 所属模块 -->
                            <a-form-item label="所属模块" name="uploadToModel"
                                :rules="[{ required: true, message: '请选择所属模块' }]" valuePropName="checked">
                                <a-radio-group v-model:value="uploadResourceData.uploadToModel">
                                    <a-radio :value="'public'">公共资源</a-radio>
                                    <a-radio :value="'token'">私密资源</a-radio>
                                </a-radio-group>
                            </a-form-item>
                        </a-flex>

                        <!-- 上传文件 -->
                        <a-form-item label="上传文件" name="file" :rules="[{ required: true, message: '请上传文件' }]"
                            :getValueFromEvent="normFile">
                            <a-upload-dragger :file-list="uploadResourceData.file" @change="onUploadChange"
                                :before-upload="() => false">
                                <p class="ant-upload-drag-icon">
                                    <a-icon type="inbox" />
                                </p>
                                <p class="ant-upload-text">点击或拖拽文件到此处上传</p>
                                <p class="ant-upload-hint">仅支持单个文件</p>
                            </a-upload-dragger>
                        </a-form-item>
                    </a-form>
                </a-flex>

                <!-- 提交按钮 -->
                <a-flex align="center" justify="center" style="margin-top: 40px;">
                    <a-button
                        type="primary"
                        @click="submitUploadResource"
                        style="padding: 0 40px; font-size: 0.9rem;"
                        :loading="submitBtnLoading"
                        >
                        <template v-if="submitBtnLoading">
                            <span v-if="uploadProgress < 100">
                            已上传 {{ uploadProgress }}%
                            </span>
                            <span v-else>
                            正在保存
                            </span>
                        </template>
                        <template v-else>
                            提交
                        </template>
                    </a-button>
                </a-flex>
            </template>
        </a-tab-pane>
    </a-tabs>

    <!-- 编辑公共资源 -->
    <a-modal v-model:open="editPublicResourceModal" title="编辑资源" @ok="submitEditResource" @cancel="editPublicResourceModal = false"
        :confirmLoading="editLoading" okText="提交修改" cancelText="取消">
        <a-form :model="editResourceData" :rules="rules" ref="formRef" layout="vertical">
            <a-form-item label="标题" name="title">
                <a-input v-model:value="editResourceData.title" placeholder="请输入标题" />
            </a-form-item>

            <a-form-item label="描述" name="desc">
                <a-textarea v-model:value="editResourceData.desc" placeholder="请输入描述" />
            </a-form-item>

            <a-flex justify="space-between" align="center">
                <!-- 标签 多选 -->
                <a-form-item label="标签" name="tags">
                    <a-select style="min-width: 250px" v-model:value="editResourceData.tags"
                        mode="multiple" placeholder="请选择标签
                    ">
                        <a-select-option v-for="tag in tagData" :key="tag" :value="tag">
                            {{ tag }}
                        </a-select-option>
                    </a-select>
                </a-form-item>

                <!-- 所属模块 -->
                <a-form-item label="所属模块" name="uploadToModel"
                    :rules="[{ required: true, message: '请选择所属模块' }]" valuePropName="checked">
                    <a-radio-group v-model:value="editResourceData.uploadToModel">
                        <a-radio :value="'public'">公共资源</a-radio>
                        <a-radio :value="'token'">私密资源</a-radio>
                    </a-radio-group>
                </a-form-item>
            </a-flex>
        </a-form>
    </a-modal>
</template>

<script setup lang="js">
import { ref, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''
const activeTab = ref('public')

const loading = ref(false)
const editLoading = ref(false)
const submitBtnLoading = ref(false)
const uploadProgress = ref(0)

const publicData = ref([])
const tokenData = ref([])
const tagData = ref([])

const editPublicResourceModal = ref(false)

const uploadResourceData = ref({
    uploadToModel: 'public',
    title: '',
    desc: '',
    tags: [],
    file: []
})

const editResourceData = ref({
    uploadToModel: activeTab.value,
    _id: '',
    title: '',
    desc: '',
    tags: [],
})

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

// 文件预处理
const normFile = (e) => {
    if (Array.isArray(e)) {
        return e
    }
    return e && e.fileList
}

// 上传文件改变时触发
const onUploadChange = (info) => {
    let file = [...info.fileList]
    file = file.slice(-1)
    uploadResourceData.value.file = file
    // console.log(uploadResourceData.value)
}

// 提交上传资源
const submitUploadResource = async () => {
    const model = uploadResourceData.value.uploadToModel
    const title = uploadResourceData.value.title
    const desc = uploadResourceData.value.desc
    const tags = uploadResourceData.value.tags
    const file = uploadResourceData.value.file[0]

    if (!file || !file.originFileObj) {
        return message.error('请上传文件')
    }

    const fileMeta = file.originFileObj
    let size;
    if(fileMeta.size < 1024 * 1024) 
        size = (fileMeta.size / 1024).toFixed(2) + 'KB'
    else 
        size = (fileMeta.size / 1024 / 1024).toFixed(2) + 'MB'

    const currentTime = new Date()
    const year = currentTime.getFullYear()
    const month = currentTime.getMonth() + 1
    const day = currentTime.getDate()
    const time = `${year}-${month}-${day}`

    const formData = new FormData()
    formData.append('meta', JSON.stringify({
        title,
        desc,
        tags,
        time,
        size
    }));
    formData.append('file', fileMeta);

    submitBtnLoading.value = true
    uploadProgress.value = 0
    if (model === 'public') {
        try {
            const res = await axios.post(`${BACKEND_URL}/api/v1/admin/oper/resource/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    uploadProgress.value = percent
                }
            })
            if (res.data?.code === 200) {
                message.success('上传成功')
                fetchPublicData()
            } else {
                message.error(res.data?.message || '上传失败')
            }
        } catch (err) {
            console.error(err)
            message.error('请求出错')
        } finally {
            submitBtnLoading.value = false
            uploadProgress.value = 0
        }
    } else {
        message.error('暂不支持私密资源上传')
    }
}

// 提交编辑资源
const submitEditResource = async () => {
    const Madal = editResourceData.value.uploadToModel
    const title = editResourceData.value.title
    const desc = editResourceData.value.desc
    const tags = editResourceData.value.tags
    const key = editResourceData.value._id

    // 检查更新内容是否与原内容相同
    if (title === publicData.value.find(item => item._id === key).title &&
        desc === publicData.value.find(item => item._id === key).desc &&
        tags === publicData.value.find(item => item._id === key).tags) {
        message.error('没有更新内容')
        return
    }

    // 更新数据
    const hide = message.loading(title + '修改中...', 0)
    editLoading.value = true

    if (Madal === 'public') {
        try {
            axios.post(`${BACKEND_URL}/api/v1/admin/oper/resource/update`, {
                key,
                title,
                desc,
                tags
            }).then((res) => {
                if (res.data?.code === 200) {
                    message.success('修改成功')
                    fetchPublicData()
                } else {
                    message.error('修改失败 ' + res.data?.message)
                }
            }).catch((err) => {
                console.error(err)
                message.error('请求出错')
            })
        } catch (err) {
            console.error(err)
            message.error('请求出错')
        } finally {
            hide()
            editLoading.value = false
            editPublicResourceModal.value = false
        }
    }
}

// 编辑公共资源
const editPublicResource = async (record) => {
    editResourceData.value = {
        uploadToModel: activeTab.value,
        title: record.title,
        desc: record.desc,
        tags: record.tags,
        _id: record._id
    }
    // console.log(editResourceData.value)
    editPublicResourceModal.value = true
}

// 删除公共资源
const deletePublicResource = async (record) => {
    Modal.confirm({
        title: '删除资源: ' + record.title,
        content: `确定要删除 '${record.title}' 这项公共资源吗，其无法撤销!!!`,
        okText: '确定',
        cancelText: '取消',
        async onOk() {
            const hide = message.loading(`"${record.title}" 删除中...`, 0);
            try {
                const res = await axios.post(`${BACKEND_URL}/api/v1/admin/oper/resource/delete`, {
                    key: record._id
                });

                hide();

                if (res.data?.code === 200) {
                    message.success('删除成功');
                    fetchPublicData();
                } else {
                    message.error('删除失败：' + (res.data?.message || '未知错误'));
                }
            } catch (err) {
                hide();
                console.error(err);
                message.error('请求出错');
            }
        }
    });
}

// 获取标签
const fetchTagData = () => {
    axios
        .get(`${BACKEND_URL}/api/v1/label/get`)
        .then((res) => {
            tagData.value = res.data.data.map((item) => item.options.map((option) => option.title)).flat()
        })
        .catch(() => {
            message.error('获取标签组失败')
        })
}

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
    fetchTagData()
    fetchPublicData()
    fetchPrivateData()
})
</script>

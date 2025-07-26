<template>
    <a-space direction="vertical" style="width: 100%">
        <a-flex justify="space-between" align="center" style="margin-bottom: 16px;">
            <a-text style="font-size: 1.25rem; font-weight: 600;">标签列表</a-text>
            <a-button type="primary" @click="showAddTagModal = true">
                <PlusCircleOutlined />新增标签
            </a-button>
        </a-flex>

        <a-table :columns="columns" :data-source="labelsList" :rowKey="record => record._id"
            :style="{ marginTop: '10px' }" :pagination="{ pageSize: 5 }"
            :expandable="{ rowExpandable: record => record.options && record.options.length > 0 }">
            <!-- 操作列插槽 -->
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                    <a-space>
                        <a-button size="small" type="primary" style="padding: 0 10px; font-size: 0.8rem;"
                            @click="newTagInGroup(record)">添加</a-button>
                        <a-button size="small" type="primary" style="padding: 0 10px; font-size: 0.8rem;"
                            @click="editGroup(record)">编辑</a-button>
                        <a-button size="small" type="primary" style="padding: 0 10px; font-size: 0.8rem;" danger
                            @click="deleteGroup(record)">删除</a-button>
                    </a-space>
                </template>
            </template>

            <!-- 展开子表格 -->
            <template #expandedRowRender="{ record }">
                <a-table :columns="tagColumns" :data-source="record.options" :rowKey="tag => tag.id" :pagination="false"
                    size="small">
                    <template #bodyCell="{ column, record: tag }">
                        <template v-if="column.key === 'action'">
                            <a-space>
                                <a-button size="small" type="text" style="color: #1f1f1f"
                                    @click="editTag(record, tag)">编辑</a-button>
                                <a-button size="small" type="text" danger @click="deleteTag(record, tag)">删除</a-button>
                            </a-space>
                        </template>
                    </template>
                </a-table>
            </template>
        </a-table>

        <!-- 新增器 -->
        <a-modal v-model:open="showAddTagModal" :title="modalTitle" :confirmLoading="loading" :footer="null">
            <a-form layout="vertical" style="padding: 20px 20px;">
                <a-form-item label="选择标签组">
                    <a-select v-model:value="selectedGroupId" placeholder="请选择标签组" allow-clear @change="onGroupChange">
                        <a-select-option value="labelGroup_new_TsDhjg">新建标签组</a-select-option>
                        <a-select-option v-for="Item in labelsList" :key="Item.title" :value="Item._id">
                            {{ Item.title }}
                        </a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item label="标签组标题" v-if="selectedGroupId == 'labelGroup_new_TsDhjg'"
                    :rules="[{ required: true, message: '标签组标题不能为空' }]">
                    <a-input v-model:value="newGroupName" placeholder="请输入新建标签组标题" ref="newGroupInput" />
                </a-form-item>

                <a-form-item label="标签名称">
                    <template v-for="(tag, index) in newTagList" :key="index">
                        <a-space style="margin-bottom: 8px">
                            <a-input v-model:value="newTagList[index]" placeholder="请输入标签名称" style="width: 300px" />
                            <a-button v-if="newTagList.length > 1" type="text" danger @click="removeTagInput(index)">
                                删除
                            </a-button>
                        </a-space>
                    </template>
                    <a-button type="text" @click="addTagInput" style="color: #1f1f1f; margin-left: 15px;">
                        + 添加标签
                    </a-button>
                </a-form-item>
            </a-form>

            <a-flex align="center" justify="end" style="margin-top: 16px" gap="16">
                <a-button @click="showAddTagModal = false">取消</a-button>
                <a-button type="primary" @click="handleSumbit">提交</a-button>
            </a-flex>
        </a-modal>

        <!-- 编辑器 -->
        <a-modal v-model:open="showEditGroupModal" :title="modalTitle" :confirmLoading="loading" :footer="null">
            <a-form layout="vertical" style="padding: 20px 20px;">
                <a-form-item label="选择标签组">
                    <a-select v-model:value="selectedGroupId" placeholder="请选择标签组" allow-clear @change="onGroupChange">
                        <a-select-option v-for="Item in labelsList" :key="Item.title" :value="Item._id">
                            {{ Item.title }}
                        </a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item label="标签名称">
                    <!-- 加载已有标签且允许添加或修改 -->
                    <template v-for="Item in editTagList" :key="Item.id">
                        <a-space style="margin-bottom: 8px">
                            <a-input v-model:value="Item.title" placeholder="请输入标签名称" style="width: 300px" />
                        </a-space>
                    </template>
                </a-form-item>
            </a-form>

            <a-flex align="center" justify="end" style="margin-top: 16px" gap="16">
                <a-button @click="showEditTagModal = false">取消</a-button>
                <a-button type="primary" @click="handleSumbit">提交</a-button>
            </a-flex>
        </a-modal>

        <!-- 编辑子标签 -->
        <a-modal v-model:open="showEditTagModal" :title="modalTitle" :confirmLoading="loading" :footer="null">
            <!-- 无需选择标签组 -->
            <a-flex vertical style="padding: 20px 20px;">
                <a-input v-model:value="selectedTagTitle" placeholder="请输入标签名称" style="margin-top: 16px;"
                    :value="selectedTagTitle"></a-input>

                <a-flex align="center" justify="end" style="margin-top: 32px" gap="16">
                    <a-button @click="showEditTagModal = false">取消</a-button>
                    <a-button type="primary" @click="handleSumbit">提交</a-button>
                </a-flex>
            </a-flex>
        </a-modal>

        <!-- 删除确认 -->
        <a-modal v-model:open="showDeleteTagModal" :title="modalTitle" :confirmLoading="loading" :footer="null">
            <a-form layout="vertical" style="padding: 20px 20px;">
                <a-form-item label="确认删除标签组？">
                    <a-space>
                        <a-button type="primary" danger @click="deleteTagConfirm">确认</a-button>
                        <a-button @click="showDeleteTagModal = false">取消</a-button>
                    </a-space>
                </a-form-item>
            </a-form>
        </a-modal>



    </a-space>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import CryptoJS from 'crypto-js'
import { message, Modal } from 'ant-design-vue'
import { PlusCircleOutlined } from '@ant-design/icons-vue'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
const API_URL = BACKEND_URL + '/api/v1'

const labelsList = ref([])
const loading = ref(false)
const showAddTagModal = ref(false)
const showEditGroupModal = ref(false)
const showEditTagModal = ref(false)
const showDeleteTagModal = ref(false)

const modalTitle = ref('新增标签')
const selectedGroupId = ref('labelGroup_new_TsDhjg')
const selectedGroupTitle = ref('')

const selectedTagId = ref('')
const selectedTagTitleOld = ref('')
const selectedTagTitle = ref('')

const editTagList = ref([])
const newGroupName = ref('')
const newTagList = ref([''])

// 数据展示
const columns = [
    { title: '标签组名称', dataIndex: 'title', key: 'title' },
    { title: '操作', key: 'action', width: 120 },
]

const tagColumns = [
    { title: '标签名称', dataIndex: 'title', key: 'title' },
    { title: '操作', key: 'action', width: 120 },
]

// 数据获取
const getLabelsList = () => {
    axios
        .get(API_URL + '/label/get')
        .then((res) => {
            labelsList.value = res.data.data || []
        })
        .catch(() => {
            message.error('获取标签组失败')
        })
}

// 操作请求器
function requester(data, type) {
    const typeTextMap = {
        add: '添加',
        delete: '删除',
        edit: '修改'
    }

    if (!typeTextMap[type]) {
        message.error('无效的操作类型')
        return
    }

    axios.post(`${API_URL}/admin/oper/label`, {
        type,
        data
    }).then((res) => {
        if (res.data.code === 200) {
            message.success(`${typeTextMap[type]}成功`)
            getLabelsList()
        } else {
            message.error(res.data.msg)
        }
    }).catch((err) => {
        message.error(`${typeTextMap[type]}失败：${err?.response?.data?.msg || err.message}`)
    })
}

// 监听选择标签组
const onGroupChange = (value) => {
    console.log(value)
    if (value == 'labelGroup_new_TsDhjg') {
        selectedGroupId.value = 'labelGroup_new_TsDhjg'
        selectedGroupTitle.value = ''
        newGroupName.value = ''
    } else {
        const selectedGroup = labelsList.value.find(item => item._id === value)
        editTagList.value = selectedGroup.options
        selectedGroupId.value = value
        selectedGroupTitle.value = selectedGroup.title
    }
}

// 添加标签输入框
const addTagInput = () => {
    newTagList.value.push('')
}

const removeTagInput = (index) => {
    newTagList.value.splice(index, 1)
}

// 处理操作
const handleSumbit = () => {
    // 编辑子标签模式
    if (showEditTagModal.value) {
        if (!selectedTagTitle.value.trim()) {
            message.error('标签名称不能为空')
            return
        }

        const group = labelsList.value.find(item => item._id === selectedGroupId.value)
        if (!group) {
            message.error('标签组未找到')
            return
        }

        // 更新对应 tag 的 title
        const updatedOptions = group.options.map(option => {
            if (option.id === selectedTagId.value) {
                return {
                    ...option,
                    title: selectedTagTitle.value
                }
            }
            return option
        })

        const data = {
            _id: selectedGroupId.value,
            title: selectedGroupTitle.value,
            options: updatedOptions
        }

        requester(data, 'edit')
        showEditTagModal.value = false
        return
    }


    // 处理标签组新增或修改
    if (!selectedGroupId.value) {
        message.error('请选择标签组')
        return
    }

    if (selectedGroupId.value === 'labelGroup_new_TsDhjg' && !newGroupName.value.trim()) {
        message.error('请填写标签组标题')
        return
    }

    const newTagListOnOpered = newTagList.value.length > 0
        ? newTagList.value
            .filter(tag => tag && tag.trim() !== '')
            .map(tag => ({
                title: tag,
                id: CryptoJS.MD5(tag + Date.now() + Math.random()).toString()
            }))
        : []

    if (selectedGroupId.value === 'labelGroup_new_TsDhjg') {
        const data = {
            title: newGroupName.value,
            options: newTagListOnOpered
        }
        requester(data, 'add')

        // 重置表单
        selectedGroupId.value = ''
        newGroupName.value = ''
    } else {
        const thisGroup = labelsList.value.find(item => item._id === selectedGroupId.value)
        const oldTagList = thisGroup.options

        const mergedTagList = [...oldTagList, ...newTagListOnOpered]

        const data = {
            _id: selectedGroupId.value,
            title: selectedGroupTitle.value,
            options: mergedTagList
        }
        requester(data, 'edit')
    }

    showAddTagModal.value = false
    showEditGroupModal.value = false
    showEditTagModal
}

// 处理父表格添加
const newTagInGroup = (record) => {
    modalTitle.value = `在 ${record.title} 中新增标签`
    // 响应到添加标签
    selectedGroupId.value = record._id
    selectedGroupTitle.value = record.title
    showAddTagModal.value = true
}

// 处理父表格编辑
const editGroup = (record) => {
    modalTitle.value = `编辑 ${record.title}`
    // 响应到添加标签
    selectedGroupId.value = record._id
    selectedGroupTitle.value = record.title
    editTagList.value = record.options
    showEditGroupModal.value = true
}

// 处理父表格删除
const deleteGroup = (record) => {
    // 展示delteModal确认框
    Modal.confirm({
        title: '删除标签组',
        content: `确定要删除标签组 '${record.title}' 及其所有子标签吗?`,
        okText: '确定',
        cancelText: '取消',
        onOk() {
            const data = {
                _id: record._id
            }
            requester(data, 'delete')
        }
    });
}

// 处理子表格编辑
const editTag = (record, tag) => {
    modalTitle.value = `编辑 ${tag.title}`

    selectedGroupId.value = record._id
    selectedGroupTitle.value = record.title

    selectedTagTitle.value = tag.title
    selectedTagId.value = tag.id
    showEditTagModal.value = true
}

// 处理子表格删除
const deleteTag = (record, tag) => {
    Modal.confirm({
        title: '删除标签',
        content: `确定要删除标签 '${tag.title}' 吗?`,
        okText: '确定',
        cancelText: '取消',
        onOk() {
            const group = labelsList.value.find(item => item._id === record._id)
            if (!group) {
                message.error('标签组未找到')
                return
            }

            const updatedOptions = group.options.filter(option => option.id !== tag.id)

            const data = {
                _id: record._id,
                title: record.title,
                options: updatedOptions
            }

            requester(data, 'edit')
        }
    })
}

onMounted(() => {
    getLabelsList()
})
</script>

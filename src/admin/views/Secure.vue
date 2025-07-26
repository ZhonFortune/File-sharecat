<template>
    <a-space direction="vertical" size="large" style="width: 100%;">
        <a-flex vertical justify="flex-start" style="text-align: left;" gap="large">
            <!-- 用户设置 -->
            <a-card title="用户名与密码" style="border: none; box-shadow: none;">
                <a-text>您无法在安全设置中修改管理员用户名与密码,请您到部署环境变量中修改,修改后重启项目即可生效</a-text>
            </a-card>

            <!-- 登录历史 -->
            <a-card title="登录历史" style="border: none; box-shadow: none;">
                <a-table :columns="loginColumns" :data-source="loginHistory" row-key="id" size="small" />
            </a-card>
        </a-flex>
    </a-space>
</template>

<script setup lang="js">
import { ref } from 'vue'
import { message } from 'ant-design-vue'

// 登录历史数据
const loginColumns = [
    { title: '时间', dataIndex: 'time', key: 'time' },
    { title: 'IP地址', dataIndex: 'ip', key: 'ip' },
    { title: '设备', dataIndex: 'device', key: 'device' }
]

</script>

<style scoped lang="css"></style>

<template>
    <a-flex warp="wrap" gap="small" align="center" justify="center" style="padding-top: 20px;">
        <a-text style="margin-right: 15px;">Debug:</a-text>
        <!--  -->
        <a-button type="primary" @click="debugApiLabelGet">API-Label-Get</a-button>
        <a-button type="primary" @click="debug404">404 Page</a-button>
    </a-flex>
</template>

<script setup lang='js'>
import { useRouter } from 'vue-router'
import axios from 'axios'
import { message } from 'ant-design-vue'

const router = useRouter()
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''
const API_URL = `${BACKEND_URL}/api/v1`

function debug404() {
    router.push({
        path: '/404'
    })
}

function debugApiLabelGet() {
    axios.get(`${API_URL}/label/get`)
        .then(res => {
            console.log(res.data)
            message.success('API-Label-Get Success !')
        })
        .catch(err => {
            console.log(err)
            message.error('API-Label-Get Error !' + err)
        })
    
}

</script>

<style scoped lang='css'>
</style>
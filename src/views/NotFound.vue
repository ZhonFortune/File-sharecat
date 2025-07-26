<template>
    <a-flex justify="center" align="center" style="height: 100vh;">
        <a-result status="404" title="404" sub-title="嗯...这个页面走丢了">
            <template #extra>
                <a-button type="primary" @click="backHome">回到首页</a-button>
            </template>
        </a-result>
    </a-flex>
</template>

<script setup lang='js'>
import { useRouter } from 'vue-router'
const router = useRouter()
const backHome = () => {
    router.push({
        name: 'publicResource'
    })
}
</script>

<style scoped lang='css'>
</style>
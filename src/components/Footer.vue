<template>
    <a-flex justify="flex-start" align="center" class="footer" wrap="wrap" gap="small">
        <a-flex justify="flex-start" align="center" gap="small">
            <a-tooltip title="Github">
                <a-button type="primary" shape="circle" 
                style="background-color: rgb(224 224 224)"
                size="default" href="https://github.com/ZhonFortune/file-sharecat" target="_blank">
                    <GithubOutlined/>
                </a-button>
            </a-tooltip>
            <a-tooltip title="常见问题">
                <a-button type="primary" shape="circle"
                style="background-color: rgb(224 224 224)"
                size="default" @click="showQuestionModal"><QuestionCircleOutlined/></a-button>
            </a-tooltip>
        </a-flex>
        <a-flex justify="flex-start" align="center">
            <a-flex justify="flex-start" align="center" :style="{marginLeft: '5px'}">
                <a-text>Powered by <a href="https://github.com/ZhonFortune" target="_blank">Github@ZhonFortune</a></a-text>
            </a-flex>
        </a-flex>
    </a-flex>
</template>

<script setup lang='js'>
import { GithubOutlined, QuestionCircleOutlined
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

const showQuestionModal = () => {
    message.error({
        content: '常见问题模块仍在开发中，敬请期待！',
        okText: 'OK',
    })
}

</script>

<style scoped lang='css'>
.footer {
    padding: 0 40px;
    width: 100%;
}
</style>
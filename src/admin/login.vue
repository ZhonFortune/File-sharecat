<template>
  <div class="login-container">
    <a-card class="login-card" title="登录后台" bordered>
      <a-form :model="form" @submit.prevent="onSubmit" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
        <a-form-item label="用户名" name="username" :rules="[{ required: false, message: '请输入用户名' }]"
          style="margin-top: 20px;">
          <a-input v-model:value="form.username" placeholder="请输入用户名">
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item label="密码" name="password" :rules="[{ required: false, message: '请输入密码' }]">
          <a-input-password v-model:value="form.password" placeholder="请输入密码">
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 5, span: 19 }">
          <a-button type="primary" html-type="submit" block>登录</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="js">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''
const API_URL = `${BACKEND_URL}/api/v1/admin`

const router = useRouter()

const form = reactive({
  username: '',
  password: ''
})

const onSubmit = () => {
  const { username, password } = form
  if (!username || !password) {
    message.error('请输入用户名和密码')
    return
  }

  // 后端登录接口
  axios.post(API_URL + '/login', {
    username,
    password
  }).then(res => {
    if (res.data.code === 200) {
      message.success(res.data.msg)
      router.push({
        name: 'adminDashboard'
      })
    } else {
      message.error(res.data.msg)
    }
  }).catch(err => {
    console.log(err)
    message.error('登录失败')
  })
}

// 检测是否已经登录
const isLogined = () => {
  axios.get(API_URL + '/islogin', { withCredentials: true }
  ).then(res => {
    if ( res.data.result ) {
      message.success('欢迎回来')
      router.push({
        name: 'adminDashboard'
      })
    }else {
      message.error(res.data.msg)
      router.push({
        name: 'adminLogin'
      })
    }
  }).catch(err => {
    console.log(err)
    message.error('检测登录状态失败')
    router.push({
      name: 'adminLogin'
    })
  })
}

// 页面加载时运行
onMounted(() => {
  isLogined()
})

</script>

<style scoped lang="css">
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f2f5;
}

.login-card {
  padding: 20px;
  width: 100%;
  max-width: 580px;
  border-radius: 15px;
}
</style>

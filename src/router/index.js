import { createRouter, createWebHistory } from 'vue-router'
import { message } from 'ant-design-vue'

const routes = [
    // 用户界面
    {
        path: '/',
        name: 'publicResource',
        component: () => import('@/views/publicResource.vue')
    }, {
        path: '/private',
        name: 'tokenDownload',
        component: () => import('@/views/tokenDownload.vue')
    },

    // 后台管理
    {
        path: '/admin',
        name: 'admin',
        meta: {
            hiddenLayout: true
        },
        // component: () => import('@/admin/login.vue'),
        children: [
            // 默认跳转到登录页面
            {
                path: '',
                redirect: '/admin/login',
                meta: {
                    hiddenLayout: true
                },
            },
            // 登录页面
            {
                path: 'login',
                name: 'adminLogin',
                meta: {
                    hiddenLayout: true
                },
                component: () => import('@/admin/login.vue'),
            },
            // 后台管理首页
            {
                path: 'dashboard',
                name: 'adminDashboard',
                meta: {
                    hiddenLayout: true
                },
                redirect: '/admin/dashboard/home',
                component: () => import('@/admin/dashboard.vue'),
                children: [{
                    // 默认跳转到首页
                    path: '',
                    redirect: '/admin/dashboard/home',
                    meta: {
                        hiddenLayout: true
                    },
                },
                // 首页 
                {
                    path: 'home',
                    name: 'adminDashboardHome',
                    meta: {
                        hiddenLayout: true
                    },
                    component: () => import('@/admin/views/Home.vue'),
                },
                // 标签管理
                {
                    path: 'labels',
                    name: 'adminDashboardLabels',
                    meta: {
                        hiddenLayout: true
                    },
                    component: () => import('@/admin/views/Label.vue'),
                },
                // 资源管理
                {
                    path: 'resources',
                    name: 'adminDashboardResources',
                    meta: {
                        hiddenLayout: true
                    },
                    component: () => import('@/admin/views/Resource.vue'),
                },
                // 部署管理
                {
                    path: 'server',
                    name: 'adminDashboardServer',
                    meta: {
                        hiddenLayout: true
                    },
                    component: () => import('@/admin/views/Server.vue'),
                },
                // 安全设置
                {
                    path: 'secure',
                    name: 'adminDashboardSecure',
                    meta: {
                        hiddenLayout: true
                    },
                    component: () => import('@/admin/views/Secure.vue'),
                }
                ]
            }
        ]
    },

    // 404页面
    {
        path: '/:catchAll(.*)',
        name: 'notFound',
        meta: {
            hiddenLayout: true
        },
        component: () => import('@/views/NotFound.vue')
    }
]

const router = createRouter({
    history: createWebHistory(), // createWebHashHistory()
    routes
})

import axios from 'axios'

// 路由守卫
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''
const API_URL = `${BACKEND_URL}/api/v1/admin`
const ISDEV = import.meta.env?.MODE === 'development' ? true : false

if (!ISDEV) {
    router.beforeEach(async (to, from, next) => {
        const isAdminPage = to.path.startsWith('/admin/')
        const isLoginPage = to.name === 'adminLogin'

        if (isAdminPage && !isLoginPage) {
            try {
                const res = await axios.get(`${API_URL}/islogin`, { withCredentials: true });
                if (res.data.result) {
                    next();
                } else {
                    message.error(res.data.msg);
                    next({ name: 'adminLogin' });
                }
            } catch (err) {
                next({ name: 'adminLogin' });
            }
        } else {
            next();
        }
    });
}else {
    console.log('开发环境状态', ISDEV)
    router.beforeEach(async (to, from, next) => {
        next();
    })
}

export default router
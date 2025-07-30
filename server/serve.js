const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

//　加载环境变量
const ENV = (process.env.ENV || '').trim().toLowerCase();
console.log(`当前环境: ${ENV}`);
if(ENV === 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
} else {
  dotenv.config({ path: path.resolve(__dirname, '../.env.development') });
}

// 检查环境变量是否齐全
const requiredEnv = ['PORT', 'HOST', 'SECRET_KEY', 'ADMIN_USERNAME', 'ADMIN_PASSWORD', 'MONGO_URI', 'OS_ENDPOINT'
, 'OS_ACCESS_KEY', 'OS_SECRET_KEY', 'OS_BUCKET_NAME'
];
for(const key of requiredEnv) {
  if(process.env[key] === undefined || process.env[key] === '') {
    console.error(`缺少环境变量: ${key}`);
    process.exit(1);
  }
  
  // 调试输出
  if(ENV === 'development') {
    console.log(`环境变量: ${key} = ${process.env[key]}`)
  }
}

// 路由
const apiRouter = require('./routes');

const PORT = process.env.PORT
const HOST = process.env.HOST

const app = express();
// 设置跨域,允许所有请求
app.use(cors({
  origin: '*',
  credentials: true,
}), express.json(), cookieParser());

// 挂载路由
app.use('/api/v1/', apiRouter);

// 挂载前端静态资源
const staticPath = path.join(__dirname, '../dist');
app.use(express.static(staticPath));

// 路由回退
app.use((req, res, next) => {
  res.sendFile(path.resolve(staticPath, 'index.html'));
})

// 解析器
app.use(express.urlencoded({ extended: true }));

// 连接数据库
const { dbConnect } = require('./utils/db_connect');
const { osConnect } = require('./utils/os_connect');

// 启动服务
(async () => {
  try {
    await dbConnect();
    await osConnect();

    app.listen(PORT, HOST, () => {
      console.log(`\n\n==========================================`);
      console.log(`数据库地址: ${process.env.MONGO_URI}`);
      console.log(`当前环境: ${process.env.ENV}`);
      console.log(`服务运行于: http://${HOST}:${PORT}`);
      console.log(`==========================================\n`);
    });
  } catch (err) {
    console.error(`\n\n服务启动失败: `, err);
    process.exit(1);
  }
})();
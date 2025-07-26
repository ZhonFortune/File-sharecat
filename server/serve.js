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
const requiredEnv = ['SECRET_KEY', 'ADMIN_USERNAME', 'ADMIN_PASSWORD', 'MONGO_URI'];
for(const key of requiredEnv) {
  if(process.env[key] === undefined || process.env[key] === '') {
    console.error(`缺少环境变量: ${key}`);
    process.exit(1);
  }
  console.log(`环境变量: ${key} = ${process.env[key]}`);
}

// 路由
const apiRouter = require('./routes');

const PORT = process.env.PORT || 4320;
const HOST = process.env.HOST || 'localhost';

const app = express();
const corsOrigin = process.env.ENV === 'production' ? process.env.DOMAIN : (process.env.CORS_ORIGIN || 'http://localhost:5173');

app.use(cors({
  // 若为开发环境，则允许所有请求
  origin: corsOrigin,
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

// 连接数据库
const { dbConnect } = require('./utils/db_connect');

// 启动服务
(async () => {
  try {
    await dbConnect();

    app.listen(PORT, HOST, () => {
      console.log(`\n\n==========================================`);
      console.log(`数据库地址: ${process.env.MONGO_URI}`);
      console.log(`当前环境: ${process.env.ENV}`);
      console.log(`允许跨域源: ${corsOrigin}`);
      console.log(`服务运行于: http://${HOST}:${PORT}`);
      console.log(`==========================================\n`);
    });
  } catch (err) {
    console.error('启动失败: 数据库错误', err);
    process.exit(1);
  }
})();
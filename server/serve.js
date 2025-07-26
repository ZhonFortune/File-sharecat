const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const ENV = process.env.ENV.trim().toLowerCase();
if (ENV !== 'development' && ENV !== 'production') {
  console.error('环境变量 ENV 必须为 development 或 production');
  process.exit(1);
}else if (ENV === 'development') {
  // 开发环境，加载 .env.development 文件
  dotenv.config({ path: path.resolve(__dirname, '../.env.development') });
}else {
  // 生产环境，加载 .env文件
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

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
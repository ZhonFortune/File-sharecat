<div align="center">
    <h1>部署文档</h1>
    <a href="https://railway.com/deploy/HQIhln?referralCode=YFC8-i" target="_blank" rel="noopener noreferrer">
  <img src="https://railway.com/button.svg" alt="Deploy on Railway" width="auto" height="30px" style="vertical-align: middle;" />
</a>

</div>

<br>

## 环境变量配置

本地部署时需修改 `.env` 以配置环境变量，Railway/Vercel 部署时需在 `Settings`/`Environment Variables` 中配置环境变量。

| 变量名             | 描述                                                                 | 示例值                                                         | 必填 |
|--------------------|----------------------------------------------------------------------|-----------------------------------------------------------------|------|
| `PORT`             | 服务器监听端口(Railway 部署需为空值)                                                       | `4320`                                                          | ⬜️   |
| `HOST`             | 服务器主机名（Railway 部署需为空值）                      | `0.0.0.0`                                                       | ⬜️   |
| `MONGO_URI`        | MongoDB 数据库连接字符串                                             | `mongodb+srv://xxx...`               | ✅   |
| `OS_ENDPOINT`      | 对象存储服务地址(仅支持 S3 协议的服务)           | `https://r2.yourdomain.com`                                     | ✅   |
| `OS_REGION`        | 区域(如服务商要求填写)                                             | `us-east-1`                                           | ⬜️   |
| `OS_ACCESS_KEY`    | 对象存储的访问密钥 ID                                                | `K8LAU92F8K1H78TUL9E1`                                           | ✅   |
| `OS_SECRET_KEY`    | 对象存储的密钥                                                      | `jPzJ2wJxvNuv9D9PbQw0r3yX81tR9DUxQYZ1T6mW`                     | ✅   |
| `OS_BUCKET_NAME`   | 存储桶名称                                                           | `my-bucket`                                                     | ✅   |
| `SECRET_KEY`       | 用于加密和验证的密钥（可填写任意强随机字符串）                      | `JvEwhXKT9co3PofUWJ7zl3iola6YpRi3X5Y` | ✅   |
| `ADMIN_USERNAME`   | 管理员登录账号                                                       | `admin`                                                         | ✅   |
| `ADMIN_PASSWORD`   | 管理员登录密码                                                       | `admin`                                                         | ✅   |
---

<br>

## 🔧 准备工作

<br>

### 获取 MongoDB 连接字符串

1. 在 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 注册或登录
3. 进入仪表台，创建一个新项目(首次注册会自动让你创建一个项目)
2. 在项目设置中，找到 `Connect` 选项卡，点击 `Connect your application` 按钮。
3. 选择 `Connect with MongoClient`，并复制生成的连接字符串。
4. 去掉所有参数,仅保留三级域名及其前段部分，例如 `"mongodb+srv://<db_user>:<db_password>@xxx.xxx.mongodb.net/?retryWrites=true&w=majority&appName=XXX";` 需改为 `mongodb+srv://<db_user>:<db_password>@xxx.xxx.mongodb.net`（注意需要删除最后的 `/`）
5. 将连接字符串填入 `MONGO_URI` 环境变量中

<br>

### 获取对象存储服务信息

1. 在对象存储服务提供商处注册或登录
2. 创建一个存储桶，并获取以下信息：
    - 存储桶名称
    - 访问密钥 ID
    - 密钥
    - 服务地址（S3 协议）
3. 将获取到的信息填入 `OS_BUCKET_NAME`、`OS_ACCESS_KEY`、`OS_SECRET_KEY`、`OS_ENDPOINT` 环境变量中

<br>

### 生成 SECRET_KEY

1. 网络上搜索一个随机字符串生成器，生成一个强随机字符串或使用 `openssl rand -base64 32` 命令生成一个 32 字节的随机字符串
2. 将生成的字符串填入 `SECRET_KEY` 环境变量中

---

<br>

## 🚀 部署
推荐先部署后端再部署(构建)前端

<br>

### Railway (后端)

1. FORK 项目
2. 在 [Railway](https://railway.app/) 注册或登录
3. 点击 `New Project` 按钮
4. 选择 `Node.js`，并点击 `Create` 按钮
5. 在 `Settings`/`Environment Variables` 中添加环境变量
6. 点击 `Deploy` 按钮
6. 或点击下方按钮快速部署 (无需FORK)
[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/HQIhln?referralCode=YFC8-i)

<br>

### 本地部署

1. 安装 Node.js 和 npm
2. 克隆仓库到本地
3. 进入项目根目录启动终端/cmd 运行以下命令
```bash
# 安装依赖
npm install

# 启动项目
npm run start
```

<br>

### NPM 仓库拉取镜像

```bash
# 拉取项目
npm i -g file-sharecat

# 启动项目
fsc-server
```



@echo off
chcp 65001
echo \n
echo file-sharecat 正在启动...

REM 如果环境变量 PORT 为空，设置默认值 8080
if "%PORT%"=="" (
  set PORT=4320
)

REM 如果环境变量 HOST 为空，设置默认值 127.0.0.1
if "%HOST%"=="" (
  set HOST=127.0.0.1
)

echo 使用端口: %PORT%
echo 使用主机/域名: %HOST%

REM 构建前端（假设当前目录是前端目录）
npm run build

REM 进入后端目录并启动后端，传入参数
cd ./server
npm install
npm run start

echo File-sharecat 启动成功
echo 访问地址: http://%HOST%:%PORT%

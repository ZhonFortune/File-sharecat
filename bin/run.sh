#!/bin/bash

echo "file-sharecat 正在启动..."

if [ -z "$PORT" ]; then
  PORT=4320
fi

if [ -z "$HOST" ]; then
  HOST=127.0.0.1
fi

echo "使用端口: $PORT"
echo "使用主机/域名: $HOST"

# 构建前端
npm run build

# 启动后端
cd ../server
npm install
npm run start --port $PORT --host $HOST

# 检测后端是否启动成功
if [ $? -eq 0 ]; then
  echo "File-sharecat 启动成功"
  echo "访问地址: http://$HOST:$PORT"
else
  echo "后端启动失败"
fi


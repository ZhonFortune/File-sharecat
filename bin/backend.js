// bin/backend.js
// 仅用于启动后端服务,适配Railway部署
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT
const HOST = process.env.HOST

const serverPath = path.resolve(__dirname, '../server')

const serverProcess = spawn('npm', ['run', 'start'], {
    cwd: serverPath,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PORT, HOST }
})

serverProcess.on('error', err => {
    console.error('服务启动错误:', err)
})

serverProcess.on('exit', code => {
    console.log(`服务进程退出，退出码: ${code}`)
})

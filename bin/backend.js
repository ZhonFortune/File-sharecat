// bin/backend.js
// 仅用于启动后端服务，适配 Railway 部署
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT
const HOST = process.env.HOST

const serverPath = path.resolve(__dirname, '../server')

function runNpmInstall() {
    return new Promise((resolve, reject) => {
        const installProcess = spawn('npm', ['install'], {
            cwd: serverPath,
            stdio: 'inherit',
            shell: true,
            env: process.env,
        })

        installProcess.on('error', (err) => {
            reject(err)
        })

        installProcess.on('exit', (code) => {
            if (code === 0) {
                resolve()
            } else {
                reject(new Error(`npm install 退出码: ${code}`))
            }
        })
    })
}

function runServer() {
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
}

async function main() {
    try {
        console.log('开始安装依赖...')
        await runNpmInstall()
        console.log('依赖安装完成，启动服务...')
        runServer()
    } catch (err) {
        console.error('安装依赖失败:', err)
        process.exit(1)
    }
}

main()

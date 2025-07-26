// bin/frontend.js
// 仅用于构建前端,适配Vercel部署
import { runCommand } from './shared.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT
const HOST = process.env.HOST

runCommand('npm', ['run', 'build'], {
    cwd: path.resolve(__dirname, '..'),
    env: { PORT, HOST }
}).catch(err => {
    console.error('前端构建失败:', err)
    process.exit(1)
})

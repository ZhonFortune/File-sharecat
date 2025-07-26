// bin/run.js
// 构建前端和启动后端服务一体
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT
const HOST = process.env.HOST

function runCommand(command, args, options = {}) {
    // 把环境变量合并进去，优先使用传入options.env，否则使用 process.env
    const env = { ...process.env, ...(options.env || {}) };

    return new Promise((resolve, reject) => {
        const proc = spawn(command, args, { stdio: 'inherit', shell: true, env, cwd: options.cwd });

        proc.on('error', (err) => {
            reject(err);
        });

        proc.on('exit', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`${command} exited with code ${code}`));
            }
        });
    });
}

async function main() {
    try {
        // 后端启动时传入环境变量
        const serverProcess = spawn('npm', ['run', 'start'], {
            cwd: path.resolve(__dirname, '../server'),
            stdio: 'inherit',
            shell: true,
            env: { ...process.env, PORT, HOST }
        });

        serverProcess.on('error', (err) => {
            console.error('服务启动错误:', err);
        });

        serverProcess.on('exit', (code) => {
            console.log(`服务进程退出，退出码: ${code}`);
        });

    } catch (err) {
        console.error('启动失败:', err);
        process.exit(1);
    }
}

main();

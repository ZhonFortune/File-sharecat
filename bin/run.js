// bin/run.js
// 构建前端和启动后端服务一体：先安装依赖再启动服务
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT;
const HOST = process.env.HOST || 'localhost'
const serverDir = path.resolve(__dirname, '../server');

function runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        const proc = spawn(command, args, {
            stdio: 'inherit',
            shell: true,
            ...options,
        });

        proc.on('error', reject);
        proc.on('exit', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
        });
    });
}

async function main() {
    try {
        console.log('安装后端依赖...');
        await runCommand('npm', ['install'], { cwd: serverDir });

        console.log('启动后端服务...');
        await runCommand('npm', ['run', 'start'], {
            cwd: serverDir,
            env: { ...process.env, PORT, HOST },
        });
    } catch (err) {
        console.error('启动失败:', err.message || err);
        process.exit(1);
    }
}

main();

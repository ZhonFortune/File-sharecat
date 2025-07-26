// bin/shared.js
import { spawn } from 'child_process'

export function runCommand(command, args, options = {}) {
    const env = { ...process.env, ...(options.env || {}) }

    return new Promise((resolve, reject) => {
        const proc = spawn(command, args, {
            stdio: 'inherit',
            shell: true,
            cwd: options.cwd,
            env
        })

        proc.on('error', err => reject(err))
        proc.on('exit', code => {
            if (code === 0) resolve()
            else reject(new Error(`${command} exited with code ${code}`))
        })
    })
}

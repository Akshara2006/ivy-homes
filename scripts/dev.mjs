import { spawn } from 'node:child_process'

const isWindows = process.platform === 'win32'
const cmd = isWindows ? 'npx.cmd' : 'npx'

const child = spawn(cmd, ['next', 'dev', '--webpack'], {
  stdio: 'inherit',
})

let exiting = false

function gracefulExit() {
  if (exiting) return
  exiting = true
  console.log('\n✓ Gracefully terminating development server...')
  
  if (child && !child.killed && child.pid) {
    if (isWindows) {
      try {
        spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'])
      } catch {
        // child already terminated
      }
    } else {
      try {
        child.kill('SIGTERM')
      } catch {
        // child already terminated
      }
    }
  }
  process.exit(0)
}

process.on('SIGINT', gracefulExit)
process.on('SIGTERM', gracefulExit)

child.on('close', (code) => {
  // Exit cleanly with 0 on user termination (code 255 / 130 / null)
  if (code === 255 || code === 130 || code === null) {
    process.exit(0)
  }
  process.exit(code ?? 0)
})

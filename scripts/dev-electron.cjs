const { spawn, execSync } = require('child_process');
const net = require('net');
const path = require('path');
const fs = require('fs');

const PORT = 5175;
const HOST = 'localhost';
const PROJECT_ROOT = path.resolve(__dirname, '..');

let viteProcess = null;
let electronProcess = null;
let shuttingDown = false;

process.env.NODE_ENV = 'development';
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

function log(msg, type = 'info') {
  const prefix = {
    info: '\x1b[36m[i]\x1b[0m',
    success: '\x1b[32m[✓]\x1b[0m',
    error: '\x1b[31m[✗]\x1b[0m',
    warn: '\x1b[33m[!]\x1b[0m',
  }[type] || '[i]';
  console.log(`${prefix} ${msg}`);
}

function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(true));
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port, HOST);
  });
}

function killProcessOnPort(port) {
  try {
    if (process.platform === 'win32') {
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' }).trim();
      if (result) {
        const lines = result.split('\n');
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0') {
            try {
              execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
              log(`已终止占用端口 ${port} 的进程 (PID: ${pid})`, 'warn');
            } catch (e) {
              // ignore
            }
          }
        });
      }
    } else {
      execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`);
    }
  } catch (e) {
    // ignore
  }
}

function waitForPort(port, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      const socket = net.connect(port, HOST, () => {
        socket.destroy();
        resolve(true);
      });
      socket.on('error', () => {
        if (Date.now() - startTime > timeoutMs) {
          reject(new Error(`等待端口 ${port} 超时 (${timeoutMs}ms)`));
        } else {
          setTimeout(check, 500);
        }
      });
      socket.setTimeout(1000);
    };
    check();
  });
}

function stripAnsi(str) {
  return str.replace(/\x1B\[[0-9;]*[JKmsu]/g, '');
}

function startVite() {
  return new Promise((resolve, reject) => {
    log('正在启动 Vite 开发服务器...');
    
    const isWin = process.platform === 'win32';
    viteProcess = spawn(
      isWin ? 'npm.cmd' : 'npm',
      ['run', 'dev'],
      {
        cwd: PROJECT_ROOT,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: process.env,
        shell: isWin,
      }
    );

    let viteStarted = false;

    viteProcess.stdout.on('data', (data) => {
      const text = data.toString();
      const cleanText = stripAnsi(text);
      process.stdout.write(data);
      
      if (!viteStarted && (cleanText.includes(`localhost:${PORT}`) || cleanText.includes(`ready in`))) {
        viteStarted = true;
        log('Vite 开发服务器已启动', 'success');
        setTimeout(() => resolve(viteProcess), 500);
      }
    });

    viteProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    viteProcess.on('close', (code) => {
      if (!viteStarted) {
        reject(new Error(`Vite 启动失败，退出码: ${code}`));
      } else if (!shuttingDown) {
        log(`Vite 进程已退出 (code: ${code})`, 'warn');
        shutdown();
      }
    });

    viteProcess.on('error', (err) => {
      if (!viteStarted) {
        reject(err);
      }
    });

    setTimeout(() => {
      if (!viteStarted) {
        viteStarted = true;
        log('Vite 开发服务器可能已启动（超时后继续）', 'warn');
        resolve(viteProcess);
      }
    }, 10000);
  });
}

function startElectron() {
  return new Promise((resolve, reject) => {
    log('正在启动桌面客户端...');
    log('窗口标题：剧本杀司机接单台', 'info');

    const isWin = process.platform === 'win32';
    
    electronProcess = spawn(
      isWin ? 'npx.cmd' : 'npx',
      ['electron', '.'],
      {
        cwd: PROJECT_ROOT,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          NODE_ENV: 'development',
        },
        shell: isWin,
      }
    );

    let started = false;

    electronProcess.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    electronProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    setTimeout(() => {
      if (!started) {
        started = true;
        log('桌面客户端窗口已打开', 'success');
        log('═══════════════════════════════════════════════════', 'success');
        log('  窗口标题：剧本杀司机接单台', 'success');
        log('  如果窗口未弹出，请检查任务栏', 'warn');
        log('═══════════════════════════════════════════════════', 'success');
        resolve(electronProcess);
      }
    }, 5000);

    electronProcess.on('close', (code) => {
      if (!started) {
        started = true;
        if (code !== 0) {
          reject(new Error(`Electron 启动失败，退出码: ${code}`));
        } else {
          resolve(electronProcess);
        }
      } else if (!shuttingDown) {
        log(`桌面客户端已关闭 (code: ${code})`, 'info');
        shutdown();
      }
    });

    electronProcess.on('error', (err) => {
      if (!started) {
        started = true;
        reject(err);
      }
    });
  });
}

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  
  log('正在关闭所有进程...', 'info');
  
  if (electronProcess && !electronProcess.killed) {
    electronProcess.kill('SIGTERM');
    setTimeout(() => {
      if (electronProcess && !electronProcess.killed) {
        electronProcess.kill('SIGKILL');
      }
    }, 2000);
  }
  
  if (viteProcess && !viteProcess.killed) {
    viteProcess.kill('SIGTERM');
    setTimeout(() => {
      if (viteProcess && !viteProcess.killed) {
        viteProcess.kill('SIGKILL');
      }
    }, 2000);
  }
  
  setTimeout(() => {
    log('应用已完全关闭', 'success');
    process.exit(0);
  }, 3000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('exit', shutdown);

process.on('uncaughtException', (err) => {
  log(`未捕获异常: ${err.message}`, 'error');
  if (!shuttingDown) {
    shutdown();
    process.exit(1);
  }
});

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║        剧本杀司机接单台 - 桌面客户端启动器       ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');

  const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log(`未找到 package.json，请确认目录: ${PROJECT_ROOT}`, 'error');
    process.exit(1);
  }

  const electronPath = path.join(PROJECT_ROOT, 'node_modules', 'electron');
  if (!fs.existsSync(electronPath)) {
    log('未找到 Electron，正在检查安装状态...', 'warn');
    try {
      execSync('npx electron --version', { cwd: PROJECT_ROOT, stdio: 'ignore' });
      log('Electron 已就绪', 'success');
    } catch (e) {
      log('Electron 未正确安装，请执行: npm install', 'error');
      process.exit(1);
    }
  }

  log(`检查端口 ${PORT} 是否被占用...`);
  const portInUse = await isPortInUse(PORT);
  if (portInUse) {
    log(`端口 ${PORT} 被占用，正在释放...`, 'warn');
    killProcessOnPort(PORT);
    await new Promise(r => setTimeout(r, 1000));
  }

  try {
    await startVite();
  } catch (err) {
    log(`Vite 启动失败: ${err.message}`, 'error');
    log('请尝试: npm run dev 单独启动 Vite 排查问题', 'warn');
    process.exit(1);
  }

  await new Promise(r => setTimeout(r, 1500));
  log(`Vite 服务已就绪 (http://localhost:${PORT})`, 'success');

  try {
    await startElectron();
  } catch (err) {
    log(`桌面客户端启动失败: ${err.message}`, 'error');
    log('');
    log('━━━ 排查建议 ━━━', 'warn');
    log('1. 首次启动需要下载 Electron 二进制文件（约 100MB）', 'warn');
    log('2. 运行: npm run electron:check  验证安装状态', 'warn');
    log('3. 运行: npm install            重新安装依赖', 'warn');
    log('4. 临时方案: npm run dev        浏览器模式预览', 'warn');
    log('');
    shutdown();
    process.exit(1);
  }
}

main().catch((err) => {
  log(`启动失败: ${err.message}`, 'error');
  console.error(err.stack);
  process.exit(1);
});

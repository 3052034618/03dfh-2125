const { spawn } = require('child_process');
const waitOn = require('wait-on');

process.env.NODE_ENV = 'development';

const vite = spawn('npm', ['run', 'dev'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: true,
});

vite.on('error', (err) => {
  console.error('Vite 启动失败:', err);
  process.exit(1);
});

(async () => {
  try {
    console.log('等待 Vite 服务启动...');
    await waitOn({ 
      resources: ['http://localhost:5175'],
      timeout: 30000,
      interval: 1000,
    });
    
    console.log('✅ Vite 服务已启动，正在打开桌面客户端...');
    console.log('📋 窗口标题：剧本杀司机接单台');
    
    const electron = spawn(
      'npx',
      ['electron', '.'],
      {
        cwd: process.cwd(),
        stdio: 'inherit',
        shell: true,
        env: {
          ...process.env,
          NODE_ENV: 'development',
        },
      }
    );
    
    electron.on('close', (code) => {
      console.log('桌面客户端已关闭，正在停止 Vite 服务...');
      vite.kill('SIGINT');
      process.exit(code || 0);
    });
    
    electron.on('error', (err) => {
      console.error('❌ Electron 启动失败:', err.message);
      console.log('\n💡 排查建议：');
      console.log('   1. 首次启动需要下载 Electron 二进制文件（约 100MB），请检查网络');
      console.log('   2. 运行: npm run electron:check  验证安装状态');
      console.log('   3. 运行: npm install            重新安装依赖');
      console.log('   4. 临时方案: npm run dev        浏览器模式预览');
      vite.kill('SIGINT');
      process.exit(1);
    });
    
  } catch (err) {
    console.error('❌ 等待 Vite 服务超时:', err.message);
    console.log('\n💡 请确认端口 5175 未被占用');
    vite.kill('SIGINT');
    process.exit(1);
  }
})();

process.on('SIGINT', () => {
  console.log('\n正在关闭应用...');
  vite.kill('SIGINT');
  process.exit(0);
});

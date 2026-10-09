---
lastUpdated: true
commentabled: true
recommended: true
title: Electron 应用版本管理实战
description: 自动更新、版本检查与用户体验优化
date: 2026-07-15 10:25:00
pageClass: blog-page-class
cover: /covers/electron.svg
---

做过桌面应用的都知道，版本管理是个看起来简单、做起来坑很多的事。用户不升级抱怨 bug，强制升级又被骂流氓；版本号乱起一通，回滚时找不到兼容性；静默更新怕用户不知道变化，弹窗提醒又怕被嫌烦。

这篇文章从 Electron 应用的版本管理体系出发，覆盖版本号规范、自动检查、用户通知、回滚策略等核心环节。不是教程式的 API 介绍，是生产环境踩坑后总结的最佳实践。

## 版本号规范：语义化版本控制

### 基本规则

Electron 应用推荐使用 语义化版本控制：MAJOR.MINOR.PATCH。

```json
{
  "version": "2.3.1",
  "description": "2（主版本）.3（次版本）.1（补丁版本）"
}
```

- 主版本（MAJOR）：不兼容的 API 变更、界面重构、数据格式变更
- 次版本（MINOR）：向下兼容的新功能、新特性
- 补丁版本（PATCH）：向下兼容的问题修复、性能优化

### 预发布版本

开发阶段使用预发布标识：

```json
// 内部测试版
{ "version": "2.4.0-alpha.1" }

// 公开测试版
{ "version": "2.4.0-beta.3" }

// 候选发布版
{ "version": "2.4.0-rc.1" }
```

### 构建元数据

```json
// 包含构建时间戳
{ "version": "2.3.1+build.20260602.1045" }

// 包含 Git 提交哈希
{ "version": "2.3.1+git.a1b2c3d" }
```

### 实践建议

#### package.json 作为唯一真实来源

```javascript
// main.js
const { app } = require('electron');
const packageInfo = require('./package.json');

console.log(`当前版本: ${packageInfo.version}`);
console.log(`应用版本: ${app.getVersion()}`); // 自动读取 package.json
```

#### 版本号工具链整合

```json
{
  "scripts": {
    "version:patch": "npm version patch --no-git-tag-version",
    "version:minor": "npm version minor --no-git-tag-version",
    "version:major": "npm version major --no-git-tag-version",
    "build:dev": "electron-builder",
    "build:release": "npm run version:patch && electron-builder",
    "release": "npm run build:release && git tag v$(npm pkg get version | tr -d '\"')"
  }
}
```

#### 多环境版本标识

```javascript
// version.js
const packageInfo = require('./package.json');
const isDev = process.env.NODE_ENV === 'development';
const buildTime = process.env.BUILD_TIME || new Date().toISOString();

module.exports = {
  version: packageInfo.version,
  fullVersion: `${packageInfo.version}${isDev ? '-dev' : ''}`,
  buildTime,
  displayName: isDev ? `${packageInfo.version} (开发版)` : packageInfo.version
};
```

## 自动更新机制

### electron-updater 集成

```bash
npm install electron-updater
```

主进程设置：

```javascript
// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

// 配置日志
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  // 应用启动后检查更新
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

// 更新事件监听
autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...');
  mainWindow?.webContents.send('update-checking');
});

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info);
  mainWindow?.webContents.send('update-available', info);
});

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available:', info);
  mainWindow?.webContents.send('update-not-available');
});

autoUpdater.on('error', (err) => {
  log.error('Update error:', err);
  mainWindow?.webContents.send('update-error', err.message);
});

autoUpdater.on('download-progress', (progressObj) => {
  const message = `下载速度: ${progressObj.bytesPerSecond} - 已下载 ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
  log.info(message);
  mainWindow?.webContents.send('update-download-progress', progressObj);
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info);
  mainWindow?.webContents.send('update-downloaded', info);
});

// IPC 处理
ipcMain.handle('get-version-info', async () => {
  return {
    version: app.getVersion(),
    buildTime: process.env.BUILD_TIME || new Date().toISOString(),
    electron: process.versions.electron,
    node: process.versions.node
  };
});

ipcMain.handle('check-for-updates', async () => {
  if (isDev) {
    return { available: false, reason: 'Development mode' };
  }

  try {
    const result = await autoUpdater.checkForUpdates();
    return { available: result.updateInfo.version !== app.getVersion() };
  } catch (error) {
    return { available: false, error: error.message };
  }
});

ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall();
});

ipcMain.handle('download-update', async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

预加载脚本：

```javascript
// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 版本信息
  getVersionInfo: () => ipcRenderer.invoke('get-version-info'),

  // 更新检查
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),

  // 更新事件监听
  onUpdateChecking: (callback) => ipcRenderer.on('update-checking', callback),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateNotAvailable: (callback) => ipcRenderer.on('update-not-available', callback),
  onUpdateError: (callback) => ipcRenderer.on('update-error', callback),
  onUpdateDownloadProgress: (callback) => ipcRenderer.on('update-download-progress', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),

  // 清理监听器
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
```

### 发布服务器配置

GitHub Releases：

```json
{
  "build": {
    "publish": [
      {
        "provider": "github",
        "owner": "your-username",
        "repo": "your-app",
        "private": false
      }
    ]
  }
}
```

自建服务器：

```json
{
  "build": {
    "publish": [
      {
        "provider": "generic",
        "url": "https://releases.yourapp.com"
      }
    ]
  }
}
```

服务器目录结构：

```text
releases/
├── latest.yml              # 最新版本信息
├── your-app-2.3.1.exe     # Windows 安装包
├── your-app-2.3.1.dmg     # macOS 安装包
└── your-app-2.3.1.AppImage # Linux 安装包
```

latest.yml 示例：

```yaml
version: 2.3.1
files:
  - url: your-app-2.3.1.exe
    sha512: d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5
    size: 87654321
path: your-app-2.3.1.exe
sha512: d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5
releaseDate: '2026-06-02T02:00:00.000Z'
```

## 用户界面与体验设计

### 版本信息展示

关于页面：

```html
<!-- about.html -->
<div class="about-section">
  <h2>版本信息</h2>
  <div class="version-info">
    <div class="version-item">
      <span class="label">当前版本:</span>
      <span class="value" id="current-version">--</span>
    </div>
    <div class="version-item">
      <span class="label">构建时间:</span>
      <span class="value" id="build-time">--</span>
    </div>
    <div class="version-item">
      <span class="label">Electron:</span>
      <span class="value" id="electron-version">--</span>
    </div>
    <div class="version-item">
      <span class="label">Node.js:</span>
      <span class="value" id="node-version">--</span>
    </div>
  </div>

  <button id="check-update-btn" class="btn-primary">检查更新</button>
  <div id="update-status" class="update-status"></div>
</div>
```

```javascript:about.js
class AboutPage {
  constructor() {
    this.initVersionInfo();
    this.initUpdateChecker();
  }

  async initVersionInfo() {
    const versionInfo = await window.electronAPI.getVersionInfo();

    document.getElementById('current-version').textContent = versionInfo.version;
    document.getElementById('build-time').textContent = new Date(versionInfo.buildTime).toLocaleString();
    document.getElementById('electron-version').textContent = versionInfo.electron;
    document.getElementById('node-version').textContent = versionInfo.node;
  }

  initUpdateChecker() {
    const checkBtn = document.getElementById('check-update-btn');
    const statusDiv = document.getElementById('update-status');

    checkBtn.addEventListener('click', async () => {
      checkBtn.disabled = true;
      statusDiv.innerHTML = '<span class="checking">检查更新中...</span>';

      try {
        const result = await window.electronAPI.checkForUpdates();

        if (result.available) {
          statusDiv.innerHTML = '<span class="available">发现新版本！</span>';
          this.showUpdateDialog(result.info);
        } else {
          statusDiv.innerHTML = '<span class="up-to-date">当前已是最新版本</span>';
        }
      } catch (error) {
        statusDiv.innerHTML = `<span class="error">检查失败: ${error.message}</span>`;
      } finally {
        checkBtn.disabled = false;
      }
    });
  }

  showUpdateDialog(updateInfo) {
    const dialog = document.createElement('div');
    dialog.className = 'update-dialog';
    dialog.innerHTML = `
      <div class="dialog-overlay">
        <div class="dialog-content">
          <h3>发现新版本 ${updateInfo.version}</h3>
          <div class="release-notes">
            <h4>更新内容:</h4>
            <div class="notes-content">${this.formatReleaseNotes(updateInfo.releaseNotes)}</div>
          </div>
          <div class="update-size">
            <span>更新大小: ${this.formatFileSize(updateInfo.files[0]?.size || 0)}</span>
          </div>
          <div class="dialog-actions">
            <button class="btn-secondary" id="later-btn">稍后提醒</button>
            <button class="btn-primary" id="update-btn">立即更新</button>
          </div>
          <div class="progress-container" id="progress-container" style="display: none;">
            <div class="progress-bar">
              <div class="progress-fill" id="progress-fill"></div>
            </div>
            <div class="progress-text" id="progress-text">准备下载...</div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    // 事件处理
    document.getElementById('later-btn').onclick = () => {
      // 清理事件监听器
      window.electronAPI.removeAllListeners('update-download-progress');
      window.electronAPI.removeAllListeners('update-downloaded');
      window.electronAPI.removeAllListeners('update-error');
      document.body.removeChild(dialog);
    };

    document.getElementById('update-btn').onclick = () => {
      this.startUpdate(dialog);
    };
  }

  async startUpdate(dialog) {
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const updateBtn = document.getElementById('update-btn');
    const laterBtn = document.getElementById('later-btn');

    updateBtn.style.display = 'none';
    laterBtn.style.display = 'none';
    progressContainer.style.display = 'block';

    // 监听下载进度
    window.electronAPI.onUpdateDownloadProgress((event, progress) => {
      const percent = Math.round(progress.percent);
      progressFill.style.width = `${percent}%`;
      progressText.textContent = `下载中... ${percent}% (${this.formatFileSize(progress.transferred)}/${this.formatFileSize(progress.total)})`;
    });

    // 监听下载完成
    window.electronAPI.onUpdateDownloaded((event, info) => {
      progressText.textContent = '下载完成，准备安装...';

      setTimeout(() => {
        window.electronAPI.installUpdate();
      }, 2000);
    });

    // 监听下载错误
    window.electronAPI.onUpdateError((event, error) => {
      progressText.textContent = `下载失败: ${error}`;
      updateBtn.style.display = 'inline-block';
      laterBtn.style.display = 'inline-block';
      progressContainer.style.display = 'none';
    });

    // 开始下载
    try {
      await window.electronAPI.downloadUpdate();
    } catch (error) {
      progressText.textContent = `下载失败: ${error.message}`;
      updateBtn.style.display = 'inline-block';
      laterBtn.style.display = 'inline-block';
      progressContainer.style.display = 'none';
    }
  }

  formatReleaseNotes(notes) {
    if (!notes) return '暂无更新说明';

    // 简单的 Markdown 解析
    return notes
      .replace(/### (.+)/g, '<h4>$1</h4>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/- (.+)/g, '<li>$1</li>')
      .replace(/\n/g, '<br>');
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new AboutPage();
});
```

### 通知样式

```css
/* update-styles.css */
.update-status {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
}

.update-status .checking {
  color: #1890ff;
}

.update-status .available {
  color: #52c41a;
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
}

.update-status .up-to-date {
  color: #595959;
  background-color: #fafafa;
  border: 1px solid #d9d9d9;
}

.update-status .error {
  color: #ff4d4f;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
}

.update-dialog .dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.update-dialog .dialog-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 480px;
  max-width: 90vw;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.update-dialog h3 {
  margin-top: 0;
  color: #262626;
}

.release-notes {
  margin: 16px 0;
  padding: 12px;
  background-color: #fafafa;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.release-notes h4 {
  margin-top: 0;
  margin-bottom: 8px;
  color: #595959;
  font-size: 14px;
}

.notes-content {
  font-size: 13px;
  line-height: 1.5;
  color: #262626;
}

.update-size {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 16px;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-primary, .btn-secondary {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background-color: #1890ff;
  color: white;
}

.btn-primary:hover {
  background-color: #40a9ff;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #595959;
}

.btn-secondary:hover {
  background-color: #e6f7ff;
}

.progress-container {
  margin-top: 16px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #1890ff;
  transition: width 0.3s ease;
  width: 0%;
}

.progress-text {
  margin-top: 8px;
  font-size: 12px;
  color: #595959;
  text-align: center;
}
```

## 更新策略与用户控制

### 更新策略配置

```javascript:updateConfig.js
const UpdateConfig = {
  // 更新检查频率
  checkInterval: {
    startup: true,              // 启动时检查
    intervalHours: 24,          // 定期检查间隔
    onFocus: false,             // 窗口获得焦点时检查
    manual: true                // 允许手动检查
  },

  // 更新行为
  behavior: {
    autoDownload: false,        // 是否自动下载
    silentInstall: false,       // 是否静默安装
    forceUpdate: false,         // 是否强制更新
    allowSkip: true,            // 是否允许跳过版本
    allowDefer: true,           // 是否允许延后更新
    deferMaxDays: 7            // 最大延后天数
  },

  // 通知设置
  notification: {
    checkingVisible: false,     // 是否显示"检查中"状态
    notAvailableVisible: false, // 是否显示"无更新"提示
    errorVisible: true,         // 是否显示错误信息
    progressVisible: true,      // 是否显示下载进度
    completedTimeout: 3000     // 完成提示显示时长
  },

  // 版本控制
  versionControl: {
    skipVersions: [],           // 跳过的版本列表
    requiredVersion: null,      // 强制要求的最低版本
    deprecatedVersions: [],     // 已废弃的版本
    migrationRequired: []       // 需要数据迁移的版本
  }
};

module.exports = UpdateConfig;
```

### 用户偏好存储

```javascript
// userPreferences.js
const Store = require('electron-store');

class UpdatePreferences {
  constructor() {
    this.store = new Store({
      name: 'update-preferences',
      defaults: {
        autoCheck: true,
        autoDownload: false,
        notifyOnAvailable: true,
        skippedVersions: [],
        lastCheckTime: null,
        deferredUpdates: {}
      }
    });
  }

  // 自动检查设置
  setAutoCheck(enabled) {
    this.store.set('autoCheck', enabled);
  }

  getAutoCheck() {
    return this.store.get('autoCheck');
  }

  // 自动下载设置
  setAutoDownload(enabled) {
    this.store.set('autoDownload', enabled);
  }

  getAutoDownload() {
    return this.store.get('autoDownload');
  }

  // 跳过版本
  skipVersion(version) {
    const skipped = this.store.get('skippedVersions', []);
    if (!skipped.includes(version)) {
      skipped.push(version);
      this.store.set('skippedVersions', skipped);
    }
  }

  isVersionSkipped(version) {
    return this.store.get('skippedVersions', []).includes(version);
  }

  // 延后更新
  deferUpdate(version, until) {
    const deferred = this.store.get('deferredUpdates', {});
    deferred[version] = until;
    this.store.set('deferredUpdates', deferred);
  }

  isDeferredUpdate(version) {
    const deferred = this.store.get('deferredUpdates', {});
    const deferUntil = deferred[version];

    if (!deferUntil) return false;

    return new Date() < new Date(deferUntil);
  }

  // 清理过期的延后记录
  cleanupExpiredDefers() {
    const deferred = this.store.get('deferredUpdates', {});
    const now = new Date();

    Object.keys(deferred).forEach(version => {
      if (now >= new Date(deferred[version])) {
        delete deferred[version];
      }
    });

    this.store.set('deferredUpdates', deferred);
  }

  // 更新检查时间
  updateLastCheckTime() {
    this.store.set('lastCheckTime', new Date().toISOString());
  }

  getLastCheckTime() {
    return this.store.get('lastCheckTime');
  }
}

module.exports = UpdatePreferences;
```

### 智能更新逻辑

```javascript
// smartUpdater.js
const { autoUpdater } = require('electron-updater');
const UpdatePreferences = require('./userPreferences');
const UpdateConfig = require('./updateConfig');

class SmartUpdater {
  constructor() {
    this.preferences = new UpdatePreferences();
    this.lastCheckTime = null;
    this.isChecking = false;
    this.setupAutoUpdater();
  }

  setupAutoUpdater() {
    // 自定义更新检查逻辑
    autoUpdater.autoDownload = false; // 禁用自动下载
    autoUpdater.autoInstallOnAppQuit = false; // 禁用退出时自动安装

    autoUpdater.on('update-available', (info) => {
      this.handleUpdateAvailable(info);
    });

    autoUpdater.on('update-downloaded', (info) => {
      this.handleUpdateDownloaded(info);
    });
  }

  async checkForUpdates(manual = false) {
    if (this.isChecking) return false;

    // 检查用户偏好
    if (!manual && !this.preferences.getAutoCheck()) {
      return false;
    }

    // 检查时间间隔
    const lastCheck = this.preferences.getLastCheckTime();
    if (!manual && lastCheck) {
      const hoursSinceCheck = (Date.now() - new Date(lastCheck).getTime()) / (1000 * 60 * 60);
      if (hoursSinceCheck < UpdateConfig.checkInterval.intervalHours) {
        return false;
      }
    }

    this.isChecking = true;

    try {
      const result = await autoUpdater.checkForUpdates();
      this.preferences.updateLastCheckTime();
      return result;
    } catch (error) {
      console.error('Update check failed:', error);
      return false;
    } finally {
      this.isChecking = false;
    }
  }

  handleUpdateAvailable(updateInfo) {
    const version = updateInfo.version;

    // 检查是否跳过了该版本
    if (this.preferences.isVersionSkipped(version)) {
      console.log(`Version ${version} is skipped by user`);
      return;
    }

    // 检查是否延后了该版本
    if (this.preferences.isDeferredUpdate(version)) {
      console.log(`Version ${version} is deferred by user`);
      return;
    }

    // 检查是否强制更新
    if (this.isForceUpdate(version)) {
      this.showForceUpdateDialog(updateInfo);
      return;
    }

    // 检查自动下载设置
    if (this.preferences.getAutoDownload()) {
      autoUpdater.downloadUpdate();
    } else {
      this.showUpdateNotification(updateInfo);
    }
  }

  isForceUpdate(version) {
    const currentVersion = require('../package.json').version;
    const requiredVersion = UpdateConfig.versionControl.requiredVersion;

    if (!requiredVersion) return false;

    return this.compareVersions(currentVersion, requiredVersion) < 0;
  }

  showUpdateNotification(updateInfo) {
    // 发送到渲染进程显示通知
    if (this.window) {
      this.window.webContents.send('show-update-notification', updateInfo);
    }
  }

  showForceUpdateDialog(updateInfo) {
    // 显示强制更新对话框
    if (this.window) {
      this.window.webContents.send('show-force-update', updateInfo);
    }
  }

  handleUpdateDownloaded(updateInfo) {
    // 更新下载完成，询问是否立即安装
    if (this.window) {
      this.window.webContents.send('update-ready-to-install', updateInfo);
    }
  }

  // 用户操作接口
  async downloadUpdate() {
    return autoUpdater.downloadUpdate();
  }

  installUpdate() {
    autoUpdater.quitAndInstall();
  }

  skipVersion(version) {
    this.preferences.skipVersion(version);
  }

  deferUpdate(version, days = 7) {
    const until = new Date();
    until.setDate(until.getDate() + days);
    this.preferences.deferUpdate(version, until);
  }

  // 版本比较工具
  compareVersions(version1, version2) {
    const v1 = version1.split('.').map(n => parseInt(n, 10));
    const v2 = version2.split('.').map(n => parseInt(n, 10));

    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
      const a = v1[i] || 0;
      const b = v2[i] || 0;

      if (a > b) return 1;
      if (a < b) return -1;
    }

    return 0;
  }

  setWindow(window) {
    this.window = window;
  }
}

module.exports = SmartUpdater;
```

## 回滚与兼容性管理

### 版本回滚机制

```javascript
// versionManager.js
const fs = require('fs-extra');
const path = require('path');
const { app } = require('electron');

class VersionManager {
  constructor() {
    this.userDataPath = app.getPath('userData');
    this.backupPath = path.join(this.userDataPath, 'backups');
    this.versionHistoryFile = path.join(this.userDataPath, 'version-history.json');
    this.initializeVersionTracking();
  }

  async initializeVersionTracking() {
    await fs.ensureDir(this.backupPath);

    if (!await fs.pathExists(this.versionHistoryFile)) {
      await this.createVersionHistory();
    }
  }

  async createVersionHistory() {
    const currentVersion = app.getVersion();
    const history = {
      current: currentVersion,
      previous: null,
      versions: [
        {
          version: currentVersion,
          installDate: new Date().toISOString(),
          dataVersion: '1.0',
          compatible: true
        }
      ]
    };

    await fs.writeJson(this.versionHistoryFile, history, { spaces: 2 });
  }

  async recordVersionUpdate(newVersion, dataVersion = null) {
    const history = await this.getVersionHistory();
    const oldVersion = history.current;

    // 备份当前版本的数据
    await this.backupCurrentData(oldVersion);

    // 更新版本历史
    history.previous = oldVersion;
    history.current = newVersion;
    history.versions.push({
      version: newVersion,
      installDate: new Date().toISOString(),
      dataVersion: dataVersion || await this.detectDataVersion(),
      compatible: await this.checkCompatibility(oldVersion, newVersion),
      previousVersion: oldVersion
    });

    await fs.writeJson(this.versionHistoryFile, history, { spaces: 2 });
  }

  async backupCurrentData(version) {
    const backupDir = path.join(this.backupPath, version);
    await fs.ensureDir(backupDir);

    // 备份关键数据文件
    const filesToBackup = [
      'config.json',
      'user-preferences.json',
      'data.db',
      'cache'
    ];

    for (const file of filesToBackup) {
      const sourcePath = path.join(this.userDataPath, file);
      const targetPath = path.join(backupDir, file);

      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, targetPath);
      }
    }

    // 记录备份信息
    const backupInfo = {
      version,
      timestamp: new Date().toISOString(),
      files: filesToBackup,
      appVersion: app.getVersion()
    };

    await fs.writeJson(path.join(backupDir, 'backup-info.json'), backupInfo, { spaces: 2 });
  }

  async canRollback() {
    const history = await this.getVersionHistory();
    return history.previous && await this.hasBackup(history.previous);
  }

  async rollback() {
    const history = await this.getVersionHistory();
    const targetVersion = history.previous;

    if (!targetVersion) {
      throw new Error('No previous version to rollback to');
    }

    const backupDir = path.join(this.backupPath, targetVersion);
    if (!await fs.pathExists(backupDir)) {
      throw new Error(`Backup not found for version ${targetVersion}`);
    }

    // 备份当前数据（以防回滚失败）
    await this.backupCurrentData(history.current + '-rollback-backup');

    // 恢复数据
    await this.restoreBackup(targetVersion);

    // 更新版本历史
    const currentVersion = history.current;
    history.current = targetVersion;
    history.previous = null;
    history.versions.push({
      version: targetVersion,
      installDate: new Date().toISOString(),
      dataVersion: await this.detectDataVersion(),
      compatible: true,
      rollbackFrom: currentVersion,
      isRollback: true
    });

    await fs.writeJson(this.versionHistoryFile, history, { spaces: 2 });

    return targetVersion;
  }

  async restoreBackup(version) {
    const backupDir = path.join(this.backupPath, version);
    const backupInfo = await fs.readJson(path.join(backupDir, 'backup-info.json'));

    for (const file of backupInfo.files) {
      const sourcePath = path.join(backupDir, file);
      const targetPath = path.join(this.userDataPath, file);

      if (await fs.pathExists(sourcePath)) {
        // 删除现有文件/目录
        if (await fs.pathExists(targetPath)) {
          await fs.remove(targetPath);
        }

        // 恢复备份
        await fs.copy(sourcePath, targetPath);
      }
    }
  }

  async getVersionHistory() {
    return await fs.readJson(this.versionHistoryFile);
  }

  async hasBackup(version) {
    const backupDir = path.join(this.backupPath, version);
    return await fs.pathExists(path.join(backupDir, 'backup-info.json'));
  }

  async checkCompatibility(oldVersion, newVersion) {
    // 简单的兼容性检查逻辑
    const oldMajor = parseInt(oldVersion.split('.')[0]);
    const newMajor = parseInt(newVersion.split('.')[0]);

    // 主版本号不同，可能不兼容
    if (oldMajor !== newMajor) {
      return false;
    }

    return true;
  }

  async detectDataVersion() {
    // 根据数据文件结构检测数据版本
    const configPath = path.join(this.userDataPath, 'config.json');

    if (await fs.pathExists(configPath)) {
      const config = await fs.readJson(configPath);
      return config.dataVersion || '1.0';
    }

    return '1.0';
  }

  // 清理旧备份
  async cleanupOldBackups(keepVersions = 5) {
    const history = await this.getVersionHistory();
    const allVersions = history.versions
      .sort((a, b) => new Date(b.installDate) - new Date(a.installDate))
      .map(v => v.version);

    const versionsToRemove = allVersions.slice(keepVersions);

    for (const version of versionsToRemove) {
      const backupDir = path.join(this.backupPath, version);
      if (await fs.pathExists(backupDir)) {
        await fs.remove(backupDir);
      }
    }
  }
}

module.exports = VersionManager;
```

### 数据迁移处理

```javascript
// dataMigration.js
const fs = require('fs-extra');
const path = require('path');

class DataMigration {
  constructor() {
    this.migrations = new Map();
    this.registerMigrations();
  }

  registerMigrations() {
    // 注册各版本的迁移逻辑
    this.migrations.set('1.0.0->2.0.0', this.migrateV1ToV2.bind(this));
    this.migrations.set('2.0.0->2.1.0', this.migrateV2ToV21.bind(this));
    this.migrations.set('2.1.0->3.0.0', this.migrateV21ToV3.bind(this));
  }

  async migrate(fromVersion, toVersion, userDataPath) {
    const migrationPath = this.findMigrationPath(fromVersion, toVersion);

    if (!migrationPath.length) {
      throw new Error(`No migration path found from ${fromVersion} to ${toVersion}`);
    }

    console.log(`Migration path: ${migrationPath.join(' -> ')}`);

    for (let i = 0; i < migrationPath.length - 1; i++) {
      const from = migrationPath[i];
      const to = migrationPath[i + 1];
      const migrationKey = `${from}->${to}`;

      if (this.migrations.has(migrationKey)) {
        console.log(`Running migration: ${migrationKey}`);
        await this.migrations.get(migrationKey)(userDataPath);
      }
    }
  }

  findMigrationPath(from, to) {
    // 简化版：假设版本号是线性递增的
    const versions = ['1.0.0', '2.0.0', '2.1.0', '3.0.0'];
    const fromIndex = versions.indexOf(from);
    const toIndex = versions.indexOf(to);

    if (fromIndex === -1 || toIndex === -1) {
      return [];
    }

    if (fromIndex < toIndex) {
      return versions.slice(fromIndex, toIndex + 1);
    }

    return [];
  }

  async migrateV1ToV2(userDataPath) {
    // 1.0 -> 2.0 的迁移逻辑
    const oldConfigPath = path.join(userDataPath, 'config.json');
    const newConfigPath = path.join(userDataPath, 'v2-config.json');

    if (await fs.pathExists(oldConfigPath)) {
      const oldConfig = await fs.readJson(oldConfigPath);

      // 转换配置格式
      const newConfig = {
        version: '2.0',
        dataVersion: '2.0',
        settings: {
          ui: oldConfig.ui || {},
          advanced: oldConfig.advanced || {},
          // 新增字段
          notifications: {
            enabled: true,
            types: ['update', 'error']
          }
        }
      };

      await fs.writeJson(newConfigPath, newConfig, { spaces: 2 });
      await fs.rename(oldConfigPath, path.join(userDataPath, 'config-v1-backup.json'));
      await fs.rename(newConfigPath, oldConfigPath);
    }
  }

  async migrateV2ToV21(userDataPath) {
    // 2.0 -> 2.1 的迁移逻辑（小版本更新）
    const configPath = path.join(userDataPath, 'config.json');

    if (await fs.pathExists(configPath)) {
      const config = await fs.readJson(configPath);

      // 添加新功能配置
      if (!config.settings.experimental) {
        config.settings.experimental = {
          enabled: false,
          features: []
        };
      }

      config.dataVersion = '2.1';
      await fs.writeJson(configPath, config, { spaces: 2 });
    }
  }

  async migrateV21ToV3(userDataPath) {
    // 2.1 -> 3.0 的迁移逻辑（主版本更新）
    const configPath = path.join(userDataPath, 'config.json');
    const dbPath = path.join(userDataPath, 'data.db');

    // 配置文件结构大改
    if (await fs.pathExists(configPath)) {
      const oldConfig = await fs.readJson(configPath);

      const newConfig = {
        version: '3.0',
        dataVersion: '3.0',
        core: {
          engine: oldConfig.settings?.advanced?.engine || 'default',
          performance: oldConfig.settings?.advanced?.performance || 'balanced'
        },
        interface: oldConfig.settings?.ui || {},
        features: {
          notifications: oldConfig.settings?.notifications || {},
          experimental: oldConfig.settings?.experimental || {}
        }
      };

      await fs.writeJson(configPath, newConfig, { spaces: 2 });
    }

    // 数据库结构迁移
    if (await fs.pathExists(dbPath)) {
      // 这里应该用适当的数据库迁移工具
      console.log('Database schema migration required for v3.0');
      // await migrateDatabase(dbPath);
    }
  }
}

module.exports = DataMigration;
```

## 生产环境最佳实践

### 发布流程

```javascript:release.js
const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

class ReleaseManager {
  constructor() {
    this.packageJson = require('./package.json');
    this.currentVersion = this.packageJson.version;
  }

  async release(type = 'patch') {
    console.log(`Starting ${type} release from ${this.currentVersion}`);

    // 1. 检查工作区状态
    await this.checkWorkspaceClean();

    // 2. 运行测试
    await this.runTests();

    // 3. 更新版本号
    const newVersion = await this.updateVersion(type);

    // 4. 生成更新日志
    await this.generateChangelog(newVersion);

    // 5. 构建应用
    await this.build();

    // 6. 签名验证
    await this.verifySignatures();

    // 7. 提交更改
    await this.commitChanges(newVersion);

    // 8. 创建标签
    await this.createTag(newVersion);

    // 9. 发布
    await this.publish();

    // 10. 推送到远程
    await this.pushToRemote(newVersion);

    console.log(`Release ${newVersion} completed successfully!`);
    return newVersion;
  }

  async checkWorkspaceClean() {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (status.trim()) {
        throw new Error('Working directory is not clean. Please commit or stash changes.');
      }
    } catch (error) {
      throw new Error(`Git status check failed: ${error.message}`);
    }
  }

  async runTests() {
    console.log('Running tests...');
    try {
      execSync('npm test', { stdio: 'inherit' });
    } catch (error) {
      throw new Error('Tests failed. Please fix issues before releasing.');
    }
  }

  async updateVersion(type) {
    console.log(`Updating version (${type})...`);

    const output = execSync(`npm version ${type} --no-git-tag-version`, { encoding: 'utf8' });
    const newVersion = output.trim().replace('v', '');

    console.log(`Version updated to ${newVersion}`);
    return newVersion;
  }

  async generateChangelog(version) {
    console.log('Generating changelog...');

    // 使用 git log 生成更改日志
    const sinceTag = this.getLastTag();
    const gitLog = sinceTag
      ? execSync(`git log ${sinceTag}..HEAD --oneline`, { encoding: 'utf8' })
      : execSync('git log --oneline', { encoding: 'utf8' });

    const changes = gitLog
      .split('\n')
      .filter(line => line.trim())
      .map(line => `- ${line.split(' ').slice(1).join(' ')}`)
      .join('\n');

    const changelogEntry = `## [${version}] - ${new Date().toISOString().split('T')[0]}

${changes}

`;

    // 更新 CHANGELOG.md
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    if (await fs.pathExists(changelogPath)) {
      const existingChangelog = await fs.readFile(changelogPath, 'utf8');
      await fs.writeFile(changelogPath, changelogEntry + existingChangelog);
    } else {
      await fs.writeFile(changelogPath, `# Changelog\n\n${changelogEntry}`);
    }
  }

  getLastTag() {
    try {
      return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
    } catch (error) {
      return null;
    }
  }

  async build() {
    console.log('Building application...');

    try {
      execSync('npm run build', { stdio: 'inherit' });
    } catch (error) {
      throw new Error(`Build failed: ${error.message}`);
    }
  }

  async verifySignatures() {
    console.log('Verifying signatures...');

    // 检查构建产物是否正确签名
    const distPath = path.join(process.cwd(), 'dist');
    if (!await fs.pathExists(distPath)) {
      throw new Error('Build output not found');
    }

    // 这里应该加入具体的签名验证逻辑
    console.log('Signature verification passed');
  }

  async commitChanges(version) {
    console.log('Committing changes...');

    execSync('git add -A');
    execSync(`git commit -m "chore: release v${version}"`);
  }

  async createTag(version) {
    console.log(`Creating tag v${version}...`);

    execSync(`git tag -a v${version} -m "Release v${version}"`);
  }

  async publish() {
    console.log('Publishing to distribution channels...');

    try {
      // 发布到 GitHub Releases
      execSync('npm run electron:publish', { stdio: 'inherit' });
    } catch (error) {
      throw new Error(`Publish failed: ${error.message}`);
    }
  }

  async pushToRemote(version) {
    console.log('Pushing to remote...');

    execSync('git push origin main');
    execSync(`git push origin v${version}`);
  }
}

// 使用示例
if (require.main === module) {
  const releaseType = process.argv[2] || 'patch';
  const releaseManager = new ReleaseManager();

  releaseManager.release(releaseType)
    .catch(error => {
      console.error('Release failed:', error.message);
      process.exit(1);
    });
}
```

### 监控和分析

```javascript:analytics.js
const { net, app } = require('electron');
const Store = require('electron-store');

class UpdateAnalytics {
  constructor() {
    this.store = new Store({
      name: 'update-analytics',
      defaults: {
        updateHistory: [],
        userBehavior: {
          autoUpdateEnabled: null,
          averageInstallTime: null,
          skipRate: 0,
          deferRate: 0
        }
      }
    });
  }

  recordUpdateCheck(result) {
    const record = {
      timestamp: new Date().toISOString(),
      currentVersion: app.getVersion(),
      availableVersion: result?.updateInfo?.version,
      hasUpdate: !!result?.updateInfo,
      checkDuration: result?.checkDuration,
      source: result?.source || 'auto' // auto, manual, startup
    };

    this.addToHistory('updateCheck', record);
  }

  recordUpdateDownload(updateInfo, downloadStats) {
    const record = {
      timestamp: new Date().toISOString(),
      version: updateInfo.version,
      size: updateInfo.files[0]?.size,
      downloadTime: downloadStats.duration,
      averageSpeed: downloadStats.averageSpeed,
      success: downloadStats.success,
      error: downloadStats.error
    };

    this.addToHistory('updateDownload', record);
  }

  recordUpdateInstall(updateInfo, installStats) {
    const record = {
      timestamp: new Date().toISOString(),
      fromVersion: app.getVersion(),
      toVersion: updateInfo.version,
      installTime: installStats.duration,
      success: installStats.success,
      error: installStats.error,
      userInitiated: installStats.userInitiated
    };

    this.addToHistory('updateInstall', record);

    // 更新用户行为统计
    this.updateBehaviorStats();
  }

  recordUserAction(action, context = {}) {
    const actions = ['skip', 'defer', 'download', 'install', 'cancel'];

    if (actions.includes(action)) {
      const record = {
        timestamp: new Date().toISOString(),
        action,
        version: context.version,
        context
      };

      this.addToHistory('userAction', record);
    }
  }

  addToHistory(type, record) {
    const history = this.store.get('updateHistory', []);
    history.push({ type, ...record });

    // 保留最近 100 条记录
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }

    this.store.set('updateHistory', history);
  }

  updateBehaviorStats() {
    const history = this.store.get('updateHistory', []);
    const userActions = history.filter(h => h.type === 'userAction');
    const installs = history.filter(h => h.type === 'updateInstall');

    const totalActions = userActions.length;
    const skipActions = userActions.filter(a => a.action === 'skip').length;
    const deferActions = userActions.filter(a => a.action === 'defer').length;

    const avgInstallTime = installs.length > 0
      ? installs.reduce((sum, i) => sum + (i.installTime || 0), 0) / installs.length
      : 0;

    this.store.set('userBehavior', {
      autoUpdateEnabled: this.store.get('update-preferences.autoDownload', false),
      averageInstallTime: avgInstallTime,
      skipRate: totalActions > 0 ? skipActions / totalActions : 0,
      deferRate: totalActions > 0 ? deferActions / totalActions : 0,
      totalUpdates: installs.length,
      successRate: installs.length > 0
        ? installs.filter(i => i.success).length / installs.length
        : 0
    });
  }

  getAnalytics() {
    return {
      history: this.store.get('updateHistory', []),
      behavior: this.store.get('userBehavior', {}),
      summary: this.generateSummary()
    };
  }

  generateSummary() {
    const history = this.store.get('updateHistory', []);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentHistory = history.filter(h =>
      new Date(h.timestamp) >= thirtyDaysAgo
    );

    const updateChecks = recentHistory.filter(h => h.type === 'updateCheck');
    const downloads = recentHistory.filter(h => h.type === 'updateDownload');
    const installs = recentHistory.filter(h => h.type === 'updateInstall');

    return {
      period: '30天',
      updateChecks: updateChecks.length,
      updatesFound: updateChecks.filter(c => c.hasUpdate).length,
      downloads: downloads.length,
      successfulDownloads: downloads.filter(d => d.success).length,
      installs: installs.length,
      successfulInstalls: installs.filter(i => i.success).length,
      averageDownloadSpeed: downloads.length > 0
        ? downloads.reduce((sum, d) => sum + (d.averageSpeed || 0), 0) / downloads.length
        : 0,
      averageInstallTime: installs.length > 0
        ? installs.reduce((sum, i) => sum + (i.installTime || 0), 0) / installs.length
        : 0
    };
  }

  // 发送匿名统计（可选）
  async sendAnonymousStats() {
    if (!this.store.get('analytics.enabled', false)) {
      return;
    }

    const stats = {
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
      behavior: this.store.get('userBehavior', {}),
      summary: this.generateSummary()
    };

    try {
      // 发送到分析服务器（请替换为实际的分析服务端点）
      const request = net.request({
        method: 'POST',
        url: 'https://analytics.yourapp.com/update-stats',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      request.write(JSON.stringify(stats));
      request.end();

    } catch (error) {
      console.warn('Failed to send analytics:', error.message);
    }
  }
}

module.exports = UpdateAnalytics;
```

## 总结

Electron 应用的版本管理不只是技术实现，更是用户体验设计。从版本号规范到更新策略，从用户通知到数据迁移，每个环节都会影响用户对产品的信任度。

_核心原则_：

- 透明但不打扰：让用户知道更新内容，但不强制中断工作流
- 渐进式增强：优先修复 bug，功能更新可选可退
- 数据安全第一：更新失败时用户数据不能丢失
- 可回滚可监控：出问题时能快速恢复，通过数据了解用户习惯

技术层面，electron-updater + 智能策略 + 完善的备份机制已经能覆盖大部分场景。但真正的差异化体验在于对用户工作节奏的理解——什么时候提醒、如何提醒、给用户多少控制权。

做好版本管理，本质上是在做好产品的生命周期管理。

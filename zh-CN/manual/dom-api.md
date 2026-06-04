---
outline: false
aside: false
layout: doc
date: 2025-10
title: 🌐 HTML DOM API全攻略
description: docker的安装
category: 工具
pageClass: manual-page-class
---

> 掌握18个核心DOM API接口的使用方法

# 从基础操作到高级技巧的完整指南 #

## 📚 学习目标 ##

- 理解每个接口的应用场景和最佳实践
- 学会构建高性能、用户友好的Web应用
- 避免常见的DOM操作陷阱和性能问题

## 🎯 难度等级 ##

*中级到高级* - 适合有一定JavaScript基础的开发者

## 🚀 引言 ##

在现代Web开发中，DOM API是连接JavaScript与HTML的重要桥梁。无论是构建交互式用户界面、处理用户输入，还是实现复杂的媒体功能，DOM API都扮演着至关重要的角色。

本文将深入探讨HTML DOM API的18个核心接口，通过实际代码示例和最佳实践，帮助你掌握现代Web开发的核心技能。本篇文章将重点介绍前9个接口，为你的Web开发之路奠定坚实基础。

## 🎯 核心API详解 ##

### HTML元素接口：DOM操作的基石 ###

**🔍 应用场景**

动态创建页面内容、操作元素属性、管理DOM结构

**❌ 常见问题**

```javascript
// ❌ 直接操作innerHTML，存在XSS风险
function addUserContent(content) {
    document.getElementById('content').innerHTML = content;
}

// ❌ 频繁的DOM查询，性能低下
function updateList(items) {
    for (let item of items) {
        document.getElementById('list').appendChild(createItem(item));
    }
}
```

**✅ 推荐方案**

```javascript
// ✅ 安全的DOM操作工具类
class DOMHelper {
    /**
     * 安全地创建元素并设置属性
     * @param {string} tagName - 元素标签名
     * @param {Object} attributes - 属性对象
     * @param {string|Node} content - 内容
     * @returns {HTMLElement}
     */
    createElement(tagName, attributes = {}, content = '') {
        const element = document.createElement(tagName);
        
        // 设置属性
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.assign(element.dataset, value);
            } else if (key.startsWith('on') && typeof value === 'function') {
                element.addEventListener(key.slice(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, value);
            }
        });
        
        // 设置内容
        if (typeof content === 'string') {
            element.textContent = content;
        } else if (content instanceof Node) {
            element.appendChild(content);
        } else if (Array.isArray(content)) {
            content.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof Node) {
                    element.appendChild(child);
                }
            });
        }
        
        return element;
    }
    
    /**
     * 批量创建元素，提高性能
     * @param {Array} items - 元素配置数组
     * @param {HTMLElement} container - 容器元素
     */
    createBatch(items, container) {
        const fragment = document.createDocumentFragment();
        
        items.forEach(item => {
            const element = this.createElement(item.tag, item.attributes, item.content);
            fragment.appendChild(element);
        });
        
        container.appendChild(fragment);
    }
    
    /**
     * 安全地设置HTML内容
     * @param {HTMLElement} element - 目标元素
     * @param {string} html - HTML字符串
     */
    setHTML(element, html) {
        // 简单的XSS防护
        const sanitized = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
        
        element.innerHTML = sanitized;
    }
}

// 使用示例
const domHelper = new DOMHelper();

// 创建复杂的用户卡片
const userCard = domHelper.createElement('div', {
    className: 'user-card',
    dataset: { userId: '123' }
}, [
    domHelper.createElement('img', {
        src: 'avatar.jpg',
        alt: '用户头像',
        className: 'avatar'
    }),
    domHelper.createElement('div', { className: 'user-info' }, [
        domHelper.createElement('h3', {}, '张三'),
        domHelper.createElement('p', {}, '前端开发工程师')
    ])
]);

document.body.appendChild(userCard);
```

### Web应用程序和浏览器集成接口：现代Web体验的关键 ###

**🔍 应用场景**

PWA应用、地理位置服务、设备信息获取、通知推送

**❌ 常见问题**

```javascript
// ❌ 不检查API支持性
navigator.geolocation.getCurrentPosition(success, error);

// ❌ 不处理权限问题
Notification.requestPermission().then(permission => {
    new Notification('Hello World');
});
```

**✅ 推荐方案**

```javascript
// ✅ 完善的Web应用集成管理器
class WebAppManager {
    constructor() {
        this.features = this.detectFeatures();
    }
    
    /**
     * 检测浏览器支持的功能
     * @returns {Object} 功能支持情况
     */
    detectFeatures() {
        return {
            geolocation: 'geolocation' in navigator,
            notification: 'Notification' in window,
            serviceWorker: 'serviceWorker' in navigator,
            webShare: 'share' in navigator,
            deviceOrientation: 'DeviceOrientationEvent' in window,
            battery: 'getBattery' in navigator,
            online: 'onLine' in navigator
        };
    }
    
    /**
     * 获取地理位置
     * @param {Object} options - 配置选项
     * @returns {Promise}
     */
    async getLocation(options = {}) {
        if (!this.features.geolocation) {
            throw new Error('地理位置API不支持');
        }
        
        const defaultOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5分钟缓存
        };
        
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                position => resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                }),
                error => {
                    const errorMessages = {
                        1: '用户拒绝了地理位置请求',
                        2: '位置信息不可用',
                        3: '请求超时'
                    };
                    reject(new Error(errorMessages[error.code] || '未知错误'));
                },
                { ...defaultOptions, ...options }
            );
        });
    }
    
    /**
     * 发送通知
     * @param {string} title - 通知标题
     * @param {Object} options - 通知选项
     * @returns {Promise}
     */
    async sendNotification(title, options = {}) {
        if (!this.features.notification) {
            throw new Error('通知API不支持');
        }
        
        // 请求权限
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                throw new Error('通知权限被拒绝');
            }
        }
        
        if (Notification.permission !== 'granted') {
            throw new Error('没有通知权限');
        }
        
        const notification = new Notification(title, {
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            ...options
        });
        
        // 自动关闭
        if (options.autoClose !== false) {
            setTimeout(() => notification.close(), options.duration || 5000);
        }
        
        return notification;
    }
    
    /**
     * 注册Service Worker
     * @param {string} scriptURL - SW脚本路径
     * @returns {Promise}
     */
    async registerServiceWorker(scriptURL) {
        if (!this.features.serviceWorker) {
            throw new Error('Service Worker不支持');
        }
        
        try {
            const registration = await navigator.serviceWorker.register(scriptURL);
            console.log('Service Worker注册成功:', registration);
            return registration;
        } catch (error) {
            console.error('Service Worker注册失败:', error);
            throw error;
        }
    }
    
    /**
     * 分享内容
     * @param {Object} shareData - 分享数据
     * @returns {Promise}
     */
    async shareContent(shareData) {
        if (this.features.webShare) {
            try {
                await navigator.share(shareData);
                return true;
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('分享失败:', error);
                }
                return false;
            }
        } else {
            // 降级方案：复制到剪贴板
            try {
                await navigator.clipboard.writeText(shareData.url || shareData.text);
                this.sendNotification('已复制到剪贴板', {
                    body: '链接已复制，可以粘贴分享给朋友'
                });
                return true;
            } catch (error) {
                console.error('复制失败:', error);
                return false;
            }
        }
    }
    
    /**
     * 监听网络状态
     * @param {Function} callback - 状态变化回调
     */
    onNetworkChange(callback) {
        if (!this.features.online) return;
        
        const handleOnline = () => callback(true);
        const handleOffline = () => callback(false);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        // 返回清理函数
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }
}

// 使用示例
const webApp = new WebAppManager();

// 获取位置信息
webApp.getLocation()
    .then(location => {
        console.log('当前位置:', location);
    })
    .catch(error => {
        console.error('获取位置失败:', error.message);
    });

// 发送通知
webApp.sendNotification('欢迎回来！', {
    body: '您有新的消息等待查看',
    icon: '/notification-icon.png'
});

// 分享内容
document.getElementById('share-btn').addEventListener('click', () => {
    webApp.shareContent({
        title: '精彩内容分享',
        text: '这是一个很棒的文章',
        url: window.location.href
    });
});
```

### 表单支持接口：用户输入的艺术 ###

**🔍 应用场景**

表单验证、文件上传、用户输入处理

**❌ 常见问题**

```javascript
// ❌ 简单的表单验证，用户体验差
function validateForm() {
    const email = document.getElementById('email').value;
    if (!email.includes('@')) {
        alert('邮箱格式错误');
        return false;
    }
    return true;
}
```

**✅ 推荐方案**

```javascript
// ✅ 现代化表单验证器
class FormValidator {
    constructor(form, options = {}) {
        this.form = form;
        this.options = {
            showErrors: true,
            realTimeValidation: true,
            errorClass: 'error',
            successClass: 'success',
            ...options
        };
        this.rules = new Map();
        this.errors = new Map();
        this.init();
    }
    
    /**
     * 添加验证规则
     * @param {string} fieldName - 字段名
     * @param {Array} rules - 验证规则数组
     */
    addRule(fieldName, rules) {
        this.rules.set(fieldName, rules);
        
        if (this.options.realTimeValidation) {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.addEventListener('blur', () => this.validateField(fieldName));
                field.addEventListener('input', () => this.clearFieldError(fieldName));
            }
        }
    }
    
    /**
     * 验证单个字段
     * @param {string} fieldName - 字段名
     * @returns {boolean}
     */
    validateField(fieldName) {
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        if (!field) return true;
        
        const rules = this.rules.get(fieldName) || [];
        const value = field.value.trim();
        
        for (const rule of rules) {
            const result = this.executeRule(rule, value, field);
            if (!result.valid) {
                this.setFieldError(fieldName, result.message);
                return false;
            }
        }
        
        this.clearFieldError(fieldName);
        return true;
    }
    
    /**
     * 执行验证规则
     * @param {Object} rule - 验证规则
     * @param {string} value - 字段值
     * @param {HTMLElement} field - 字段元素
     * @returns {Object}
     */
    executeRule(rule, value, field) {
        const { type, message, ...params } = rule;
        
        switch (type) {
            case 'required':
                return {
                    valid: value.length > 0,
                    message: message || '此字段为必填项'
                };
                
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return {
                    valid: !value || emailRegex.test(value),
                    message: message || '请输入有效的邮箱地址'
                };
                
            case 'minLength':
                return {
                    valid: value.length >= params.min,
                    message: message || `最少需要${params.min}个字符`
                };
                
            case 'maxLength':
                return {
                    valid: value.length <= params.max,
                    message: message || `最多允许${params.max}个字符`
                };
                
            case 'pattern':
                return {
                    valid: !value || params.regex.test(value),
                    message: message || '格式不正确'
                };
                
            case 'custom':
                return params.validator(value, field);
                
            default:
                return { valid: true };
        }
    }
    
    /**
     * 设置字段错误
     * @param {string} fieldName - 字段名
     * @param {string} message - 错误信息
     */
    setFieldError(fieldName, message) {
        this.errors.set(fieldName, message);
        
        if (this.options.showErrors) {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            const errorElement = this.getErrorElement(fieldName);
            
            field.classList.add(this.options.errorClass);
            field.classList.remove(this.options.successClass);
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
    
    /**
     * 清除字段错误
     * @param {string} fieldName - 字段名
     */
    clearFieldError(fieldName) {
        this.errors.delete(fieldName);
        
        if (this.options.showErrors) {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            const errorElement = this.getErrorElement(fieldName);
            
            field.classList.remove(this.options.errorClass);
            field.classList.add(this.options.successClass);
            errorElement.style.display = 'none';
        }
    }
    
    /**
     * 获取错误显示元素
     * @param {string} fieldName - 字段名
     * @returns {HTMLElement}
     */
    getErrorElement(fieldName) {
        let errorElement = this.form.querySelector(`[data-error="${fieldName}"]`);
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.setAttribute('data-error', fieldName);
            errorElement.style.display = 'none';
            
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            field.parentNode.insertBefore(errorElement, field.nextSibling);
        }
        
        return errorElement;
    }
    
    /**
     * 验证整个表单
     * @returns {boolean}
     */
    validate() {
        let isValid = true;
        
        for (const fieldName of this.rules.keys()) {
            if (!this.validateField(fieldName)) {
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    /**
     * 获取表单数据
     * @returns {Object}
     */
    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            if (data[key]) {
                // 处理多选字段
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        return data;
    }
    
    /**
     * 初始化表单验证
     */
    init() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (this.validate()) {
                const data = this.getFormData();
                this.options.onSubmit?.(data);
            }
        });
    }
}

// 使用示例
const form = document.getElementById('user-form');
const validator = new FormValidator(form, {
    onSubmit: (data) => {
        console.log('表单提交:', data);
        // 处理表单提交
    }
});

// 添加验证规则
validator.addRule('email', [
    { type: 'required' },
    { type: 'email' }
]);

validator.addRule('password', [
    { type: 'required' },
    { type: 'minLength', min: 8, message: '密码至少8位' },
    { 
        type: 'pattern', 
        regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        message: '密码必须包含大小写字母和数字'
    }
]);

validator.addRule('phone', [
    { type: 'required' },
    {
        type: 'custom',
        validator: (value) => {
            const phoneRegex = /^1[3-9]\d{9}$/;
            return {
                valid: phoneRegex.test(value),
                message: '请输入有效的手机号码'
            };
        }
    }
]);
```

### Canvas接口：图形绘制的魔法 ###

**🔍 应用场景**

数据可视化、图像处理、游戏开发、动画效果

**❌ 常见问题**

```javascript
// ❌ 直接操作canvas，代码混乱
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'red';
ctx.fillRect(10, 10, 100, 100);
```

**✅ 推荐方案**

```javascript
// ✅ Canvas绘图管理器
class CanvasManager {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.options = {
            pixelRatio: window.devicePixelRatio || 1,
            ...options
        };
        this.setupCanvas();
        this.animations = new Set();
    }
    
    /**
     * 设置Canvas尺寸和分辨率
     */
    setupCanvas() {
        const { pixelRatio } = this.options;
        const rect = this.canvas.getBoundingClientRect();
        
        // 设置实际尺寸
        this.canvas.width = rect.width * pixelRatio;
        this.canvas.height = rect.height * pixelRatio;
        
        // 设置显示尺寸
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // 缩放上下文以匹配设备像素比
        this.ctx.scale(pixelRatio, pixelRatio);
    }
    
    /**
     * 清空画布
     */
    clear() {
        const { pixelRatio } = this.options;
        this.ctx.clearRect(0, 0, this.canvas.width / pixelRatio, this.canvas.height / pixelRatio);
    }
    
    /**
     * 绘制圆形
     * @param {number} x - 中心X坐标
     * @param {number} y - 中心Y坐标
     * @param {number} radius - 半径
     * @param {Object} style - 样式配置
     */
    drawCircle(x, y, radius, style = {}) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        
        if (style.fill) {
            this.ctx.fillStyle = style.fill;
            this.ctx.fill();
        }
        
        if (style.stroke) {
            this.ctx.strokeStyle = style.stroke;
            this.ctx.lineWidth = style.lineWidth || 1;
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    /**
     * 绘制矩形
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {Object} style - 样式配置
     */
    drawRect(x, y, width, height, style = {}) {
        this.ctx.save();
        
        if (style.fill) {
            this.ctx.fillStyle = style.fill;
            this.ctx.fillRect(x, y, width, height);
        }
        
        if (style.stroke) {
            this.ctx.strokeStyle = style.stroke;
            this.ctx.lineWidth = style.lineWidth || 1;
            this.ctx.strokeRect(x, y, width, height);
        }
        
        this.ctx.restore();
    }
    
    /**
     * 绘制文本
     * @param {string} text - 文本内容
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {Object} style - 样式配置
     */
    drawText(text, x, y, style = {}) {
        this.ctx.save();
        
        this.ctx.font = style.font || '16px Arial';
        this.ctx.textAlign = style.align || 'left';
        this.ctx.textBaseline = style.baseline || 'top';
        
        if (style.fill) {
            this.ctx.fillStyle = style.fill;
            this.ctx.fillText(text, x, y);
        }
        
        if (style.stroke) {
            this.ctx.strokeStyle = style.stroke;
            this.ctx.lineWidth = style.lineWidth || 1;
            this.ctx.strokeText(text, x, y);
        }
        
        this.ctx.restore();
    }
    
    /**
     * 绘制线条
     * @param {Array} points - 点数组 [{x, y}, ...]
     * @param {Object} style - 样式配置
     */
    drawLine(points, style = {}) {
        if (points.length < 2) return;
        
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        
        this.ctx.strokeStyle = style.stroke || '#000';
        this.ctx.lineWidth = style.lineWidth || 1;
        this.ctx.lineCap = style.lineCap || 'round';
        this.ctx.lineJoin = style.lineJoin || 'round';
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    /**
     * 创建动画
     * @param {Function} drawFunction - 绘制函数
     * @param {number} duration - 动画时长(ms)
     * @returns {Object} 动画控制对象
     */
    createAnimation(drawFunction, duration = 1000) {
        const animation = {
            startTime: null,
            duration,
            isRunning: false,
            
            start: () => {
                animation.isRunning = true;
                animation.startTime = performance.now();
                this.animations.add(animation);
                this.startAnimationLoop();
            },
            
            stop: () => {
                animation.isRunning = false;
                this.animations.delete(animation);
            }
        };
        
        animation.draw = (currentTime) => {
            if (!animation.startTime) animation.startTime = currentTime;
            
            const elapsed = currentTime - animation.startTime;
            const progress = Math.min(elapsed / animation.duration, 1);
            
            drawFunction(progress);
            
            if (progress >= 1) {
                animation.stop();
            }
        };
        
        return animation;
    }
    
    /**
     * 启动动画循环
     */
    startAnimationLoop() {
        if (this.animationId) return;
        
        const animate = (currentTime) => {
            this.clear();
            
            for (const animation of this.animations) {
                if (animation.isRunning) {
                    animation.draw(currentTime);
                }
            }
            
            if (this.animations.size > 0) {
                this.animationId = requestAnimationFrame(animate);
            } else {
                this.animationId = null;
            }
        };
        
        this.animationId = requestAnimationFrame(animate);
    }
}

// 使用示例
const canvas = document.getElementById('my-canvas');
const canvasManager = new CanvasManager(canvas);

// 绘制静态图形
canvasManager.drawCircle(100, 100, 50, {
    fill: '#ff6b6b',
    stroke: '#333',
    lineWidth: 2
});

canvasManager.drawRect(200, 50, 100, 100, {
    fill: '#4ecdc4',
    stroke: '#333',
    lineWidth: 2
});

// 创建动画
const bounceAnimation = canvasManager.createAnimation((progress) => {
    const y = 100 + Math.sin(progress * Math.PI * 4) * 20;
    canvasManager.drawCircle(400, y, 30, {
        fill: `hsl(${progress * 360}, 70%, 60%)`
    });
}, 2000);

bounceAnimation.start();
```

### 媒体接口：音视频的完美控制 ###

**🔍 应用场景**

视频播放器、音频处理、媒体流控制、实时通信

**❌ 常见问题**

```javascript
// ❌ 简单的媒体控制，缺乏错误处理
const video = document.getElementById('video');
video.play();
video.volume = 0.5;
```

**✅ 推荐方案**

```javascript
// ✅ 专业媒体播放器
class MediaPlayer {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            autoplay: false,
            controls: true,
            preload: 'metadata',
            ...options
        };
        this.state = {
            isPlaying: false,
            currentTime: 0,
            duration: 0,
            volume: 1,
            muted: false,
            buffered: 0
        };
        this.listeners = new Map();
        this.init();
    }
    
    /**
     * 初始化播放器
     */
    init() {
        this.setupElement();
        this.bindEvents();
        this.createControls();
    }
    
    /**
     * 设置媒体元素
     */
    setupElement() {
        Object.assign(this.element, this.options);
        this.element.preload = this.options.preload;
    }
    
    /**
     * 绑定事件监听器
     */
    bindEvents() {
        const events = [
            'loadstart', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough',
            'play', 'pause', 'ended', 'timeupdate', 'progress', 'volumechange',
            'error', 'waiting', 'seeking', 'seeked'
        ];
        
        events.forEach(event => {
            this.element.addEventListener(event, (e) => {
                this.handleEvent(event, e);
            });
        });
    }
    
    /**
     * 处理媒体事件
     * @param {string} eventType - 事件类型
     * @param {Event} event - 事件对象
     */
    handleEvent(eventType, event) {
        switch (eventType) {
            case 'loadedmetadata':
                this.state.duration = this.element.duration;
                break;
                
            case 'timeupdate':
                this.state.currentTime = this.element.currentTime;
                this.updateProgress();
                break;
                
            case 'play':
                this.state.isPlaying = true;
                break;
                
            case 'pause':
            case 'ended':
                this.state.isPlaying = false;
                break;
                
            case 'volumechange':
                this.state.volume = this.element.volume;
                this.state.muted = this.element.muted;
                break;
                
            case 'progress':
                this.updateBuffered();
                break;
                
            case 'error':
                this.handleError(this.element.error);
                break;
        }
        
        // 触发自定义事件
        this.emit(eventType, { ...this.state, originalEvent: event });
    }
    
    /**
     * 播放媒体
     * @returns {Promise}
     */
    async play() {
        try {
            await this.element.play();
            return true;
        } catch (error) {
            console.error('播放失败:', error);
            this.emit('playError', error);
            return false;
        }
    }
    
    /**
     * 暂停媒体
     */
    pause() {
        this.element.pause();
    }
    
    /**
     * 切换播放/暂停
     */
    toggle() {
        if (this.state.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    /**
     * 设置播放时间
     * @param {number} time - 时间(秒)
     */
    seek(time) {
        if (time >= 0 && time <= this.state.duration) {
            this.element.currentTime = time;
        }
    }
    
    /**
     * 设置音量
     * @param {number} volume - 音量(0-1)
     */
    setVolume(volume) {
        this.element.volume = Math.max(0, Math.min(1, volume));
    }
    
    /**
     * 切换静音
     */
    toggleMute() {
        this.element.muted = !this.element.muted;
    }
    
    /**
     * 设置播放速度
     * @param {number} rate - 播放速度
     */
    setPlaybackRate(rate) {
        this.element.playbackRate = rate;
    }
    
    /**
     * 更新缓冲进度
     */
    updateBuffered() {
        if (this.element.buffered.length > 0) {
            const bufferedEnd = this.element.buffered.end(this.element.buffered.length - 1);
            this.state.buffered = (bufferedEnd / this.state.duration) * 100;
        }
    }
    
    /**
     * 更新播放进度
     */
    updateProgress() {
        const progress = (this.state.currentTime / this.state.duration) * 100;
        this.emit('progress', progress);
    }
    
    /**
     * 处理错误
     * @param {MediaError} error - 媒体错误
     */
    handleError(error) {
        const errorMessages = {
            1: '媒体加载被中止',
            2: '网络错误导致媒体下载失败',
            3: '媒体解码失败',
            4: '媒体格式不支持'
        };
        
        const message = errorMessages[error.code] || '未知错误';
        console.error('媒体错误:', message);
        this.emit('error', { code: error.code, message });
    }
    
    /**
     * 创建自定义控制器
     */
    createControls() {
        if (!this.options.customControls) return;
        
        const controls = document.createElement('div');
        controls.className = 'media-controls';
        controls.innerHTML = `
            <button class="play-btn">播放</button>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="buffered-bar"></div>
                    <div class="played-bar"></div>
                    <div class="progress-handle"></div>
                </div>
            </div>
            <span class="time-display">00:00 / 00:00</span>
            <button class="volume-btn">音量</button>
            <div class="volume-slider">
                <input type="range" min="0" max="1" step="0.1" value="1">
            </div>
        `;
        
        this.element.parentNode.insertBefore(controls, this.element.nextSibling);
        this.bindControlEvents(controls);
    }
    
    /**
     * 绑定控制器事件
     * @param {HTMLElement} controls - 控制器元素
     */
    bindControlEvents(controls) {
        const playBtn = controls.querySelector('.play-btn');
        const progressBar = controls.querySelector('.progress-bar');
        const volumeSlider = controls.querySelector('.volume-slider input');
        
        playBtn.addEventListener('click', () => this.toggle());
        
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.seek(percent * this.state.duration);
        });
        
        volumeSlider.addEventListener('input', (e) => {
            this.setVolume(parseFloat(e.target.value));
        });
    }
    
    /**
     * 事件监听
     * @param {string} event - 事件名
     * @param {Function} callback - 回调函数
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    /**
     * 触发事件
     * @param {string} event - 事件名
     * @param {*} data - 事件数据
     */
    emit(event, data) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => callback(data));
    }
    
    /**
     * 格式化时间
     * @param {number} seconds - 秒数
     * @returns {string}
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

// 使用示例
const video = document.getElementById('my-video');
const player = new MediaPlayer(video, {
    customControls: true,
    autoplay: false
});

// 监听播放器事件
player.on('play', () => {
    console.log('开始播放');
});

player.on('pause', () => {
    console.log('暂停播放');
});

player.on('progress', (progress) => {
    console.log('播放进度:', progress + '%');
});

player.on('error', (error) => {
    console.error('播放器错误:', error);
});
```

### 拖放接口：交互体验的升华 ###

**🔍 应用场景**

文件上传、界面定制、数据排序、内容编辑

**❌ 常见问题**

```javascript
// ❌ 简单的拖放实现，功能有限
element.draggable = true;
element.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text', element.id);
});
```

**✅ 推荐方案**

```javascript
// ✅ 功能完整的拖放管理器
class DragDropManager {
    constructor() {
        this.dragData = null;
        this.dropZones = new Map();
        this.draggableElements = new Map();
    }
    
    /**
     * 使元素可拖拽
     * @param {HTMLElement} element - 元素
     * @param {Object} data - 拖拽数据
     * @param {Object} options - 配置选项
     */
    makeDraggable(element, data, options = {}) {
        element.draggable = true;
        
        const config = {
            dragImage: null,
            dragImageOffset: { x: 0, y: 0 },
            ...options
        };
        
        this.draggableElements.set(element, { data, config });
        
        element.addEventListener('dragstart', (e) => {
            this.handleDragStart(e, element, data, config);
        });
        
        element.addEventListener('dragend', (e) => {
            this.handleDragEnd(e, element);
        });
    }
    
    /**
     * 设置拖放区域
     * @param {HTMLElement} element - 拖放区域元素
     * @param {Object} options - 配置选项
     */
    makeDropZone(element, options = {}) {
        const config = {
            acceptTypes: ['*'],
            onDragEnter: null,
            onDragOver: null,
            onDragLeave: null,
            onDrop: null,
            ...options
        };
        
        this.dropZones.set(element, config);
        
        element.addEventListener('dragenter', (e) => {
            this.handleDragEnter(e, element, config);
        });
        
        element.addEventListener('dragover', (e) => {
            this.handleDragOver(e, element, config);
        });
        
        element.addEventListener('dragleave', (e) => {
            this.handleDragLeave(e, element, config);
        });
        
        element.addEventListener('drop', (e) => {
            this.handleDrop(e, element, config);
        });
    }
    
    /**
     * 处理拖拽开始
     * @param {DragEvent} event - 拖拽事件
     * @param {HTMLElement} element - 拖拽元素
     * @param {Object} data - 拖拽数据
     * @param {Object} config - 配置
     */
    handleDragStart(event, element, data, config) {
        this.dragData = { element, data };
        
        // 设置拖拽数据
        Object.entries(data).forEach(([type, value]) => {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            event.dataTransfer.setData(type, stringValue);
        });
        
        // 设置拖拽图像
        if (config.dragImage) {
            event.dataTransfer.setDragImage(
                config.dragImage,
                config.dragImageOffset.x,
                config.dragImageOffset.y
            );
        }
        
        // 设置拖拽效果
        event.dataTransfer.effectAllowed = config.effectAllowed || 'all';
        
        // 添加拖拽样式
        element.classList.add('dragging');
        
        // 触发自定义事件
        this.onDragStart(element, data);
    }
    
    /**
     * 处理拖拽结束
     * @param {DragEvent} event - 拖拽事件
     * @param {HTMLElement} element - 拖拽元素
     */
    handleDragEnd(event, element) {
        element.classList.remove('dragging');
        this.dragData = null;
        this.onDragEnd(element);
    }
    
    /**
     * 处理拖拽进入
     * @param {DragEvent} event - 拖拽事件
     * @param {HTMLElement} element - 拖放区域
     * @param {Object} config - 配置
     */
    handleDragEnter(event, element, config) {
        event.preventDefault();
        
        if (this.isValidDrop(event, config)) {
            element.classList.add('drag-over');
            config.onDragEnter?.(event);
        }
    }
    
    /**
     * 处理拖拽悬停
     * @param {DragEvent} event - 拖拽事件
     * @param {HTMLElement} element - 拖放区域
     * @param {Object} config - 配置
     */
    handleDragOver(event, element, config) {
        event.preventDefault();
        
        if (this.isValidDrop(event, config)) {
            event.dataTransfer.dropEffect = config.dropEffect || 'move';
            config.onDragOver?.(event);
        }
    }
    
    /**
     * 处理拖拽离开
     * @param {DragEvent} event - 拖拽事件
     * @param {HTMLElement} element - 拖放区域
     * @param {Object} config - 配置
     */
    handleDragLeave(event, element, config) {
        // 检查是否真的离开了拖放区域
        if (!element.contains(event.relatedTarget)) {
            element.classList.remove('drag-over');
            config.onDragLeave?.(event);
        }
    }
    
    /**
     * 处理拖放
     * @param {DragEvent} event - 拖拽事件
     * @param {HTMLElement} element - 拖放区域
     * @param {Object} config - 配置
     */
    handleDrop(event, element, config) {
        event.preventDefault();
        element.classList.remove('drag-over');
        
        if (this.isValidDrop(event, config)) {
            const dropData = this.extractDropData(event);
            config.onDrop?.(dropData, event);
        }
    }
    
    /**
     * 检查是否为有效拖放
     * @param {DragEvent} event - 拖拽事件
     * @param {Object} options - 配置选项
     * @returns {boolean}
     */
    isValidDrop(event, options) {
        // 检查数据类型
        const types = event.dataTransfer.types;
        return options.acceptTypes.some(type => types.includes(type));
    }
    
    extractDropData(event) {
        const data = {};
        
        // 提取文本数据
        if (event.dataTransfer.types.includes('text/plain')) {
            data.text = event.dataTransfer.getData('text/plain');
        }
        
        // 提取HTML数据
        if (event.dataTransfer.types.includes('text/html')) {
            data.html = event.dataTransfer.getData('text/html');
        }
        
        // 提取文件数据
        if (event.dataTransfer.files.length > 0) {
            data.files = Array.from(event.dataTransfer.files);
        }
        
        return data;
    }
    
    onDragStart(element, data) {
        // 子类重写
        console.log('拖拽开始:', element, data);
    }
    
    onDragEnd(element) {
        // 子类重写
        console.log('拖拽结束:', element);
    }
}

// 使用示例
const dragDropManager = new DragDropManager();

// 设置可拖拽元素
const draggableItems = document.querySelectorAll('.draggable-item');
draggableItems.forEach((item, index) => {
    dragDropManager.makeDraggable(item, {
        'text/plain': `Item ${index}`,
        'application/json': { id: index, type: 'item' }
    });
});

// 设置拖放区域
const dropZone = document.getElementById('drop-zone');
dragDropManager.makeDropZone(dropZone, {
    acceptTypes: ['text/plain', 'application/json', 'Files'],
    onDrop: (data, event) => {
        console.log('拖放数据:', data);
        if (data.files) {
            data.files.forEach(file => {
                console.log('文件:', file.name, file.size);
            });
        }
    },
    onDragEnter: () => {
        console.log('进入拖放区域');
    },
    onDragLeave: () => {
        console.log('离开拖放区域');
    }
});
```

### 页面历史接口：导航控制的艺术 ###

**🔍 应用场景**

单页应用的路由管理、浏览器历史记录操作

**❌ 常见问题**

```javascript
// ❌ 直接修改location.hash，无法处理复杂的路由状态
function navigateTo(page) {
    location.hash = page;
}

window.addEventListener('hashchange', () => {
    const page = location.hash.slice(1);
    showPage(page);
});
```

**✅ 推荐方案**

```javascript
// ✅ 现代化路由管理器
class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.setupEventListeners();
    }
    
    addRoute(path, handler, options = {}) {
        this.routes.set(path, {
            handler,
            title: options.title,
            data: options.data
        });
    }
    
    navigate(path, state = {}, title = '') {
        const route = this.routes.get(path);
        if (!route) {
            console.error(`Route not found: ${path}`);
            return;
        }
        
        // 更新浏览器历史
        history.pushState(
            { ...state, path },
            title || route.title || '',
            path
        );
        
        // 更新页面标题
        if (title || route.title) {
            document.title = title || route.title;
        }
        
        // 执行路由处理器
        this.executeRoute(path, state);
    }
    
    replace(path, state = {}, title = '') {
        const route = this.routes.get(path);
        if (!route) {
            console.error(`Route not found: ${path}`);
            return;
        }
        
        history.replaceState(
            { ...state, path },
            title || route.title || '',
            path
        );
        
        if (title || route.title) {
            document.title = title || route.title;
        }
        
        this.executeRoute(path, state);
    }
    
    back() {
        history.back();
    }
    
    forward() {
        history.forward();
    }
    
    go(delta) {
        history.go(delta);
    }
    
    executeRoute(path, state) {
        const route = this.routes.get(path);
        if (route) {
            this.currentRoute = { path, state };
            route.handler(state);
            
            // 触发路由变化事件
            const routeEvent = new CustomEvent('routechange', {
                detail: { path, state, route }
            });
            window.dispatchEvent(routeEvent);
        }
    }
    
    setupEventListeners() {
        window.addEventListener('popstate', (e) => {
            const state = e.state || {};
            const path = state.path || location.pathname;
            this.executeRoute(path, state);
        });
        
        // 拦截链接点击
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[data-route]')) {
                e.preventDefault();
                const path = e.target.getAttribute('href');
                const title = e.target.getAttribute('data-title');
                this.navigate(path, {}, title);
            }
        });
    }
    
    getCurrentRoute() {
        return this.currentRoute;
    }
    
    getRouteHistory() {
        return {
            length: history.length,
            state: history.state
        };
    }
}

// 使用示例
const router = new Router();

// 注册路由
router.addRoute('/', () => {
    document.getElementById('content').innerHTML = '<h1>首页</h1>';
}, { title: '首页 - 我的网站' });

router.addRoute('/about', () => {
    document.getElementById('content').innerHTML = '<h1>关于我们</h1>';
}, { title: '关于我们 - 我的网站' });

router.addRoute('/products', (state) => {
    const category = state.category || 'all';
    document.getElementById('content').innerHTML = `
        <h1>产品列表</h1>
        <p>分类: ${category}</p>
    `;
}, { title: '产品列表 - 我的网站' });

// 监听路由变化
window.addEventListener('routechange', (e) => {
    console.log('路由变化:', e.detail);
    updateNavigation(e.detail.path);
});

// 导航函数
function updateNavigation(currentPath) {
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === currentPath);
    });
}
```

### Web组件接口：组件化开发的未来 ###

**🔍 应用场景**

创建可复用的自定义HTML元素和组件

**❌ 常见问题**

```javascript
// ❌ 传统组件创建方式
function createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
}

// 每次都需要手动创建和管理
const button1 = createButton('点击我', () => alert('Hello'));
document.body.appendChild(button1);
```

**✅ 推荐方案**

```javascript
// ✅ 自定义按钮组件
class CustomButton extends HTMLElement {
    constructor() {
        super();
        
        // 创建Shadow DOM
        this.attachShadow({ mode: 'open' });
        
        // 定义样式
        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: inline-block;
            }
            
            button {
                background: var(--button-bg, #007bff);
                color: var(--button-color, white);
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s ease;
            }
            
            button:hover {
                background: var(--button-hover-bg, #0056b3);
                transform: translateY(-1px);
            }
            
            button:active {
                transform: translateY(0);
            }
            
            button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            .loading {
                position: relative;
            }
            
            .loading::after {
                content: '';
                position: absolute;
                width: 16px;
                height: 16px;
                margin: auto;
                border: 2px solid transparent;
                border-top-color: currentColor;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        
        // 创建按钮元素
        this.button = document.createElement('button');
        
        // 添加到Shadow DOM
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(this.button);
        
        // 绑定事件
        this.button.addEventListener('click', (e) => {
            if (!this.disabled && !this.loading) {
                this.dispatchEvent(new CustomEvent('custom-click', {
                    detail: { originalEvent: e },
                    bubbles: true
                }));
            }
        });
    }
    
    static get observedAttributes() {
        return ['text', 'disabled', 'loading', 'variant'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'text':
                this.button.textContent = newValue || '';
                break;
            case 'disabled':
                this.button.disabled = newValue !== null;
                break;
            case 'loading':
                this.button.classList.toggle('loading', newValue !== null);
                this.button.disabled = newValue !== null;
                break;
            case 'variant':
                this.updateVariant(newValue);
                break;
        }
    }
    
    updateVariant(variant) {
        const variants = {
            primary: { bg: '#007bff', hover: '#0056b3' },
            secondary: { bg: '#6c757d', hover: '#545b62' },
            success: { bg: '#28a745', hover: '#1e7e34' },
            danger: { bg: '#dc3545', hover: '#bd2130' }
        };
        
        const colors = variants[variant] || variants.primary;
        this.style.setProperty('--button-bg', colors.bg);
        this.style.setProperty('--button-hover-bg', colors.hover);
    }
    
    // 公共方法
    setLoading(loading) {
        if (loading) {
            this.setAttribute('loading', '');
        } else {
            this.removeAttribute('loading');
        }
    }
    
    get disabled() {
        return this.hasAttribute('disabled');
    }
    
    set disabled(value) {
        if (value) {
            this.setAttribute('disabled', '');
        } else {
            this.removeAttribute('disabled');
        }
    }
    
    get loading() {
        return this.hasAttribute('loading');
    }
}

// 注册自定义元素
customElements.define('custom-button', CustomButton);

// 使用示例
const button = document.createElement('custom-button');
button.setAttribute('text', '点击我');
button.setAttribute('variant', 'primary');
button.addEventListener('custom-click', () => {
    console.log('按钮被点击');
});
document.body.appendChild(button);
```

### Web Storage接口：数据持久化的解决方案 ###

**🔍 应用场景**

客户端数据存储、用户偏好设置、离线数据缓存

**❌ 常见问题**

```javascript
// ❌ 简单的localStorage使用
function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function loadData(key) {
    return JSON.parse(localStorage.getItem(key));
}
```

**✅ 推荐方案**

```javascript
// ✅ 完善的存储管理器
class StorageManager {
    constructor(prefix = 'app_') {
        this.prefix = prefix;
        this.checkStorageSupport();
    }
    
    checkStorageSupport() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            this.isSupported = true;
        } catch (e) {
            this.isSupported = false;
            console.warn('localStorage not supported');
        }
    }
    
    set(key, value, options = {}) {
        if (!this.isSupported) {
            console.warn('Storage not supported');
            return false;
        }
        
        try {
            const data = {
                value,
                timestamp: Date.now(),
                expires: options.expires ? Date.now() + options.expires : null,
                version: options.version || '1.0'
            };
            
            const serialized = JSON.stringify(data);
            const fullKey = this.prefix + key;
            
            // 检查存储空间
            if (this.getStorageSize() + serialized.length > 5 * 1024 * 1024) {
                this.cleanup();
            }
            
            localStorage.setItem(fullKey, serialized);
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    }
    
    /**
     * 获取存储的数据
     * @param {string} key - 键名
     * @param {*} defaultValue - 默认值
     * @returns {*}
     */
    get(key, defaultValue = null) {
        if (!this.isSupported) return defaultValue;
        
        try {
            const fullKey = this.prefix + key;
            const item = localStorage.getItem(fullKey);
            
            if (!item) return defaultValue;
            
            const data = JSON.parse(item);
            
            // 检查是否过期
            if (data.expires && Date.now() > data.expires) {
                this.remove(key);
                return defaultValue;
            }
            
            return data.value;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    }
    
    /**
     * 删除存储的数据
     * @param {string} key - 键名
     */
    remove(key) {
        if (!this.isSupported) return;
        
        const fullKey = this.prefix + key;
        localStorage.removeItem(fullKey);
    }
    
    /**
     * 清空所有数据
     */
    clear() {
        if (!this.isSupported) return;
        
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }
    
    /**
     * 获取存储大小
     * @returns {number}
     */
    getStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    }
    
    /**
     * 清理过期数据
     */
    cleanup() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                try {
                    const data = JSON.parse(localStorage[key]);
                    if (data.expires && Date.now() > data.expires) {
                        localStorage.removeItem(key);
                    }
                } catch (e) {
                    // 无效数据，删除
                    localStorage.removeItem(key);
                }
            }
        });
    }
    
    /**
     * 获取所有键
     * @returns {Array}
     */
    keys() {
        const keys = [];
        for (let key in localStorage) {
            if (key.startsWith(this.prefix)) {
                keys.push(key.substring(this.prefix.length));
            }
        }
        return keys;
    }
}

// 使用示例
const storage = new StorageManager('myapp_');

// 存储数据
storage.set('user', {
    name: '张三',
    email: 'zhangsan@example.com'
}, { expires: 24 * 60 * 60 * 1000 }); // 24小时后过期

// 获取数据
const user = storage.get('user');
console.log('用户信息:', user);

// 存储设置
storage.set('settings', {
    theme: 'dark',
    language: 'zh-CN',
    notifications: true
});

// 获取设置
const settings = storage.get('settings', {
    theme: 'light',
    language: 'en-US',
    notifications: false
});
```

## 📊 总结与展望 ##

### 🎯 核心要点回顾 ###

通过本篇文章，我们深入探讨了HTML DOM API的9个核心接口：

- HTML元素接口 - DOM操作的基石，提供了安全高效的元素创建和管理方案
- Web应用程序和浏览器集成接口 - 现代Web体验的关键，涵盖地理位置、通知、Service Worker等
- 表单支持接口 - 用户输入的艺术，实现了完善的表单验证和数据处理
- Canvas接口 - 图形绘制的魔法，支持复杂的2D图形和动画效果
- 媒体接口 - 音视频的完美控制，提供专业级的媒体播放解决方案
- 拖放接口 - 交互体验的升华，实现直观的拖拽操作
- 页面历史接口 - 导航控制的艺术，构建现代化的单页应用路由
- Web组件接口 - 组件化开发的未来，创建可复用的自定义元素
- Web Storage接口 - 数据持久化的解决方案，提供安全可靠的客户端存储

### 💡 实践建议 ###

- 循序渐进 - 从基础的HTML元素接口开始，逐步掌握更复杂的API
- 注重实践 - 每个接口都要通过实际项目来加深理解
- 关注兼容性 - 在使用新API时要考虑浏览器支持情况
- 性能优化 - 合理使用API，避免不必要的性能开销
- 安全意识 - 特别是在处理用户输入和数据存储时要注意安全问题

#（下篇）- 高级接口与现代Web开发实践 #

## 📚 学习目标 ##

- 理解现代Web开发中的复杂应用场景
- 学会构建高性能、可扩展的Web应用
- 掌握前沿技术的实际应用方法

## 🎯 难度等级 ##

高级 - 适合有扎实JavaScript基础和Web开发经验的开发者


## 🚀 引言 ##

在文章上半部分中，我们深入探讨了HTML DOM API的9个核心接口。本篇将继续这一技术之旅，重点介绍更加高级和专业的API接口，这些接口是构建现代Web应用不可或缺的技术基础。

从多线程处理到实时通信，从3D图形渲染到音频处理，这些高级API将帮助你构建更加强大和用户友好的Web应用。

## 🎯 高级API详解 ##

### Web Worker接口：多线程处理的利器 ###

**🔍 应用场景**

大数据处理、复杂计算、图像处理、后台任务

**❌ 常见问题**

```javascript
// ❌ 主线程执行耗时操作，阻塞UI
function processLargeData(data) {
    let result = [];
    for (let i = 0; i < data.length; i++) {
        // 复杂计算
        result.push(heavyComputation(data[i]));
    }
    return result;
}

// UI会被阻塞
const result = processLargeData(largeDataSet);
updateUI(result);
```

**✅ 推荐方案**

```javascript
// ✅ Web Worker管理器
class WorkerManager {
    constructor() {
        this.workers = new Map();
        this.taskQueue = [];
        this.maxWorkers = navigator.hardwareConcurrency || 4;
    }
    
    /**
     * 创建Worker
     * @param {string} name - Worker名称
     * @param {string} scriptPath - Worker脚本路径
     * @returns {Promise<Worker>}
     */
    async createWorker(name, scriptPath) {
        try {
            const worker = new Worker(scriptPath);
            
            // 设置错误处理
            worker.onerror = (error) => {
                console.error(`Worker ${name} error:`, error);
                this.removeWorker(name);
            };
            
            // 设置消息处理
            worker.onmessage = (event) => {
                this.handleWorkerMessage(name, event);
            };
            
            this.workers.set(name, {
                worker,
                busy: false,
                tasks: new Map()
            });
            
            return worker;
        } catch (error) {
            console.error('Failed to create worker:', error);
            throw error;
        }
    }
    
    /**
     * 执行任务
     * @param {string} workerName - Worker名称
     * @param {string} taskType - 任务类型
     * @param {*} data - 任务数据
     * @returns {Promise}
     */
    async executeTask(workerName, taskType, data) {
        const workerInfo = this.workers.get(workerName);
        if (!workerInfo) {
            throw new Error(`Worker ${workerName} not found`);
        }
        
        const taskId = this.generateTaskId();
        
        return new Promise((resolve, reject) => {
            // 存储任务回调
            workerInfo.tasks.set(taskId, { resolve, reject });
            
            // 发送任务到Worker
            workerInfo.worker.postMessage({
                taskId,
                type: taskType,
                data
            });
            
            workerInfo.busy = true;
        });
    }
    
    /**
     * 处理Worker消息
     * @param {string} workerName - Worker名称
     * @param {MessageEvent} event - 消息事件
     */
    handleWorkerMessage(workerName, event) {
        const { taskId, result, error } = event.data;
        const workerInfo = this.workers.get(workerName);
        
        if (!workerInfo) return;
        
        const task = workerInfo.tasks.get(taskId);
        if (!task) return;
        
        // 清理任务
        workerInfo.tasks.delete(taskId);
        workerInfo.busy = false;
        
        // 执行回调
        if (error) {
            task.reject(new Error(error));
        } else {
            task.resolve(result);
        }
    }
    
    /**
     * 批量处理任务
     * @param {Array} tasks - 任务数组
     * @param {string} workerScript - Worker脚本
     * @returns {Promise<Array>}
     */
    async processBatch(tasks, workerScript) {
        const results = [];
        const workers = [];
        
        // 创建Worker池
        for (let i = 0; i < Math.min(this.maxWorkers, tasks.length); i++) {
            const workerName = `batch-worker-${i}`;
            await this.createWorker(workerName, workerScript);
            workers.push(workerName);
        }
        
        // 分配任务
        const promises = tasks.map((task, index) => {
            const workerName = workers[index % workers.length];
            return this.executeTask(workerName, task.type, task.data);
        });
        
        try {
            const results = await Promise.all(promises);
            return results;
        } finally {
            // 清理Worker
            workers.forEach(name => this.removeWorker(name));
        }
    }
    
    /**
     * 移除Worker
     * @param {string} name - Worker名称
     */
    removeWorker(name) {
        const workerInfo = this.workers.get(name);
        if (workerInfo) {
            workerInfo.worker.terminate();
            this.workers.delete(name);
        }
    }
    
    /**
     * 生成任务ID
     * @returns {string}
     */
    generateTaskId() {
        return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * 清理所有Worker
     */
    cleanup() {
        for (const [name] of this.workers) {
            this.removeWorker(name);
        }
    }
}

// Worker脚本示例 (data-processor.js)
const workerScript = `
self.onmessage = function(event) {
    const { taskId, type, data } = event.data;
    
    try {
        let result;
        
        switch (type) {
            case 'processData':
                result = processLargeDataSet(data);
                break;
            case 'imageFilter':
                result = applyImageFilter(data);
                break;
            case 'calculation':
                result = performComplexCalculation(data);
                break;
            default:
                throw new Error('Unknown task type: ' + type);
        }
        
        self.postMessage({ taskId, result });
    } catch (error) {
        self.postMessage({ taskId, error: error.message });
    }
};

function processLargeDataSet(data) {
    return data.map(item => {
        // 复杂数据处理逻辑
        return {
            ...item,
            processed: true,
            timestamp: Date.now()
        };
    });
}

function applyImageFilter(imageData) {
    const { data: pixels, width, height } = imageData;
    
    // 应用灰度滤镜
    for (let i = 0; i < pixels.length; i += 4) {
        const gray = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
        pixels[i] = gray;     // Red
        pixels[i + 1] = gray; // Green
        pixels[i + 2] = gray; // Blue
        // Alpha channel (i + 3) remains unchanged
    }
    
    return { data: pixels, width, height };
}

function performComplexCalculation(numbers) {
    return numbers.reduce((acc, num) => {
        // 模拟复杂计算
        for (let i = 0; i < 1000000; i++) {
            acc += Math.sqrt(num * i);
        }
        return acc;
    }, 0);
}
`;

// 使用示例
const workerManager = new WorkerManager();

// 创建数据处理Worker
await workerManager.createWorker('dataProcessor', 'data-processor.js');

// 处理大数据集
const largeData = Array.from({ length: 10000 }, (_, i) => ({ id: i, value: Math.random() }));

try {
    const result = await workerManager.executeTask('dataProcessor', 'processData', largeData);
    console.log('数据处理完成:', result);
    updateUI(result);
} catch (error) {
    console.error('数据处理失败:', error);
}

// 批量处理任务
const tasks = [
    { type: 'calculation', data: [1, 2, 3, 4, 5] },
    { type: 'calculation', data: [6, 7, 8, 9, 10] },
    { type: 'calculation', data: [11, 12, 13, 14, 15] }
];

const batchResults = await workerManager.processBatch(tasks, 'data-processor.js');
console.log('批量处理结果:', batchResults);
```

### WebRTC接口：实时通信的核心 ###

**🔍 应用场景**

视频通话、音频聊天、屏幕共享、P2P数据传输

**❌ 常见问题**

```javascript
// ❌ 简单的WebRTC实现，缺乏错误处理和连接管理
const pc = new RTCPeerConnection();
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        pc.addStream(stream);
    });
```

**✅ 推荐方案**

```javascript
// ✅ 专业的WebRTC通信管理器
class WebRTCManager {
    constructor(options = {}) {
        this.options = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ],
            ...options
        };
        
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
        this.dataChannel = null;
        this.isInitiator = false;
        this.listeners = new Map();
    }
    
    /**
     * 初始化WebRTC连接
     * @returns {Promise}
     */
    async initialize() {
        try {
            this.peerConnection = new RTCPeerConnection({
                iceServers: this.options.iceServers
            });
            
            this.setupPeerConnectionEvents();
            return true;
        } catch (error) {
            console.error('WebRTC初始化失败:', error);
            throw error;
        }
    }
    
    /**
     * 设置PeerConnection事件监听
     */
    setupPeerConnectionEvents() {
        // ICE候选事件
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.emit('iceCandidate', event.candidate);
            }
        };
        
        // 连接状态变化
        this.peerConnection.onconnectionstatechange = () => {
            const state = this.peerConnection.connectionState;
            this.emit('connectionStateChange', state);
            
            if (state === 'failed') {
                this.handleConnectionFailure();
            }
        };
        
        // 远程流接收
        this.peerConnection.ontrack = (event) => {
            this.remoteStream = event.streams[0];
            this.emit('remoteStream', this.remoteStream);
        };
        
        // 数据通道接收
        this.peerConnection.ondatachannel = (event) => {
            const channel = event.channel;
            this.setupDataChannelEvents(channel);
            this.emit('dataChannel', channel);
        };
    }
    
    /**
     * 获取用户媒体
     * @param {Object} constraints - 媒体约束
     * @returns {Promise<MediaStream>}
     */
    async getUserMedia(constraints = { video: true, audio: true }) {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // 添加轨道到PeerConnection
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });
            
            this.emit('localStream', this.localStream);
            return this.localStream;
        } catch (error) {
            console.error('获取用户媒体失败:', error);
            throw error;
        }
    }
    
    /**
     * 获取屏幕共享
     * @returns {Promise<MediaStream>}
     */
    async getDisplayMedia() {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });
            
            // 替换视频轨道
            const videoTrack = screenStream.getVideoTracks()[0];
            const sender = this.peerConnection.getSenders().find(s => 
                s.track && s.track.kind === 'video'
            );
            
            if (sender) {
                await sender.replaceTrack(videoTrack);
            }
            
            // 监听屏幕共享结束
            videoTrack.onended = () => {
                this.stopScreenShare();
            };
            
            this.emit('screenShare', screenStream);
            return screenStream;
        } catch (error) {
            console.error('获取屏幕共享失败:', error);
            throw error;
        }
    }
    
    /**
     * 停止屏幕共享
     */
    async stopScreenShare() {
        try {
            // 恢复摄像头
            const videoTrack = this.localStream.getVideoTracks()[0];
            const sender = this.peerConnection.getSenders().find(s => 
                s.track && s.track.kind === 'video'
            );
            
            if (sender && videoTrack) {
                await sender.replaceTrack(videoTrack);
            }
            
            this.emit('screenShareStopped');
        } catch (error) {
            console.error('停止屏幕共享失败:', error);
        }
    }
    
    /**
     * 创建Offer
     * @returns {Promise<RTCSessionDescription>}
     */
    async createOffer() {
        try {
            this.isInitiator = true;
            
            // 创建数据通道
            this.dataChannel = this.peerConnection.createDataChannel('messages', {
                ordered: true
            });
            this.setupDataChannelEvents(this.dataChannel);
            
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            
            return offer;
        } catch (error) {
            console.error('创建Offer失败:', error);
            throw error;
        }
    }
    
    /**
     * 创建Answer
     * @param {RTCSessionDescription} offer - 远程Offer
     * @returns {Promise<RTCSessionDescription>}
     */
    async createAnswer(offer) {
        try {
            await this.peerConnection.setRemoteDescription(offer);
            
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            
            return answer;
        } catch (error) {
            console.error('创建Answer失败:', error);
            throw error;
        }
    }
    
    /**
     * 设置远程描述
     * @param {RTCSessionDescription} answer - 远程Answer
     */
    async setRemoteAnswer(answer) {
        try {
            await this.peerConnection.setRemoteDescription(answer);
        } catch (error) {
            console.error('设置远程Answer失败:', error);
            throw error;
        }
    }
    
    /**
     * 添加ICE候选
     * @param {RTCIceCandidate} candidate - ICE候选
     */
    async addIceCandidate(candidate) {
        try {
            await this.peerConnection.addIceCandidate(candidate);
        } catch (error) {
            console.error('添加ICE候选失败:', error);
        }
    }
    
    /**
     * 设置数据通道事件
     * @param {RTCDataChannel} channel - 数据通道
     */
    setupDataChannelEvents(channel) {
        channel.onopen = () => {
            this.emit('dataChannelOpen', channel);
        };
        
        channel.onmessage = (event) => {
            this.emit('dataChannelMessage', event.data);
        };
        
        channel.onclose = () => {
            this.emit('dataChannelClose');
        };
        
        channel.onerror = (error) => {
            console.error('数据通道错误:', error);
            this.emit('dataChannelError', error);
        };
    }
    
    /**
     * 发送数据
     * @param {*} data - 要发送的数据
     */
    sendData(data) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            const message = typeof data === 'string' ? data : JSON.stringify(data);
            this.dataChannel.send(message);
        } else {
            console.warn('数据通道未打开');
        }
    }
    
    /**
     * 处理连接失败
     */
    async handleConnectionFailure() {
        console.log('连接失败，尝试重新连接...');
        
        // 重新创建ICE连接
        this.peerConnection.restartIce();
        
        this.emit('connectionFailure');
    }
    
    /**
     * 关闭连接
     */
    close() {
        // 停止本地流
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        
        // 关闭数据通道
        if (this.dataChannel) {
            this.dataChannel.close();
        }
        
        // 关闭PeerConnection
        if (this.peerConnection) {
            this.peerConnection.close();
        }
        
        this.emit('closed');
    }
    
    /**
     * 事件监听
     * @param {string} event - 事件名
     * @param {Function} callback - 回调函数
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    /**
     * 触发事件
     * @param {string} event - 事件名
     * @param {*} data - 事件数据
     */
    emit(event, data) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => callback(data));
    }
}

// 使用示例
const rtcManager = new WebRTCManager();

// 初始化WebRTC
await rtcManager.initialize();

// 监听事件
rtcManager.on('localStream', (stream) => {
    document.getElementById('localVideo').srcObject = stream;
});

rtcManager.on('remoteStream', (stream) => {
    document.getElementById('remoteVideo').srcObject = stream;
});

rtcManager.on('dataChannelMessage', (message) => {
    console.log('收到消息:', message);
});

// 发起通话
document.getElementById('startCall').addEventListener('click', async () => {
    await rtcManager.getUserMedia();
    const offer = await rtcManager.createOffer();
    // 通过信令服务器发送offer
    sendToSignalingServer({ type: 'offer', offer });
});

// 接听通话
document.getElementById('answerCall').addEventListener('click', async () => {
    await rtcManager.getUserMedia();
    // 假设从信令服务器收到offer
    const answer = await rtcManager.createAnswer(receivedOffer);
    // 通过信令服务器发送answer
    sendToSignalingServer({ type: 'answer', answer });
});
```

### WebGL接口：3D图形渲染的强大工具 ###

**🔍 应用场景**

3D游戏、数据可视化、CAD应用、虚拟现实

**❌ 常见问题**

```javascript
// ❌ 直接使用WebGL API，代码复杂难维护
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
```

**✅ 推荐方案**

```javascript
// ✅ WebGL渲染引擎
class WebGLRenderer {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.gl = this.initWebGL();
        this.programs = new Map();
        this.buffers = new Map();
        this.textures = new Map();
        this.uniforms = new Map();
        
        this.options = {
            clearColor: [0.0, 0.0, 0.0, 1.0],
            enableDepthTest: true,
            ...options
        };
        
        this.setupWebGL();
    }
    
    /**
     * 初始化WebGL上下文
     * @returns {WebGLRenderingContext}
     */
    initWebGL() {
        const gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        
        if (!gl) {
            throw new Error('WebGL not supported');
        }
        
        return gl;
    }
    
    /**
     * 设置WebGL基本配置
     */
    setupWebGL() {
        const { gl, options } = this;
        
        // 设置清除颜色
        gl.clearColor(...options.clearColor);
        
        // 启用深度测试
        if (options.enableDepthTest) {
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
        }
        
        // 设置视口
        this.resize();
    }
    
    /**
     * 创建着色器
     * @param {string} source - 着色器源码
     * @param {number} type - 着色器类型
     * @returns {WebGLShader}
     */
    createShader(source, type) {
        const { gl } = this;
        const shader = gl.createShader(type);
        
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(`Shader compilation error: ${error}`);
        }
        
        return shader;
    }
    
    /**
     * 创建着色器程序
     * @param {string} vertexSource - 顶点着色器源码
     * @param {string} fragmentSource - 片段着色器源码
     * @param {string} name - 程序名称
     * @returns {WebGLProgram}
     */
    createProgram(vertexSource, fragmentSource, name) {
        const { gl } = this;
        
        const vertexShader = this.createShader(vertexSource, gl.VERTEX_SHADER);
        const fragmentShader = this.createShader(fragmentSource, gl.FRAGMENT_SHADER);
        
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const error = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error(`Program linking error: ${error}`);
        }
        
        // 清理着色器
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        
        // 存储程序
        this.programs.set(name, program);
        
        return program;
    }
    
    /**
     * 创建缓冲区
     * @param {ArrayBuffer|Float32Array} data - 数据
     * @param {number} type - 缓冲区类型
     * @param {number} usage - 使用方式
     * @param {string} name - 缓冲区名称
     * @returns {WebGLBuffer}
     */
    createBuffer(data, type = this.gl.ARRAY_BUFFER, usage = this.gl.STATIC_DRAW, name) {
        const { gl } = this;
        const buffer = gl.createBuffer();
        
        gl.bindBuffer(type, buffer);
        gl.bufferData(type, data, usage);
        
        if (name) {
            this.buffers.set(name, { buffer, type, size: data.length });
        }
        
        return buffer;
    }
    
    /**
     * 创建纹理
     * @param {HTMLImageElement|HTMLCanvasElement} image - 图像源
     * @param {string} name - 纹理名称
     * @returns {WebGLTexture}
     */
    createTexture(image, name) {
        const { gl } = this;
        const texture = gl.createTexture();
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        // 设置纹理参数
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        
        // 上传纹理数据
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        
        if (name) {
            this.textures.set(name, texture);
        }
        
        return texture;
    }
    
    /**
     * 设置uniform变量
     * @param {WebGLProgram} program - 着色器程序
     * @param {string} name - uniform名称
     * @param {*} value - 值
     */
    setUniform(program, name, value) {
        const { gl } = this;
        const location = gl.getUniformLocation(program, name);
        
        if (location === null) return;
        
        if (Array.isArray(value)) {
            switch (value.length) {
                case 1:
                    gl.uniform1f(location, value[0]);
                    break;
                case 2:
                    gl.uniform2fv(location, value);
                    break;
                case 3:
                    gl.uniform3fv(location, value);
                    break;
                case 4:
                    gl.uniform4fv(location, value);
                    break;
                case 16:
                    gl.uniformMatrix4fv(location, false, value);
                    break;
            }
        } else if (typeof value === 'number') {
            gl.uniform1f(location, value);
        }
    }
    
    /**
     * 绑定属性
     * @param {WebGLProgram} program - 着色器程序
     * @param {string} name - 属性名称
     * @param {WebGLBuffer} buffer - 缓冲区
     * @param {number} size - 组件数量
     * @param {number} type - 数据类型
     */
    bindAttribute(program, name, buffer, size = 3, type = this.gl.FLOAT) {
        const { gl } = this;
        const location = gl.getAttribLocation(program, name);
        
        if (location === -1) return;
        
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, size, type, false, 0, 0);
    }
    
    /**
     * 渲染场景
     * @param {Object} scene - 场景对象
     */
    render(scene) {
        const { gl } = this;
        
        // 清除画布
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // 渲染每个对象
        scene.objects.forEach(object => {
            this.renderObject(object);
        });
    }
    
    /**
     * 渲染单个对象
     * @param {Object} object - 渲染对象
     */
    renderObject(object) {
        const { gl } = this;
        const program = this.programs.get(object.program);
        
        if (!program) return;
        
        // 使用着色器程序
        gl.useProgram(program);
        
        // 设置uniforms
        Object.entries(object.uniforms || {}).forEach(([name, value]) => {
            this.setUniform(program, name, value);
        });
        
        // 绑定属性
        Object.entries(object.attributes || {}).forEach(([name, attr]) => {
            const buffer = this.buffers.get(attr.buffer);
            if (buffer) {
                this.bindAttribute(program, name, buffer.buffer, attr.size, attr.type);
            }
        });
        
        // 绑定纹理
        if (object.texture) {
            const texture = this.textures.get(object.texture);
            if (texture) {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                this.setUniform(program, 'u_texture', 0);
            }
        }
        
        // 绘制
        if (object.indices) {
            const indexBuffer = this.buffers.get(object.indices);
            if (indexBuffer) {
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer.buffer);
                gl.drawElements(object.mode || gl.TRIANGLES, indexBuffer.size, gl.UNSIGNED_SHORT, 0);
            }
        } else {
            const vertexBuffer = this.buffers.get(object.vertices);
            if (vertexBuffer) {
                gl.drawArrays(object.mode || gl.TRIANGLES, 0, vertexBuffer.size / 3);
            }
        }
    }
    
    /**
     * 调整画布大小
     */
    resize() {
        const { canvas, gl } = this;
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;
        
        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
            gl.viewport(0, 0, displayWidth, displayHeight);
        }
    }
    
    /**
     * 清理资源
     */
    cleanup() {
        const { gl } = this;
        
        // 删除程序
        this.programs.forEach(program => gl.deleteProgram(program));
        
        // 删除缓冲区
        this.buffers.forEach(({ buffer }) => gl.deleteBuffer(buffer));
        
        // 删除纹理
        this.textures.forEach(texture => gl.deleteTexture(texture));
    }
}

// 使用示例
const canvas = document.getElementById('webgl-canvas');
const renderer = new WebGLRenderer(canvas);

// 顶点着色器
const vertexShaderSource = `
    attribute vec3 a_position;
    attribute vec2 a_texCoord;
    
    uniform mat4 u_modelViewMatrix;
    uniform mat4 u_projectionMatrix;
    
    varying vec2 v_texCoord;
    
    void main() {
        gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(a_position, 1.0);
        v_texCoord = a_texCoord;
    }
`;

// 片段着色器
const fragmentShaderSource = `
    precision mediump float;
    
    uniform sampler2D u_texture;
    uniform float u_time;
    
    varying vec2 v_texCoord;
    
    void main() {
        vec4 color = texture2D(u_texture, v_texCoord);
        color.rgb *= 0.5 + 0.5 * sin(u_time);
        gl_FragColor = color;
    }
`;

// 创建着色器程序
renderer.createProgram(vertexShaderSource, fragmentShaderSource, 'basic');

// 创建立方体顶点数据
const vertices = new Float32Array([
    // 前面
    -1, -1,  1,
     1, -1,  1,
     1,  1,  1,
    -1,  1,  1,
    // 后面
    -1, -1, -1,
    -1,  1, -1,
     1,  1, -1,
     1, -1, -1
]);

const indices = new Uint16Array([
    0, 1, 2,   0, 2, 3,    // 前面
    4, 5, 6,   4, 6, 7,    // 后面
    5, 0, 3,   5, 3, 6,    // 左面
    1, 4, 7,   1, 7, 2,    // 右面
    3, 2, 7,   3, 7, 6,    // 上面
    5, 4, 1,   5, 1, 0     // 下面
]);

// 创建缓冲区
renderer.createBuffer(vertices, renderer.gl.ARRAY_BUFFER, renderer.gl.STATIC_DRAW, 'vertices');
renderer.createBuffer(indices, renderer.gl.ELEMENT_ARRAY_BUFFER, renderer.gl.STATIC_DRAW, 'indices');

// 创建场景
const scene = {
    objects: [{
        program: 'basic',
        vertices: 'vertices',
        indices: 'indices',
        attributes: {
            a_position: { buffer: 'vertices', size: 3 }
        },
        uniforms: {
            u_modelViewMatrix: [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,-5,1],
            u_projectionMatrix: [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1],
            u_time: 0
        }
    }]
};

// 渲染循环
function animate(time) {
    scene.objects[0].uniforms.u_time = time * 0.001;
    renderer.render(scene);
    requestAnimationFrame(animate);
}

animate(0);
```

### Web Audio接口：音频处理的专业方案 ###

**🔍 应用场景**

音频播放器、音效处理、音乐制作、语音识别

**❌ 常见问题**

```javascript
// ❌ 简单的音频播放，功能有限
const audio = new Audio('music.mp3');
audio.play();
audio.volume = 0.5;
```

**✅ 推荐方案**

```javascript
// ✅ 专业音频处理引擎
class AudioEngine {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.sources = new Map();
        this.effects = new Map();
        this.isInitialized = false;
    }
    
    /**
     * 初始化音频上下文
     * @returns {Promise}
     */
    async initialize() {
        try {
            // 创建音频上下文
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            
            // 创建主音量控制
            this.masterGain = this.context.createGain();
            this.masterGain.connect(this.context.destination);
            
            // 恢复音频上下文（某些浏览器需要用户交互）
            if (this.context.state === 'suspended') {
                await this.context.resume();
            }
            
            this.isInitialized = true;
            console.log('音频引擎初始化成功');
        } catch (error) {
            console.error('音频引擎初始化失败:', error);
            throw error;
        }
    }
    
    /**
     * 加载音频文件
     * @param {string} url - 音频文件URL
     * @param {string} name - 音频名称
     * @returns {Promise<AudioBuffer>}
     */
    async loadAudio(url, name) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
            
            this.sources.set(name, audioBuffer);
            return audioBuffer;
        } catch (error) {
            console.error(`加载音频失败 ${url}:`, error);
            throw error;
        }
    }
    
    /**
     * 播放音频
     * @param {string} name - 音频名称
     * @param {Object} options - 播放选项
     * @returns {AudioBufferSourceNode}
     */
    playAudio(name, options = {}) {
        if (!this.isInitialized) {
            console.warn('音频引擎未初始化');
            return null;
        }
        
        const audioBuffer = this.sources.get(name);
        if (!audioBuffer) {
            console.warn(`音频 ${name} 未找到`);
            return null;
        }
        
        const source = this.context.createBufferSource();
        source.buffer = audioBuffer;
        
        // 创建音量控制
        const gainNode = this.context.createGain();
        gainNode.gain.value = options.volume || 1.0;
        
        // 连接音频图
        source.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        // 设置播放参数
        if (options.loop) {
            source.loop = true;
        }
        
        if (options.playbackRate) {
            source.playbackRate.value = options.playbackRate;
        }
        
        // 开始播放
        const startTime = options.when || this.context.currentTime;
        const offset = options.offset || 0;
        const duration = options.duration || audioBuffer.duration;
        
        source.start(startTime, offset, duration);
        
        // 设置结束回调
        if (options.onEnded) {
            source.onended = options.onEnded;
        }
        
        return source;
    }
    
    /**
     * 创建音频效果器
     * @param {string} type - 效果器类型
     * @param {Object} params - 参数
     * @returns {AudioNode}
     */
    createEffect(type, params = {}) {
        let effect;
        
        switch (type) {
            case 'reverb':
                effect = this.createReverb(params);
                break;
            case 'delay':
                effect = this.createDelay(params);
                break;
            case 'filter':
                effect = this.createFilter(params);
                break;
            case 'distortion':
                effect = this.createDistortion(params);
                break;
            case 'compressor':
                effect = this.createCompressor(params);
                break;
            default:
                console.warn(`未知效果器类型: ${type}`);
                return null;
        }
        
        return effect;
    }
    
    /**
     * 创建混响效果
     * @param {Object} params - 混响参数
     * @returns {ConvolverNode}
     */
    createReverb(params = {}) {
        const convolver = this.context.createConvolver();
        
        // 创建冲激响应
        const length = params.length || this.context.sampleRate * 2;
        const impulse = this.context.createBuffer(2, length, this.context.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const decay = Math.pow(1 - i / length, params.decay || 2);
                channelData[i] = (Math.random() * 2 - 1) * decay;
            }
        }
        
        convolver.buffer = impulse;
        return convolver;
    }
    
    /**
     * 创建延迟效果
     * @param {Object} params - 延迟参数
     * @returns {Object}
     */
    createDelay(params = {}) {
        const delay = this.context.createDelay(params.maxDelay || 1.0);
        const feedback = this.context.createGain();
        const wetGain = this.context.createGain();
        const dryGain = this.context.createGain();
        const output = this.context.createGain();
        
        // 设置参数
        delay.delayTime.value = params.delayTime || 0.3;
        feedback.gain.value = params.feedback || 0.3;
        wetGain.gain.value = params.wet || 0.5;
        dryGain.gain.value = params.dry || 0.5;
        
        // 连接节点
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(wetGain);
        wetGain.connect(output);
        dryGain.connect(output);
        
        return {
            input: delay,
            output: output,
            dryGain: dryGain
        };
    }
    
    /**
     * 创建滤波器
     * @param {Object} params - 滤波器参数
     * @returns {BiquadFilterNode}
     */
    createFilter(params = {}) {
        const filter = this.context.createBiquadFilter();
        
        filter.type = params.type || 'lowpass';
        filter.frequency.value = params.frequency || 1000;
        filter.Q.value = params.Q || 1;
        filter.gain.value = params.gain || 0;
        
        return filter;
    }
    
    /**
     * 创建失真效果
     * @param {Object} params - 失真参数
     * @returns {WaveShaperNode}
     */
    createDistortion(params = {}) {
        const waveshaper = this.context.createWaveShaper();
        const amount = params.amount || 50;
        const samples = 44100;
        const curve = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + amount) * x * 20 * Math.PI / 180) / (Math.PI + amount * Math.abs(x));
        }
        
        waveshaper.curve = curve;
        waveshaper.oversample = '4x';
        
        return waveshaper;
    }
    
    /**
     * 创建压缩器
     * @param {Object} params - 压缩器参数
     * @returns {DynamicsCompressorNode}
     */
    createCompressor(params = {}) {
        const compressor = this.context.createDynamicsCompressor();
        
        compressor.threshold.value = params.threshold || -24;
        compressor.knee.value = params.knee || 30;
        compressor.ratio.value = params.ratio || 12;
        compressor.attack.value = params.attack || 0.003;
        compressor.release.value = params.release || 0.25;
        
        return compressor;
    }
    
    /**
     * 创建音频分析器
     * @param {number} fftSize - FFT大小
     * @returns {AnalyserNode}
     */
    createAnalyser(fftSize = 2048) {
        const analyser = this.context.createAnalyser();
        analyser.fftSize = fftSize;
        analyser.smoothingTimeConstant = 0.8;
        
        return analyser;
    }
    
    /**
     * 录制音频
     * @param {MediaStream} stream - 媒体流
     * @returns {Object}
     */
    createRecorder(stream) {
        const source = this.context.createMediaStreamSource(stream);
        const processor = this.context.createScriptProcessor(4096, 1, 1);
        const recordedChunks = [];
        
        let isRecording = false;
        
        processor.onaudioprocess = (event) => {
            if (!isRecording) return;
            
            const inputData = event.inputBuffer.getChannelData(0);
            const chunk = new Float32Array(inputData);
            recordedChunks.push(chunk);
        };
        
        source.connect(processor);
        processor.connect(this.context.destination);
        
        return {
            start: () => {
                isRecording = true;
                recordedChunks.length = 0;
            },
            stop: () => {
                isRecording = false;
                return this.exportRecording(recordedChunks);
            },
            source: source
        };
    }
    
    /**
     * 导出录音
     * @param {Array} chunks - 音频块
     * @returns {AudioBuffer}
     */
    exportRecording(chunks) {
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const audioBuffer = this.context.createBuffer(1, totalLength, this.context.sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        let offset = 0;
        chunks.forEach(chunk => {
            channelData.set(chunk, offset);
            offset += chunk.length;
        });
        
        return audioBuffer;
    }
    
    /**
     * 设置主音量
     * @param {number} volume - 音量值 (0-1)
     */
    setMasterVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
        }
    }
    
    /**
     * 获取当前时间
     * @returns {number}
     */
    getCurrentTime() {
        return this.context ? this.context.currentTime : 0;
    }
    
    /**
     * 暂停音频上下文
     */
    suspend() {
        if (this.context && this.context.state === 'running') {
            return this.context.suspend();
        }
    }
    
    /**
     * 恢复音频上下文
     */
    resume() {
        if (this.context && this.context.state === 'suspended') {
            return this.context.resume();
        }
    }
}

// 使用示例
const audioEngine = new AudioEngine();

// 初始化音频引擎
await audioEngine.initialize();

// 加载音频文件
await audioEngine.loadAudio('music.mp3', 'bgm');
await audioEngine.loadAudio('click.wav', 'click');

// 播放背景音乐
const bgmSource = audioEngine.playAudio('bgm', {
    loop: true,
    volume: 0.7
});

// 播放点击音效
document.getElementById('button').addEventListener('click', () => {
    audioEngine.playAudio('click', {
        volume: 0.5,
        playbackRate: 1.2
    });
});

// 创建音频效果链
const reverb = audioEngine.createEffect('reverb', {
    length: audioEngine.context.sampleRate * 3,
    decay: 2
});

const delay = audioEngine.createEffect('delay', {
    delayTime: 0.3,
    feedback: 0.4,
    wet: 0.3
});

// 连接效果链
bgmSource.disconnect();
bgmSource.connect(reverb);
reverb.connect(delay.input);
delay.output.connect(audioEngine.masterGain);
```

### 触摸手势接口：移动端交互的基础 ###

**🔍 应用场景**

移动端手势识别、触摸交互、手势控制、多点触控

**❌ 常见问题**

```javascript
// ❌ 简单的触摸事件处理，功能有限
element.addEventListener('touchstart', (e) => {
    console.log('触摸开始');
});
```

**✅ 推荐方案**

```javascript
// ✅ 专业的触摸手势管理器
class TouchGestureManager {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            enableTap: true,
            enableSwipe: true,
            enablePinch: true,
            enableRotate: true,
            enableLongPress: true,
            tapTimeout: 300,
            longPressTimeout: 500,
            swipeThreshold: 50,
            ...options
        };
        
        this.touches = new Map();
        this.gestureState = {
            isActive: false,
            startTime: 0,
            startDistance: 0,
            startAngle: 0,
            lastScale: 1,
            lastRotation: 0
        };
        
        this.listeners = new Map();
        this.longPressTimer = null;
        this.mouseDown = false;
        
        this.init();
    }
    
    /**
     * 初始化事件监听
     */
    init() {
        // 触摸事件
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleTouchCancel = this.handleTouchCancel.bind(this);
        
        this.element.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        this.element.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.element.addEventListener('touchend', this.handleTouchEnd, { passive: false });
        this.element.addEventListener('touchcancel', this.handleTouchCancel, { passive: false });
        
        // 鼠标事件（用于桌面端测试）
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        
        this.element.addEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
    }
    
    /**
     * 处理触摸开始
     * @param {TouchEvent} event - 触摸事件
     */
    handleTouchStart(event) {
        event.preventDefault();
        
        const touches = Array.from(event.touches);
        this.updateTouches(touches);
        
        if (touches.length === 1) {
            // 单点触摸
            const touch = touches[0];
            this.gestureState.startX = touch.clientX;
            this.gestureState.startY = touch.clientY;
            this.gestureState.startTime = Date.now();
            
            // 长按检测
            if (this.options.enableLongPress) {
                this.longPressTimer = setTimeout(() => {
                    this.emit('longpress', {
                        x: touch.clientX,
                        y: touch.clientY,
                        touch: touch
                    });
                }, this.options.longPressTimeout);
            }
        } else if (touches.length === 2) {
            // 双点触摸
            this.gestureState.isActive = true;
            this.gestureState.startDistance = this.getDistance(touches[0], touches[1]);
            this.gestureState.startAngle = this.getAngle(touches[0], touches[1]);
            this.gestureState.lastScale = 1;
            this.gestureState.lastRotation = 0;
            
            // 清除长按定时器
            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
        }
    }
    
    /**
     * 处理触摸移动
     * @param {TouchEvent} event - 触摸事件
     */
    handleTouchMove(event) {
        event.preventDefault();
        
        const touches = Array.from(event.touches);
        this.updateTouches(touches);
        
        if (touches.length === 2 && this.gestureState.isActive) {
            const currentDistance = this.getDistance(touches[0], touches[1]);
            const currentAngle = this.getAngle(touches[0], touches[1]);
            const center = this.getCenter(touches[0], touches[1]);
            
            // 缩放检测
            if (this.options.enablePinch) {
                const scale = currentDistance / this.gestureState.startDistance;
                const deltaScale = scale / this.gestureState.lastScale;
                
                this.emit('pinch', {
                    scale: scale,
                    deltaScale: deltaScale,
                    center: center,
                    touches: touches
                });
                
                this.gestureState.lastScale = scale;
            }
            
            // 旋转检测
            if (this.options.enableRotate) {
                let rotation = currentAngle - this.gestureState.startAngle;
                
                // 处理角度跨越
                if (rotation > 180) rotation -= 360;
                if (rotation < -180) rotation += 360;
                
                const deltaRotation = rotation - this.gestureState.lastRotation;
                
                this.emit('rotate', {
                    rotation: rotation,
                    deltaRotation: deltaRotation,
                    center: center,
                    touches: touches
                });
                
                this.gestureState.lastRotation = rotation;
            }
        }
        
        // 清除长按定时器（移动时取消长按）
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
    }
    
    /**
     * 处理触摸结束
     * @param {TouchEvent} event - 触摸事件
     */
    handleTouchEnd(event) {
        event.preventDefault();
        
        const changedTouches = Array.from(event.changedTouches);
        const remainingTouches = Array.from(event.touches);
        
        this.updateTouches(remainingTouches);
        
        // 重置手势状态
        if (remainingTouches.length === 0) {
            this.gestureState.isActive = false;
        }
        
        // 单点手势检测
        const duration = Date.now() - this.gestureState.startTime;
        
        if (changedTouches.length === 1 && duration < this.options.tapTimeout) {
            const touch = changedTouches[0];
            const deltaX = Math.abs(touch.clientX - this.gestureState.startX);
            const deltaY = Math.abs(touch.clientY - this.gestureState.startY);
            
            // 点击检测
            if (this.options.enableTap && deltaX < 10 && deltaY < 10) {
                this.emit('tap', {
                    x: touch.clientX,
                    y: touch.clientY,
                    touch: touch
                });
            }
            
            // 滑动检测
            if (this.options.enableSwipe && (deltaX > this.options.swipeThreshold || deltaY > this.options.swipeThreshold)) {
                let direction;
                if (deltaX > deltaY) {
                    direction = touch.clientX > this.gestureState.startX ? 'right' : 'left';
                } else {
                    direction = touch.clientY > this.gestureState.startY ? 'down' : 'up';
                }
                
                this.emit('swipe', {
                    direction: direction,
                    deltaX: touch.clientX - this.gestureState.startX,
                    deltaY: touch.clientY - this.gestureState.startY,
                    velocity: Math.sqrt(deltaX * deltaX + deltaY * deltaY) / duration,
                    touch: touch
                });
            }
        }
        
        // 清除长按定时器
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
    }
    
    /**
     * 处理触摸取消
     * @param {TouchEvent} event - 触摸事件
     */
    handleTouchCancel(event) {
        this.handleTouchEnd(event);
    }
    
    /**
     * 更新触摸点
     * @param {Array} touches - 触摸点数组
     */
    updateTouches(touches) {
        this.touches.clear();
        touches.forEach(touch => {
            this.touches.set(touch.identifier, {
                x: touch.clientX,
                y: touch.clientY,
                timestamp: Date.now()
            });
        });
    }
    
    /**
     * 获取两点间距离
     * @param {Touch} touch1 - 触摸点1
     * @param {Touch} touch2 - 触摸点2
     * @returns {number}
     */
    getDistance(touch1, touch2) {
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * 获取两点间角度
     * @param {Touch} touch1 - 触摸点1
     * @param {Touch} touch2 - 触摸点2
     * @returns {number}
     */
    getAngle(touch1, touch2) {
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.atan2(dy, dx) * 180 / Math.PI;
    }
    
    /**
     * 获取两点中心
     * @param {Touch} touch1 - 触摸点1
     * @param {Touch} touch2 - 触摸点2
     * @returns {Object}
     */
    getCenter(touch1, touch2) {
        return {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
        };
    }
    
    /**
     * 重置手势状态
     */
    resetGestureState() {
        this.gestureState = {
            isActive: false,
            startTime: 0,
            startDistance: 0,
            startAngle: 0,
            lastScale: 1,
            lastRotation: 0
        };
    }
    
    /**
     * 鼠标事件处理（桌面端测试）
     */
    handleMouseDown(event) {
        this.mouseDown = true;
        this.handleTouchStart({
            preventDefault: () => event.preventDefault(),
            touches: [{
                identifier: 0,
                clientX: event.clientX,
                clientY: event.clientY
            }]
        });
    }
    
    handleMouseMove(event) {
        if (!this.mouseDown) return;
        this.handleTouchMove({
            preventDefault: () => event.preventDefault(),
            touches: [{
                identifier: 0,
                clientX: event.clientX,
                clientY: event.clientY
            }]
        });
    }
    
    handleMouseUp(event) {
        if (!this.mouseDown) return;
        this.mouseDown = false;
        this.handleTouchEnd({
            preventDefault: () => event.preventDefault(),
            touches: [],
            changedTouches: [{
                identifier: 0,
                clientX: event.clientX,
                clientY: event.clientY
            }]
        });
    }
    
    /**
     * 事件监听
     * @param {string} event - 事件名
     * @param {Function} callback - 回调函数
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    /**
     * 移除事件监听
     * @param {string} event - 事件名
     * @param {Function} callback - 回调函数
     */
    off(event, callback) {
        const callbacks = this.listeners.get(event) || [];
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }
    
    /**
     * 触发事件
     * @param {string} event - 事件名
     * @param {*} data - 事件数据
     */
    emit(event, data) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => callback(data));
    }
    
    /**
     * 销毁手势管理器
     */
    destroy() {
        // 移除事件监听器
        this.element.removeEventListener('touchstart', this.handleTouchStart);
        this.element.removeEventListener('touchmove', this.handleTouchMove);
        this.element.removeEventListener('touchend', this.handleTouchEnd);
        this.element.removeEventListener('touchcancel', this.handleTouchCancel);
        
        this.element.removeEventListener('mousedown', this.handleMouseDown);
        this.element.removeEventListener('mousemove', this.handleMouseMove);
        this.element.removeEventListener('mouseup', this.handleMouseUp);
        
        // 清理定时器
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
        }
        
        // 清理数据
        this.touches.clear();
        this.listeners.clear();
    }
}

// 使用示例
const gestureElement = document.getElementById('gesture-area');
const gestureManager = new TouchGestureManager(gestureElement);

// 监听手势事件
gestureManager.on('tap', (data) => {
    console.log('点击:', data);
});

gestureManager.on('swipe', (data) => {
    console.log('滑动:', data.direction, data.velocity);
});

gestureManager.on('pinch', (data) => {
    console.log('缩放:', data.scale);
    gestureElement.style.transform = `scale(${data.scale})`;
});

gestureManager.on('rotate', (data) => {
    console.log('旋转:', data.rotation);
    gestureElement.style.transform = `rotate(${data.rotation}deg)`;
});

gestureManager.on('longpress', (data) => {
    console.log('长按:', data);
});
```

### 地理位置接口：位置服务的核心 ###

**🔍 应用场景**

地图应用、位置签到、导航服务、基于位置的推荐

**❌ 常见问题**

```javascript
// ❌ 简单的位置获取，缺乏错误处理和优化
navigator.geolocation.getCurrentPosition((position) => {
    console.log(position.coords.latitude, position.coords.longitude);
});
```

**✅ 推荐方案**

```javascript
// ✅ 专业的地理位置管理器
class GeolocationManager {
    constructor(options = {}) {
        this.options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5分钟缓存
            ...options
        };
        
        this.currentPosition = null;
        this.watchId = null;
        this.listeners = new Map();
        this.isSupported = 'geolocation' in navigator;
    }
    
    /**
     * 检查地理位置支持
     * @returns {boolean}
     */
    isGeolocationSupported() {
        return this.isSupported;
    }
    
    /**
     * 获取当前位置
     * @param {Object} options - 选项
     * @returns {Promise<Position>}
     */
    async getCurrentPosition(options = {}) {
        if (!this.isSupported) {
            throw new Error('Geolocation is not supported');
        }
        
        const finalOptions = { ...this.options, ...options };
        
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.currentPosition = position;
                    this.emit('positionUpdate', position);
                    resolve(position);
                },
                (error) => {
                    this.handleError(error);
                    reject(error);
                },
                finalOptions
            );
        });
    }
    
    /**
     * 开始监听位置变化
     * @param {Object} options - 选项
     * @returns {number} watchId
     */
    startWatching(options = {}) {
        if (!this.isSupported) {
            throw new Error('Geolocation is not supported');
        }
        
        if (this.watchId !== null) {
            this.stopWatching();
        }
        
        const finalOptions = { ...this.options, ...options };
        
        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                this.currentPosition = position;
                this.emit('positionUpdate', position);
            },
            (error) => {
                this.handleError(error);
            },
            finalOptions
        );
        
        return this.watchId;
    }
    
    /**
     * 停止监听位置变化
     */
    stopWatching() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
            this.emit('watchStopped');
        }
    }
    
    /**
     * 计算两点间距离
     * @param {Object} pos1 - 位置1
     * @param {Object} pos2 - 位置2
     * @returns {number} 距离（米）
     */
    calculateDistance(pos1, pos2) {
        const R = 6371e3; // 地球半径（米）
        const φ1 = pos1.latitude * Math.PI / 180;
        const φ2 = pos2.latitude * Math.PI / 180;
        const Δφ = (pos2.latitude - pos1.latitude) * Math.PI / 180;
        const Δλ = (pos2.longitude - pos1.longitude) * Math.PI / 180;
        
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return R * c;
    }
    
    /**
     * 处理地理位置错误
     * @param {GeolocationPositionError} error - 错误对象
     */
    handleError(error) {
        let message;
        
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message = '用户拒绝了地理位置请求';
                break;
            case error.POSITION_UNAVAILABLE:
                message = '位置信息不可用';
                break;
            case error.TIMEOUT:
                message = '获取位置信息超时';
                break;
            default:
                message = '获取位置信息时发生未知错误';
                break;
        }
        
        this.emit('error', { code: error.code, message });
    }
    
    /**
     * 事件监听
     * @param {string} event - 事件名
     * @param {Function} callback - 回调函数
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    /**
     * 触发事件
     * @param {string} event - 事件名
     * @param {*} data - 事件数据
     */
    emit(event, data) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => callback(data));
    }
}

// 使用示例
const geoManager = new GeolocationManager({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 600000
});

// 检查支持
if (geoManager.isGeolocationSupported()) {
    // 获取当前位置
    try {
        const position = await geoManager.getCurrentPosition();
        console.log('当前位置:', position.coords);
    } catch (error) {
        console.error('获取位置失败:', error);
    }
    
    // 监听位置变化
    geoManager.on('positionUpdate', (position) => {
        console.log('位置更新:', position.coords);
        updateMap(position.coords);
    });
    
    geoManager.startWatching();
} else {
     console.log('浏览器不支持地理位置');
}
```

### 设备方向接口：感知设备状态 ###

**🔍 应用场景**

移动端游戏、AR应用、设备姿态检测、重力感应

**❌ 常见问题**

```javascript
// ❌ 简单的设备方向监听，缺乏数据处理
window.addEventListener('deviceorientation', (event) => {
    console.log(event.alpha, event.beta, event.gamma);
});
```

**✅ 推荐方案**

```javascript
// ✅ 专业的设备方向管理器
class DeviceOrientationManager {
    constructor(options = {}) {
        this.options = {
            enableSmoothing: true,
            smoothingFactor: 0.8,
            threshold: 1, // 度数阈值
            ...options
        };
        
        this.isSupported = 'DeviceOrientationEvent' in window;
        this.isListening = false;
        this.listeners = new Map();
        
        this.currentOrientation = {
            alpha: 0,   // Z轴旋转
            beta: 0,    // X轴旋转
            gamma: 0,   // Y轴旋转
            absolute: false
        };
        
        this.smoothedOrientation = { ...this.currentOrientation };
        this.lastOrientation = { ...this.currentOrientation };
    }
    
    /**
     * 检查设备方向支持
     * @returns {boolean}
     */
    isDeviceOrientationSupported() {
        return this.isSupported;
    }
    
    /**
     * 请求权限（iOS 13+需要）
     * @returns {Promise<boolean>}
     */
    async requestPermission() {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                return permission === 'granted';
            } catch (error) {
                console.error('设备方向权限请求失败:', error);
                return false;
            }
        }
        return true; // 其他平台默认允许
    }
    
    /**
     * 开始监听设备方向
     * @returns {Promise<boolean>}
     */
    async startListening() {
        if (!this.isSupported) {
            throw new Error('Device orientation is not supported');
        }
        
        if (this.isListening) {
            return true;
        }
        
        // 请求权限
        const hasPermission = await this.requestPermission();
        if (!hasPermission) {
            throw new Error('Device orientation permission denied');
        }
        
        // 绑定事件处理器
        this.handleDeviceOrientation = this.handleDeviceOrientation.bind(this);
        window.addEventListener('deviceorientation', this.handleDeviceOrientation);
        
        this.isListening = true;
        this.emit('started');
        
        return true;
    }
    
    /**
     * 停止监听设备方向
     */
    stopListening() {
        if (!this.isListening) return;
        
        window.removeEventListener('deviceorientation', this.handleDeviceOrientation);
        this.isListening = false;
        this.emit('stopped');
    }
    
    /**
     * 处理设备方向事件
     * @param {DeviceOrientationEvent} event - 设备方向事件
     */
    handleDeviceOrientation(event) {
        const newOrientation = {
            alpha: event.alpha || 0,
            beta: event.beta || 0,
            gamma: event.gamma || 0,
            absolute: event.absolute || false
        };
        
        // 数据平滑处理
        if (this.options.enableSmoothing) {
            this.smoothedOrientation = this.smoothOrientation(newOrientation);
        } else {
            this.smoothedOrientation = newOrientation;
        }
        
        // 检查变化阈值
        if (this.hasSignificantChange(this.smoothedOrientation, this.lastOrientation)) {
            this.currentOrientation = { ...this.smoothedOrientation };
            this.lastOrientation = { ...this.smoothedOrientation };
            
            // 触发事件
            this.emit('orientationchange', {
                orientation: this.currentOrientation,
                raw: newOrientation
            });
            
            // 检测特定方向
            this.detectOrientation();
        }
    }
    
    /**
     * 平滑方向数据
     * @param {Object} newOrientation - 新的方向数据
     * @returns {Object}
     */
    smoothOrientation(newOrientation) {
        const factor = this.options.smoothingFactor;
        
        return {
            alpha: this.smoothAngle(this.smoothedOrientation.alpha, newOrientation.alpha, factor),
            beta: this.smoothAngle(this.smoothedOrientation.beta, newOrientation.beta, factor),
            gamma: this.smoothAngle(this.smoothedOrientation.gamma, newOrientation.gamma, factor),
            absolute: newOrientation.absolute
        };
    }
    
    /**
     * 平滑角度值
     * @param {number} oldAngle - 旧角度
     * @param {number} newAngle - 新角度
     * @param {number} factor - 平滑因子
     * @returns {number}
     */
    smoothAngle(oldAngle, newAngle, factor) {
        // 处理角度跨越（0-360度）
        let diff = newAngle - oldAngle;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        
        return oldAngle + diff * (1 - factor);
    }
    
    /**
     * 检查是否有显著变化
     * @param {Object} current - 当前方向
     * @param {Object} last - 上次方向
     * @returns {boolean}
     */
    hasSignificantChange(current, last) {
        const threshold = this.options.threshold;
        
        return Math.abs(current.alpha - last.alpha) > threshold ||
               Math.abs(current.beta - last.beta) > threshold ||
               Math.abs(current.gamma - last.gamma) > threshold;
    }
    
    /**
     * 检测设备方向
     */
    detectOrientation() {
        const { beta, gamma } = this.currentOrientation;
        let orientation = 'unknown';
        
        // 检测设备方向
        if (Math.abs(beta) < 45) {
            if (Math.abs(gamma) < 45) {
                orientation = 'flat';
            } else if (gamma > 45) {
                orientation = 'left';
            } else if (gamma < -45) {
                orientation = 'right';
            }
        } else if (beta > 45) {
            orientation = 'forward';
        } else if (beta < -45) {
            orientation = 'backward';
        }
        
        this.emit('orientationdetected', {
            orientation: orientation,
            angles: this.currentOrientation
        });
    }
    
    /**
     * 获取当前方向
     * @returns {Object}
     */
    getCurrentOrientation() {
        return { ...this.currentOrientation };
    }
    
    /**
     * 计算倾斜角度
     * @returns {Object}
     */
    getTiltAngles() {
        const { beta, gamma } = this.currentOrientation;
        
        return {
            pitch: beta,    // 前后倾斜
            roll: gamma,    // 左右倾斜
            magnitude: Math.sqrt(beta * beta + gamma * gamma)
        };
    }
    
    /**
     * 事件监听
     * @param {string} event - 事件名
     * @param {Function} callback - 回调函数
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    /**
     * 触发事件
     * @param {string} event - 事件名
     * @param {*} data - 事件数据
     */
    emit(event, data) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => callback(data));
    }
    
    /**
     * 销毁管理器
     */
    destroy() {
        this.stopListening();
        this.listeners.clear();
    }
}

// 使用示例
const orientationManager = new DeviceOrientationManager({
    enableSmoothing: true,
    smoothingFactor: 0.8,
    threshold: 2
});

// 检查支持
if (orientationManager.isDeviceOrientationSupported()) {
    // 开始监听
    try {
        await orientationManager.startListening();
        
        // 监听方向变化
        orientationManager.on('orientationchange', (data) => {
            console.log('方向变化:', data.orientation);
            updateUI(data.orientation);
        });
        
        // 监听方向检测
        orientationManager.on('orientationdetected', (data) => {
            console.log('设备方向:', data.orientation);
        });
        
    } catch (error) {
        console.error('启动设备方向监听失败:', error);
    }
} else {
    console.log('设备不支持方向感应');
}
```

### 网络信息接口：网络状态感知 ###

**🔍 应用场景**

网络状态监控、自适应加载、离线处理、性能优化

**❌ 常见问题**

```javascript
// ❌ 简单的网络状态检查，信息有限
if (navigator.onLine) {
    console.log('在线');
} else {
    console.log('离线');
}
```

**✅ 推荐方案**

```javascript
// ✅ 专业的网络信息管理器
class NetworkManager {
    constructor(options = {}) {
        this.options = {
            enableConnectionMonitoring: true,
            enableSpeedTest: true,
            speedTestInterval: 30000, // 30秒
            speedTestUrl: '/api/ping',
            ...options
        };
        
        this.listeners = new Map();
        this.connectionInfo = {
            online: navigator.onLine,
            type: 'unknown',
            effectiveType: 'unknown',
            downlink: 0,
            rtt: 0,
            saveData: false
        };
        
        this.speedTestResults = [];
        this.speedTestTimer = null;
        
        this.init();
    }
    
    /**
     * 初始化网络管理器
     */
    init() {
        // 监听在线/离线状态
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
        
        // 监听网络连接变化
        if ('connection' in navigator) {
            const connection = navigator.connection;
            connection.addEventListener('change', this.handleConnectionChange.bind(this));
            this.updateConnectionInfo();
        }
        
        // 开始速度测试
        if (this.options.enableSpeedTest) {
            this.startSpeedTest();
        }
    }
    
    /**
     * 处理在线事件
     */
    handleOnline() {
        this.connectionInfo.online = true;
        this.emit('online', this.connectionInfo);
        this.emit('statuschange', this.connectionInfo);
        
        // 重新开始速度测试
        if (this.options.enableSpeedTest) {
            this.startSpeedTest();
        }
    }
    
    /**
     * 处理离线事件
     */
    handleOffline() {
        this.connectionInfo.online = false;
        this.emit('offline', this.connectionInfo);
        this.emit('statuschange', this.connectionInfo);
        
        // 停止速度测试
        this.stopSpeedTest();
    }
    
    /**
     * 处理连接变化
     */
    handleConnectionChange() {
        this.updateConnectionInfo();
        this.emit('connectionchange', this.connectionInfo);
        this.emit('statuschange', this.connectionInfo);
    }
    
    /**
     * 更新连接信息
     */
    updateConnectionInfo() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            this.connectionInfo = {
                ...this.connectionInfo,
                type: connection.type || 'unknown',
                effectiveType: connection.effectiveType || 'unknown',
                downlink: connection.downlink || 0,
                rtt: connection.rtt || 0,
                saveData: connection.saveData || false
            };
        }
    }
    
    /**
     * 开始网络速度测试
     */
    startSpeedTest() {
        if (this.speedTestTimer) {
            clearInterval(this.speedTestTimer);
        }
        
        // 立即执行一次
        this.performSpeedTest();
        
        // 定期执行
        this.speedTestTimer = setInterval(() => {
            this.performSpeedTest();
        }, this.options.speedTestInterval);
    }
    
    /**
     * 停止网络速度测试
     */
    stopSpeedTest() {
        if (this.speedTestTimer) {
            clearInterval(this.speedTestTimer);
            this.speedTestTimer = null;
        }
    }
    
    /**
     * 执行网络速度测试
     */
    async performSpeedTest() {
        if (!this.connectionInfo.online) return;
        
        try {
            const startTime = performance.now();
            const response = await fetch(this.options.speedTestUrl + '?t=' + Date.now(), {
                method: 'HEAD',
                cache: 'no-cache'
            });
            const endTime = performance.now();
            
            const latency = endTime - startTime;
            const result = {
                timestamp: Date.now(),
                latency: latency,
                success: response.ok
            };
            
            this.speedTestResults.push(result);
            
            // 保留最近10次结果
            if (this.speedTestResults.length > 10) {
                this.speedTestResults.shift();
            }
            
            this.emit('speedtest', result);
            
        } catch (error) {
            const result = {
                timestamp: Date.now(),
                latency: -1,
                success: false,
                error: error.message
            };
            
            this.speedTestResults.push(result);
            this.emit('speedtest', result);
        }
    }
    
    /**
     * 获取网络质量评估
     * @returns {Object}
     */
    getNetworkQuality() {
        const { effectiveType, downlink, rtt } = this.connectionInfo;
        let quality = 'unknown';
        let score = 0;
        
        // 基于有效连接类型评分
        switch (effectiveType) {
            case 'slow-2g':
                score += 1;
                break;
            case '2g':
                score += 2;
                break;
            case '3g':
                score += 3;
                break;
            case '4g':
                score += 4;
                break;
        }
        
        // 基于下行速度评分
        if (downlink > 10) score += 2;
        else if (downlink > 5) score += 1;
        
        // 基于RTT评分
        if (rtt < 100) score += 2;
        else if (rtt < 300) score += 1;
        
        // 基于速度测试结果评分
        const avgLatency = this.getAverageLatency();
        if (avgLatency > 0) {
            if (avgLatency < 100) score += 2;
            else if (avgLatency < 300) score += 1;
        }
        
        // 确定质量等级
        if (score >= 8) quality = 'excellent';
        else if (score >= 6) quality = 'good';
        else if (score >= 4) quality = 'fair';
        else if (score >= 2) quality = 'poor';
        else quality = 'very-poor';
        
        return {
            quality: quality,
            score: score,
            details: {
                effectiveType: effectiveType,
                downlink: downlink,
                rtt: rtt,
                avgLatency: avgLatency
            }
        };
    }
    
    /**
     * 获取平均延迟
     * @returns {number}
     */
    getAverageLatency() {
        const successfulTests = this.speedTestResults.filter(result => result.success);
        if (successfulTests.length === 0) return -1;
        
        const totalLatency = successfulTests.reduce((sum, result) => sum + result.latency, 0);
        return totalLatency / successfulTests.length;
    }
    
    /**
     * 获取连接信息
     * @returns {Object}
     */
    getConnectionInfo() {
        return { ...this.connectionInfo };
    }
    
    /**
     * 检查是否为慢速连接
     * @returns {boolean}
     */
    isSlowConnection() {
        const { effectiveType, saveData } = this.connectionInfo;
        return saveData || effectiveType === 'slow-2g' || effectiveType === '2g';
    }
    
    /**
     * 检查是否为移动网络
     * @returns {boolean}
     */
    isMobileConnection() {
        const { type } = this.connectionInfo;
        return type === 'cellular';
    }
    
    /**
     * 获取网络建议
     * @returns {Object}
     */
    getNetworkRecommendations() {
        const quality = this.getNetworkQuality();
        const recommendations = [];
        
        if (this.isSlowConnection()) {
            recommendations.push({
                type: 'performance',
                message: '检测到慢速网络，建议减少数据传输'
            });
        }
        
        if (this.isMobileConnection()) {
            recommendations.push({
                type: 'data-usage',
                message: '当前使用移动网络，注意流量消耗'
            });
        }
        
        if (quality.quality === 'poor' || quality.quality === 'very-poor') {
            recommendations.push({
                type: 'quality',
                message: '网络质量较差，建议启用离线模式'
            });
        }
        
        return {
            quality: quality,
            recommendations: recommendations
        };
    }
    
    /**
     * 事件监听
     * @param {string} event - 事件名
     * @param {Function} callback - 回调函数
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    /**
     * 触发事件
     * @param {string} event - 事件名
     * @param {*} data - 事件数据
     */
    emit(event, data) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => callback(data));
    }
    
    /**
     * 销毁网络管理器
     */
    destroy() {
        window.removeEventListener('online', this.handleOnline);
        window.removeEventListener('offline', this.handleOffline);
        
        if ('connection' in navigator) {
            navigator.connection.removeEventListener('change', this.handleConnectionChange);
        }
        
        this.stopSpeedTest();
        this.listeners.clear();
    }
}

// 使用示例
const networkManager = new NetworkManager({
    enableSpeedTest: true,
    speedTestInterval: 30000
});

// 监听网络状态变化
networkManager.on('statuschange', (info) => {
    console.log('网络状态:', info);
    updateNetworkIndicator(info);
});

networkManager.on('speedtest', (result) => {
    console.log('速度测试:', result);
});

// 获取网络建议
const recommendations = networkManager.getNetworkRecommendations();
console.log('网络建议:', recommendations);
```

### 辅助功能接口：无障碍访问支持 ###

**🔍 应用场景**

无障碍访问、屏幕阅读器支持、键盘导航、语音控制

**❌ 常见问题**

```javascript
// ❌ 缺乏无障碍支持的组件
function createButton(text) {
    const button = document.createElement('button');
    button.textContent = text;
    return button;
}
```

**✅ 推荐方案**

```javascript
// ✅ 专业的无障碍功能管理器
class AccessibilityManager {
    constructor(options = {}) {
        this.options = {
            enableKeyboardNavigation: true,
            enableScreenReader: true,
            enableHighContrast: false,
            enableFocusManagement: true,
            announceChanges: true,
            ...options
        };
        
        this.focusHistory = [];
        this.announcements = [];
        this.keyboardTrapStack = [];
        this.listeners = new Map();
        
        this.init();
    }
    
    /**
     * 初始化无障碍管理器
     */
    init() {
        // 创建屏幕阅读器公告区域
        this.createAnnouncementRegion();
        
        // 设置键盘导航
        if (this.options.enableKeyboardNavigation) {
            this.setupKeyboardNavigation();
        }
        
        // 设置焦点管理
        if (this.options.enableFocusManagement) {
            this.setupFocusManagement();
        }
        
        // 检测用户偏好
        this.detectUserPreferences();
    }
    
    /**
     * 创建屏幕阅读器公告区域
     */
    createAnnouncementRegion() {
        // 创建实时公告区域
        this.liveRegion = document.createElement('div');
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.setAttribute('aria-atomic', 'true');
        this.liveRegion.className = 'sr-only';
        this.liveRegion.style.cssText = `
            position: absolute !important;
            width: 1px !important;
            height: 1px !important;
            padding: 0 !important;
            margin: -1px !important;
            overflow: hidden !important;
            clip: rect(0, 0, 0, 0) !important;
            white-space: nowrap !important;
            border: 0 !important;
        `;
        
        // 创建紧急公告区域
        this.assertiveRegion = document.createElement('div');
        this.assertiveRegion.setAttribute('aria-live', 'assertive');
        this.assertiveRegion.setAttribute('aria-atomic', 'true');
        this.assertiveRegion.className = 'sr-only';
        this.assertiveRegion.style.cssText = this.liveRegion.style.cssText;
        
        document.body.appendChild(this.liveRegion);
        document.body.appendChild(this.assertiveRegion);
    }
    
    /**
     * 设置键盘导航
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardNavigation(event);
        });
        
        // 添加跳转链接
        this.addSkipLinks();
    }
    
    /**
     * 添加跳转链接
     */
    addSkipLinks() {
        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">跳转到主要内容</a>
            <a href="#navigation" class="skip-link">跳转到导航</a>
        `;
        
        // 样式
        const style = document.createElement('style');
        style.textContent = `
            .skip-links {
                position: absolute;
                top: -40px;
                left: 6px;
                z-index: 1000;
            }
            .skip-link {
                position: absolute;
                top: -40px;
                left: 6px;
                background: #000;
                color: #fff;
                padding: 8px;
                text-decoration: none;
                z-index: 1000;
            }
            .skip-link:focus {
                top: 6px;
            }
        `;
        
        document.head.appendChild(style);
        document.body.insertBefore(skipLinks, document.body.firstChild);
    }
    
    /**
     * 处理键盘导航
     * @param {KeyboardEvent} event - 键盘事件
     */
    handleKeyboardNavigation(event) {
        const { key, ctrlKey, altKey, shiftKey } = event;
        
        // Escape键处理
        if (key === 'Escape') {
            this.handleEscape(event);
        }
        
        // Tab键陷阱处理
        if (key === 'Tab') {
            this.handleTabTrap(event);
        }
        
        // 方向键导航
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            this.handleArrowNavigation(event);
        }
        
        // 快捷键处理
        if (ctrlKey || altKey) {
            this.handleShortcuts(event);
        }
    }
    
    /**
     * 处理Escape键
     * @param {KeyboardEvent} event - 键盘事件
     */
    handleEscape(event) {
        // 关闭模态框
        const modal = document.querySelector('[role="dialog"]:not([aria-hidden="true"])');
        if (modal) {
            this.closeModal(modal);
            event.preventDefault();
            return;
        }
        
        // 退出焦点陷阱
        if (this.keyboardTrapStack.length > 0) {
            this.exitKeyboardTrap();
            event.preventDefault();
        }
    }
    
    /**
     * 处理Tab键陷阱
     * @param {KeyboardEvent} event - 键盘事件
     */
    handleTabTrap(event) {
        if (this.keyboardTrapStack.length === 0) return;
        
        const currentTrap = this.keyboardTrapStack[this.keyboardTrapStack.length - 1];
        const focusableElements = this.getFocusableElements(currentTrap.container);
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
                lastElement.focus();
                event.preventDefault();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                firstElement.focus();
                event.preventDefault();
            }
        }
    }
    
    /**
     * 处理方向键导航
     * @param {KeyboardEvent} event - 键盘事件
     */
    handleArrowNavigation(event) {
        const activeElement = document.activeElement;
        const role = activeElement.getAttribute('role');
        
        // 处理菜单导航
        if (role === 'menuitem' || activeElement.closest('[role="menu"]')) {
            this.handleMenuNavigation(event);
        }
        
        // 处理表格导航
        if (activeElement.tagName === 'TD' || activeElement.tagName === 'TH') {
            this.handleTableNavigation(event);
        }
        
        // 处理网格导航
        if (role === 'gridcell' || activeElement.closest('[role="grid"]')) {
            this.handleGridNavigation(event);
        }
    }
    
    /**
     * 设置焦点管理
     */
    setupFocusManagement() {
        // 监听焦点变化
        document.addEventListener('focusin', (event) => {
            this.handleFocusIn(event);
        });
        
        document.addEventListener('focusout', (event) => {
            this.handleFocusOut(event);
        });
        
        // 监听DOM变化
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    this.handleDOMChanges(mutation);
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * 处理焦点进入
     * @param {FocusEvent} event - 焦点事件
     */
    handleFocusIn(event) {
        const element = event.target;
        
        // 记录焦点历史
        this.focusHistory.push({
            element: element,
            timestamp: Date.now()
        });
        
        // 限制历史记录长度
        if (this.focusHistory.length > 10) {
            this.focusHistory.shift();
        }
        
        // 触发焦点事件
        this.emit('focuschange', {
            element: element,
            type: 'focusin'
        });
    }
    
    /**
     * 处理焦点离开
     * @param {FocusEvent} event - 焦点事件
     */
    handleFocusOut(event) {
        this.emit('focuschange', {
            element: event.target,
            type: 'focusout'
        });
    }
    
    /**
     * 检测用户偏好
     */
    detectUserPreferences() {
        // 检测减少动画偏好
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.setReducedMotion(true);
        }
        
        // 检测高对比度偏好
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            this.setHighContrast(true);
        }
        
        // 检测颜色方案偏好
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.setDarkMode(true);
        }
    }
    
    /**
     * 公告消息给屏幕阅读器
     * @param {string} message - 消息内容
     * @param {string} priority - 优先级 ('polite' | 'assertive')
     */
    announce(message, priority = 'polite') {
        const region = priority === 'assertive' ? this.assertiveRegion : this.liveRegion;
        
        // 清空区域
        region.textContent = '';
        
        // 延迟添加消息，确保屏幕阅读器能检测到变化
        setTimeout(() => {
            region.textContent = message;
        }, 100);
        
        // 记录公告
        this.announcements.push({
            message: message,
            priority: priority,
            timestamp: Date.now()
        });
        
        if (this.options.announceChanges) {
            this.emit('announcement', {
                message: message,
                priority: priority
            });
        }
    }
    
    /**
     * 创建键盘陷阱
     * @param {HTMLElement} container - 容器元素
     * @param {Object} options - 选项
     */
    createKeyboardTrap(container, options = {}) {
        const trap = {
            container: container,
            previousFocus: document.activeElement,
            options: {
                returnFocus: true,
                ...options
            }
        };
        
        this.keyboardTrapStack.push(trap);
        
        // 设置初始焦点
        const focusableElements = this.getFocusableElements(container);
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
        
        return trap;
    }
    
    /**
     * 退出键盘陷阱
     */
    exitKeyboardTrap() {
        if (this.keyboardTrapStack.length === 0) return;
        
        const trap = this.keyboardTrapStack.pop();
        
        // 恢复焦点
        if (trap.options.returnFocus && trap.previousFocus) {
            trap.previousFocus.focus();
        }
    }
    
    /**
     * 获取可聚焦元素
     * @param {HTMLElement} container - 容器元素
     * @returns {HTMLElement[]}
     */
    getFocusableElements(container) {
        const selector = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]'
        ].join(', ');
        
        return Array.from(container.querySelectorAll(selector))
            .filter(element => {
                return element.offsetWidth > 0 && 
                       element.offsetHeight > 0 && 
                       !element.hasAttribute('aria-hidden');
            });
    }
    
    /**
     * 设置减少动画
     * @param {boolean} enabled - 是否启用
     */
    setReducedMotion(enabled) {
        document.documentElement.classList.toggle('reduce-motion', enabled);
        this.emit('preferencechange', {
            type: 'reduced-motion',
            enabled: enabled
        });
    }
    
    /**
     * 设置高对比度
     * @param {boolean} enabled - 是否启用
     */
    setHighContrast(enabled) {
        document.documentElement.classList.toggle('high-contrast', enabled);
        this.emit('preferencechange', {
            type: 'high-contrast',
            enabled: enabled
        });
    }
    
    /**
     * 设置深色模式
     * @param {boolean} enabled - 是否启用
     */
    setDarkMode(enabled) {
        document.documentElement.classList.toggle('dark-mode', enabled);
        this.emit('preferencechange', {
            type: 'dark-mode',
            enabled: enabled
        });
    }
    
    /**
     * 创建无障碍按钮
     * @param {Object} config - 按钮配置
     * @returns {HTMLElement}
     */
    createAccessibleButton(config) {
        const button = document.createElement('button');
        
        // 基本属性
        button.textContent = config.text;
        button.type = config.type || 'button';
        
        // 无障碍属性
        if (config.ariaLabel) {
            button.setAttribute('aria-label', config.ariaLabel);
        }
        
        if (config.ariaDescribedBy) {
            button.setAttribute('aria-describedby', config.ariaDescribedBy);
        }
        
        if (config.ariaExpanded !== undefined) {
            button.setAttribute('aria-expanded', config.ariaExpanded);
        }
        
        if (config.ariaControls) {
            button.setAttribute('aria-controls', config.ariaControls);
        }
        
        // 事件处理
        if (config.onClick) {
            button.addEventListener('click', config.onClick);
        }
        
        // 键盘事件
        button.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                button.click();
            }
        });
        
        return button;
    }
    
    /**
     * 事件监听
     * @param {string} event - 事件名
     * @param {Function} callback - 回调函数
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    /**
     * 触发事件
     * @param {string} event - 事件名
     * @param {*} data - 事件数据
     */
    emit(event, data) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => callback(data));
    }
    
    /**
     * 销毁无障碍管理器
     */
    destroy() {
        // 清理DOM元素
        if (this.liveRegion) {
            this.liveRegion.remove();
        }
        if (this.assertiveRegion) {
            this.assertiveRegion.remove();
        }
        
        // 清理事件监听器
        this.listeners.clear();
        
        // 清理键盘陷阱
        while (this.keyboardTrapStack.length > 0) {
            this.exitKeyboardTrap();
        }
    }
}

// 使用示例
const accessibilityManager = new AccessibilityManager({
    enableKeyboardNavigation: true,
    enableScreenReader: true,
    announceChanges: true
});

// 创建无障碍按钮
const button = accessibilityManager.createAccessibleButton({
    text: '打开菜单',
    ariaLabel: '打开主导航菜单',
    ariaExpanded: false,
    ariaControls: 'main-menu',
    onClick: () => {
        // 切换菜单状态
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', !isExpanded);
        
        // 公告状态变化
        accessibilityManager.announce(
            isExpanded ? '菜单已关闭' : '菜单已打开'
        );
    }
});

// 监听无障碍事件
accessibilityManager.on('announcement', (data) => {
    console.log('屏幕阅读器公告:', data.message);
});

accessibilityManager.on('focuschange', (data) => {
    console.log('焦点变化:', data.element.tagName);
});
```

## 🎯 总结与展望 ##

### 核心要点回顾 ###

通过本篇文章，我们深入探讨了HTML DOM API的高级接口：

- Web Worker接口 - 实现多线程处理，提升应用性能
- WebRTC接口 - 构建实时通信应用
- WebGL接口 - 创建高性能3D图形
- 触摸手势接口 - 优化移动端交互体验
- 地理位置接口 - 实现位置感知功能
- 设备方向接口 - 感知设备状态变化
- 网络信息接口 - 智能网络状态管理
- 辅助功能接口 - 构建无障碍访问体验

### 实践建议 ###

- 渐进增强 - 始终提供基础功能的降级方案
- 性能优化 - 合理使用高级API，避免过度消耗资源
- 用户体验 - 关注不同设备和网络环境下的体验
- 无障碍访问 - 确保所有用户都能正常使用应用

> 💡 提示：本文涵盖的API接口较多，建议结合实际项目需求选择性学习和应用。记住，技术的价值在于解决实际问题，而不是为了使用而使用。

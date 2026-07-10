---
lastUpdated: true
commentabled: true
recommended: true
title: 🔔 如何实现一个优雅的通知中心？
description: Vue 3 + 消息队列实战
date: 2026-04-29 09:15:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 前言 ##

一个完善的通知系统可以显著提升用户体验，让用户及时了解：

- 新评论回复
- 文章被点赞
- 系统公告
- 签到奖励

今天分享如何实现一个优雅的通知中心！

## 功能设计 ##

### 通知类型 ###

```typescript
// src/types/notification.ts
export type NotificationType = 
  | 'comment'      // 评论通知
  | 'reply'         // 回复通知
  | 'like'          // 点赞通知
  | 'follow'        // 关注通知
  | 'system'        // 系统通知
  | 'achievement'   // 成就通知

export interface Notification {
  id: string
  type: NotificationType
  title: string
  content: string
  avatar?: string
  link?: string
  read: boolean
  createTime: number
}
```

## 核心实现 ##

### 通知服务 ###

```typescript
// src/services/notification.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Notification, NotificationType } from '@/types/notification'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])
  
  // 加载通知
  function loadNotifications() {
    const data = localStorage.getItem('blog_notifications')
    if (data) {
      notifications.value = JSON.parse(data)
    }
  }
  
  // 保存通知
  function saveNotifications() {
    localStorage.setItem('blog_notifications', JSON.stringify(notifications.value))
  }
  
  // 添加通知
  function addNotification(notification: Omit<Notification, 'id' | 'read' | 'createTime'>) {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      read: false,
      createTime: Date.now()
    }
    
    notifications.value.unshift(newNotification)
    saveNotifications()
    
    // 触发浏览器通知
    if (Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.content,
        icon: newNotification.avatar
      })
    }
    
    return newNotification
  }
  
  // 标记已读
  function markAsRead(id: string) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
      saveNotifications()
    }
  }
  
  // 全部已读
  function markAllAsRead() {
    notifications.value.forEach(n => {
      n.read = true
    })
    saveNotifications()
  }
  
  // 删除通知
  function deleteNotification(id: string) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
      saveNotifications()
    }
  }
  
  // 未读数量
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })
  
  // 按类型分组
  const groupedNotifications = computed(() => {
    const groups: Record<NotificationType, Notification[]> = {
      comment: [],
      reply: [],
      like: [],
      follow: [],
      system: [],
      achievement: []
    }
    
    notifications.value.forEach(n => {
      groups[n.type].push(n)
    })
    
    return groups
  })
  
  // 请求通知权限
  async function requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }
  
  loadNotifications()
  
  return {
    notifications,
    unreadCount,
    groupedNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestPermission
  }
})
```

### 通知中心组件 ###

```vue
<!-- src/components/notification/NotificationCenter.vue -->
<template>
  <el-popover
    v-model:visible="visible"
    placement="bottom-end"
    :width="360"
    trigger="click"
  >
    <template #reference>
      <div class="notification-trigger">
        <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99">
          <el-button :icon="Bell" circle />
        </el-badge>
        <!-- 红点提醒 -->
        <span v-if="hasNewNotification" class="new-dot" />
      </div>
    </template>
    
    <template #default>
      <div class="notification-center">
        <!-- 头部 -->
        <div class="header">
          <h3>通知中心</h3>
          <el-button 
            v-if="unreadCount > 0" 
            text 
            size="small"
            @click="handleMarkAllRead"
          >
            全部已读
          </el-button>
        </div>
        
        <!-- 标签页 -->
        <el-tabs v-model="activeTab" class="notification-tabs">
          <el-tab-pane label="全部" name="all" />
          <el-tab-pane label="评论" name="comment" />
          <el-tab-pane label="点赞" name="like" />
          <el-tab-pane label="系统" name="system" />
        </el-tabs>
        
        <!-- 通知列表 -->
        <div class="notification-list">
          <div 
            v-for="notification in filteredNotifications"
            :key="notification.id"
            class="notification-item"
            :class="{ unread: !notification.read }"
            @click="handleClick(notification)"
          >
            <el-avatar 
              :src="notification.avatar || defaultAvatar" 
              :size="40"
            />
            
            <div class="content">
              <div class="title">{{ notification.title }}</div>
              <div class="message">{{ notification.content }}</div>
              <div class="time">{{ formatTime(notification.createTime) }}</div>
            </div>
            
            <div class="actions">
              <el-button 
                v-if="!notification.read"
                text 
                size="small"
                @click.stop="handleMarkRead(notification.id)"
              >
                标记已读
              </el-button>
              <el-button 
                text 
                size="small"
                @click.stop="handleDelete(notification.id)"
              >
                删除
              </el-button>
            </div>
          </div>
          
          <el-empty 
            v-if="filteredNotifications.length === 0"
            description="暂无通知"
          />
        </div>
      </div>
    </template>
  </el-popover>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Bell } from '@element-plus/icons-vue'
import { useNotificationStore } from '@/services/notification'
import type { Notification } from '@/types/notification'
import { ElMessage } from 'element-plus'

const notificationStore = useNotificationStore()
const visible = ref(false)
const activeTab = ref('all')

const unreadCount = computed(() => notificationStore.unreadCount)
const hasNewNotification = computed(() => unreadCount.value > 0)

const defaultAvatar = '/default-avatar.png'

const filteredNotifications = computed(() => {
  if (activeTab.value === 'all') {
    return notificationStore.notifications
  }
  return notificationStore.notifications.filter(n => n.type === activeTab.value)
})

function formatTime(timestamp: number) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  
  return date.toLocaleDateString()
}

function handleClick(notification: Notification) {
  notificationStore.markAsRead(notification.id)
  
  if (notification.link) {
    window.location.href = notification.link
  }
  
  visible.value = false
}

function handleMarkRead(id: string) {
  notificationStore.markAsRead(id)
}

function handleMarkAllRead() {
  notificationStore.markAllAsRead()
  ElMessage.success('已全部标记为已读')
}

function handleDelete(id: string) {
  notificationStore.deleteNotification(id)
}

// 监听新通知
watch(() => notificationStore.unreadCount, (newCount, oldCount) => {
  if (newCount > oldCount) {
    // 播放提示音
    const audio = new Audio('/notification.mp3')
    audio.play().catch(() => {})
  }
})

onMounted(() => {
  notificationStore.requestPermission()
})
</script>

<style scoped>
.notification-trigger {
  position: relative;
  display: inline-block;
}

.new-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  background: #f56c6c;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

.notification-center {
  margin: -12px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color);
}

.header h3 {
  margin: 0;
  font-size: 16px;
}

.notification-tabs {
  padding: 0 8px;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.notification-item:hover {
  background: var(--el-fill-color-light);
}

.notification-item.unread {
  background: var(--el-color-primary-light-9);
}

.notification-item.unread::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background: var(--el-color-primary);
  border-radius: 50%;
}

.content {
  flex: 1;
  min-width: 0;
}

.title {
  font-weight: 600;
  margin-bottom: 4px;
}

.message {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  margin-top: 4px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
```

## 使用示例 ##

```vue
<!-- 在 Header 中使用 -->
<template>
  <header>
    <div class="header-content">
      <!-- 其他内容 -->
      <NotificationCenter />
    </div>
  </header>
</template>

<script setup lang="ts">
import NotificationCenter from '@/components/notification/NotificationCenter.vue'
import { useNotificationStore } from '@/services/notification'

const notificationStore = useNotificationStore()

// 模拟收到新评论
function simulateNewComment() {
  notificationStore.addNotification({
    type: 'comment',
    title: '新评论',
    content: '用户"前端小白"评论了你的文章《Vue 3 入门指南》',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
    link: '/article/vue3-guide'
  })
}
</script>
```

### 浏览器通知 ###

```typescript
// 在需要时请求权限并发送通知
async function sendBrowserNotification(title: string, options?: NotificationOptions) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/logo.png',
      badge: '/badge.png',
      ...options
    })
  }
}
```

## 💡 进阶功能 ##

- 接入 WebSocket 实现实时推送
- 添加通知免打扰模式
- 支持通知折叠和展开

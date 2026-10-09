---
lastUpdated: true
commentabled: true
recommended: true
title: Vue 3 组件重构实战
description: 从重复代码到优雅抽象的三种方案
date: 2025-10-27 12:00:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

> 在前端开发中，我们经常遇到多个组件有大量相似逻辑的情况。如何优雅地处理这些重复代码，既能提高开发效率，又能保持代码的可维护性？本文将通过一个游戏UI开发的实际案例，对比三种不同的重构方案，帮你找到最适合的解决方案。

## 🎯 问题背景 ##

假设我们正在开发一款RPG游戏的Web版本，包含多个核心UI组件：背包组件、技能组件、装备组件、任务组件等。这些组件都有相似的功能：

- 💡 数据渲染：统一的UI渲染和布局逻辑
- 🎯 交互处理：拖拽、点击、悬停等用户交互
- 📊 状态管理：加载、更新、同步等状态处理
- 🎨 主题切换：支持多套游戏皮肤主题
- 💾 数据持久化：本地存储和云端同步

让我们看看原始的背包组件长什么样：

```vue
<!-- InventoryComponent.vue -->
<template>
  <div class="inventory-panel" @click="handleClick" ref="containerRef">
    <div class="panel-header">
      <h3>背包</h3>
      <button @click="toggleTheme">切换主题</button>
    </div>
    
    <div class="inventory-grid" @drop="handleDrop" @dragover.prevent>
      <div 
        v-for="slot in inventorySlots" 
        :key="slot.id"
        class="inventory-slot"
        :class="{ 'has-item': slot.item }"
        @dragstart="handleDragStart"
        @click="handleSlotClick(slot)"
      >
        <img v-if="slot.item" :src="slot.item.icon" :alt="slot.item.name" />
        <span v-if="slot.item?.count > 1" class="item-count">{{ slot.item.count }}</span>
      </div>
    </div>
    
    <LoadingDialog ref="loadingRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { renderUI, applyTheme } from './utils'
import LoadingDialog from './LoadingDialog.vue'
import gameAPI from '@/api/game'

const props = defineProps(['gameData', 'theme', 'readonly'])
const emit = defineEmits(['update', 'item-select', 'item-use'])

// 容器和对话框引用
const containerRef = ref<HTMLElement>()
const loadingRef = ref()
const inventorySlots = ref([])

// UI渲染
const renderInventory = (data: any, theme: string) => {
  if (!containerRef.value) return
  
  // 应用主题样式
  applyTheme(containerRef.value, theme)
  
  // 渲染物品数据
  inventorySlots.value = renderUI('inventory', data)
}

// 拖拽处理
const handleDragStart = (event: DragEvent) => {
  const slotElement = event.target as HTMLElement
  const slotId = slotElement.dataset.slotId
  event.dataTransfer?.setData('text/plain', slotId)
}

const handleDrop = async (event: DragEvent) => {
  event.preventDefault()
  const fromSlotId = event.dataTransfer?.getData('text/plain')
  const toSlotId = (event.target as HTMLElement).dataset.slotId
  
  if (fromSlotId && toSlotId) {
    await syncItemMove(fromSlotId, toSlotId)
  }
}

// 数据同步
const syncItemMove = async (fromSlot: string, toSlot: string) => {
  try {
    loadingRef.value?.show()
    
    const response = await gameAPI.moveItem({
      type: 'inventory',
      from: fromSlot,
      to: toSlot
    })
    
    if (response.success) {
      if (!props.readonly) {
        emit('update', {
          type: 'itemMoved',
          data: response.data
        })
      }
      
      renderInventory(response.data, props.theme)
      loadingRef.value?.hide()
    }
  } catch (error) {
    console.error('物品移动失败:', error)
    loadingRef.value?.hide()
  }
}

// 主题切换
const toggleTheme = () => {
  const newTheme = props.theme === 'dark' ? 'light' : 'dark'
  emit('update', { type: 'themeChange', theme: newTheme })
}

// 槽位点击
const handleSlotClick = (slot: any) => {
  if (slot.item) {
    emit('item-select', { item: slot.item })
  }
}

// 外部更新数据
const updateInventory = (data: any) => {
  renderInventory(data, props.theme)
}

// 点击事件
const handleClick = () => {
  emit('item-use', { source: 'inventory' })
}

// 生命周期
onMounted(() => {
  watch(() => props.gameData, () => {
    renderInventory(props.gameData, props.theme)
  }, { immediate: true, deep: true })
  
  watch(() => props.theme, () => {
    renderInventory(props.gameData, props.theme)
  })
})

defineExpose({ updateInventory })
</script>
```

现在想象一下，我们有4个这样的组件（背包、技能、装备、任务），每个都有150-200行相似的代码。重复度高达80%！这就是我们要解决的问题。

## 💡 方案一：基础组件抽象（BaseComponent） ##

第一个想法是创建一个基础游戏UI组件，把所有公共逻辑都放进去：

```vue
<!-- BaseGameUIComponent.vue -->
<template>
  <div class="game-ui-panel" @click="handleClick" ref="containerRef">
    <div class="panel-header">
      <h3>{{ config.title }}</h3>
      <button @click="toggleTheme">切换主题</button>
    </div>
    
    <div 
      :class="config.contentClass"
      @drop="handleDrop" 
      @dragover.prevent
      @contextmenu="handleContextMenu"
    >
      <component 
        :is="config.contentComponent" 
        :data="gameData"
        :theme="theme"
        @item-action="handleItemAction"
      />
    </div>
    
    <component 
      :is="config.dialogComponent"
      ref="dialogRef" 
      @confirm="handleInteraction" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { renderUI, applyTheme, syncGameData } from './utils'
import gameAPI from '@/api/game'

interface GameUIConfig {
  type: string
  title: string
  contentClass: string
  contentComponent: any
  dialogComponent: any
  syncFunction: (data: any) => Promise<any>
  needsDragDrop?: boolean
  hasContextMenu?: boolean
}

interface Props {
  gameData: any
  theme: string
  readonly?: boolean
  config: GameUIConfig
}

const props = defineProps<Props>()
const emit = defineEmits(['update', 'item-select', 'item-use'])

const containerRef = ref<HTMLElement>()
const dialogRef = ref()

// UI渲染逻辑
const renderGameUI = (data: any, theme: string) => {
  if (!containerRef.value) return
  
  applyTheme(containerRef.value, theme)
  
  const renderedData = renderUI(props.config.type, data)
  
  return renderedData
}

// 交互处理
const handleInteraction = async (actionData: any) => {
  try {
    dialogRef.value?.setLoading(true)
    
    const result = await props.config.syncFunction(actionData)
    const response = await gameAPI.syncGameData(result)
    
    if (response.success) {
      const updateData: any = {
        type: 'dataSync',
        data: response.data
      }
      
      if (props.config.needsDragDrop) {
        updateData.dragResult = actionData.dragResult
      }
      
      if (!props.readonly) {
        emit('update', updateData)
      }
      
      renderGameUI(response.data, props.theme)
      dialogRef.value?.hide()
    }
  } catch (error) {
    console.error(`${props.config.type}操作失败:`, error)
    dialogRef.value?.setError(error.message)
  }
}

// 拖拽处理
const handleDrop = async (event: DragEvent) => {
  if (!props.config.needsDragDrop) return
  
  event.preventDefault()
  const dragData = event.dataTransfer?.getData('text/plain')
  const dropTarget = event.target as HTMLElement
  
  await handleInteraction({
    type: 'dragDrop',
    dragData,
    dropTarget: dropTarget.dataset
  })
}

// 右键菜单
const handleContextMenu = (event: MouseEvent) => {
  if (!props.config.hasContextMenu) return
  
  event.preventDefault()
  const target = event.target as HTMLElement
  
  emit('item-select', {
    type: 'contextMenu',
    target: target.dataset,
    position: { x: event.clientX, y: event.clientY }
  })
}

const handleClick = () => {
  emit('item-use', { source: props.config.type })
}

const handleItemAction = (action: any) => {
  emit('item-select', action)
}

const toggleTheme = () => {
  const newTheme = props.theme === 'dark' ? 'light' : 'dark'
  emit('update', { type: 'themeChange', theme: newTheme })
}

const updateGameUI = (data: any) => {
  renderGameUI(data, props.theme)
}

onMounted(() => {
  watch(() => props.gameData, () => {
    renderGameUI(props.gameData, props.theme)
  }, { immediate: true, deep: true })
  
  watch(() => props.theme, () => {
    renderGameUI(props.gameData, props.theme)
  })
})

defineExpose({ updateGameUI })
</script>
```

具体的背包组件就变成了这样：

```vue
<!-- InventoryComponent.vue - 使用BaseComponent -->
<template>
  <BaseGameUIComponent 
    :game-data="gameData"
    :theme="theme"
    :readonly="readonly"
    :config="inventoryConfig"
    @update="$emit('update', $event)"
    @item-select="$emit('item-select', $event)"
    @item-use="$emit('item-use', $event)"
  />
</template>

<script setup lang="ts">
import BaseGameUIComponent from './BaseGameUIComponent.vue'
import InventoryGrid from './InventoryGrid.vue'
import InventoryDialog from './InventoryDialog.vue'
import { syncInventoryData } from './api/inventory'

const props = defineProps(['gameData', 'theme', 'readonly'])
const emit = defineEmits(['update', 'item-select', 'item-use'])

const inventoryConfig = {
  type: 'inventory',
  title: '背包',
  contentClass: 'inventory-grid',
  contentComponent: InventoryGrid,
  dialogComponent: InventoryDialog,
  syncFunction: syncInventoryData,
  needsDragDrop: true,
  hasContextMenu: true
}
</script>
```

## 📊 BaseComponent方案分析 ##

### ✅ 优点 ###

- 代码量大幅减少（从200行减少到30行）
- 逻辑高度复用
- 统一维护，修改一处影响所有组件

### ❌ 缺点 ###

- 过度抽象，理解成本高
- 调试困难，错误难以定位
- 组件层级复杂：`具体组件` → `BaseComponent` → `实际逻辑`
- 新手看代码需要跳转多个文件
- 灵活性不足，难以适应特殊需求

### 🎯 适用场景 ###

- 组件逻辑高度统一
- 团队对抽象有共识
- 不需要频繁的个性化定制

## 🔥 方案二：Composable Hook（推荐） ##

Vue 3 的 Composition API 给了我们更好的选择——Composable Hook：

```typescript
// useGameUI.ts
import { ref, watch, onMounted, onUnmounted, type Ref } from 'vue'
import { renderUI, applyTheme, syncGameData } from './utils'
import gameAPI from '@/api/game'

export interface UseGameUIConfig {
  type: string
  title: string
  syncFunction: (data: any) => Promise<any>
  needsDragDrop?: boolean
  hasContextMenu?: boolean
  hasThemeToggle?: boolean
}

export interface UseGameUIReturn {
  containerRef: Ref<HTMLElement | null>
  dialogRef: Ref<any>
  handleInteraction: (actionData: any) => Promise<void>
  handleDragDrop: (event: DragEvent) => Promise<void>
  handleContextMenu: (event: MouseEvent) => void
  handleClick: (gameData: any, emit: any) => void
  updateGameUI: (gameData: any, theme: string) => void
  toggleTheme: (currentTheme: string, emit: any) => void
  bindLifecycle: (props: any, emit: any) => void
}

export function useGameUI(config: UseGameUIConfig): UseGameUIReturn {
  // 状态管理
  const containerRef = ref<HTMLElement | null>(null)
  const dialogRef = ref()
  
  // 当前组件的props和emit引用
  let currentProps: any = null
  let currentEmit: any = null

  /**
   * UI渲染处理
   */
  const renderGameUI = (data: any, theme: string) => {
    if (!containerRef.value) return
    
    try {
      // 应用主题
      applyTheme(containerRef.value, theme)
      
      // 渲染游戏数据
      const renderedData = renderUI(config.type, data)
      
      console.log(`[${config.type}] UI渲染完成:`, renderedData)
      return renderedData
    } catch (error) {
      console.error(`[${config.type}] 渲染错误:`, error)
    }
  }

  /**
   * 游戏交互处理
   */
  const handleInteraction = async (actionData: any): Promise<void> => {
    try {
      console.log(`[${config.type}] 开始处理交互:`, actionData)
      
      dialogRef.value?.setLoading(true)
      
      const result = await config.syncFunction(actionData)
      const response = await gameAPI.syncGameData(result)
      
      if (response.success) {
        // 非只读模式下，通知父组件更新
        if (currentProps && !currentProps.readonly && currentEmit) {
          const updateData: any = {
            type: 'dataSync',
            data: response.data
          }
          
          if (config.needsDragDrop && actionData.dragResult) {
            updateData.dragResult = actionData.dragResult
          }
          
          currentEmit('update', updateData)
        }
        
        renderGameUI(response.data, currentProps?.theme || 'dark')
        dialogRef.value?.hide()
      }
    } catch (error) {
      console.error(`[${config.type}] 交互处理失败:`, error)
      dialogRef.value?.setError(error.message)
    }
  }

  /**
   * 拖拽处理
   */
  const handleDragDrop = async (event: DragEvent): Promise<void> => {
    if (!config.needsDragDrop) return
    
    event.preventDefault()
    const dragData = event.dataTransfer?.getData('text/plain')
    const dropTarget = event.target as HTMLElement
    
    await handleInteraction({
      type: 'dragDrop',
      dragData,
      dropTarget: dropTarget.dataset,
      timestamp: Date.now()
    })
  }

  /**
   * 右键菜单处理
   */
  const handleContextMenu = (event: MouseEvent) => {
    if (!config.hasContextMenu || !currentEmit) return
    
    event.preventDefault()
    const target = event.target as HTMLElement
    
    currentEmit('item-select', {
      type: 'contextMenu',
      target: target.dataset,
      position: { x: event.clientX, y: event.clientY }
    })
  }

  /**
   * 点击事件处理
   */
  const handleClick = (gameData: any, emit: any) => {
    emit('item-use', { 
      source: config.type,
      data: gameData 
    })
  }

  /**
   * 主题切换
   */
  const toggleTheme = (currentTheme: string, emit: any) => {
    if (!config.hasThemeToggle) return
    
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
    emit('update', { 
      type: 'themeChange', 
      theme: newTheme 
    })
  }

  /**
   * 外部更新游戏UI
   */
  const updateGameUI = (gameData: any, theme: string) => {
    renderGameUI(gameData, theme)
  }

  /**
   * 绑定生命周期和响应式监听
   */
  const bindLifecycle = (props: any, emit: any) => {
    currentProps = props
    currentEmit = emit

    onMounted(() => {
      // 监听游戏数据变化
      watch(() => props.gameData, () => {
        renderGameUI(props.gameData, props.theme)
      }, { immediate: true, deep: true })

      // 监听主题变化
      watch(() => props.theme, () => {
        renderGameUI(props.gameData, props.theme)
      })

      // 监听特殊触发器（如快捷键）
      watch(() => props.gameData?.hotkey, () => {
        if (props.readonly) return
        
        const actionData = {
          type: 'hotkey',
          key: props.gameData.hotkey,
          component: config.type
        }
        
        dialogRef.value?.show(actionData)
      })
    })

    onUnmounted(() => {
      if (containerRef.value) {
        // 清理主题样式
        containerRef.value.className = ''
      }
      currentProps = null
      currentEmit = null
    })
  }

  return {
    containerRef,
    dialogRef,
    handleInteraction,
    handleDragDrop,
    handleContextMenu,
    handleClick,
    updateGameUI,
    toggleTheme,
    bindLifecycle
  }
}
```

使用Hook的背包组件变成这样：

```vue
<!-- InventoryComponent.vue - 使用Hook -->
<template>
  <div class="inventory-panel" @click="handleClick(gameData, $emit)" ref="containerRef">
    <div class="panel-header">
      <h3>背包</h3>
      <button 
        v-if="!readonly" 
        @click="toggleTheme(theme, $emit)"
      >
        切换主题
      </button>
    </div>
    
    <div 
      class="inventory-grid"
      @drop="handleDragDrop"
      @dragover.prevent
      @contextmenu="handleContextMenu"
    >
      <div 
        v-for="slot in inventorySlots" 
        :key="slot.id"
        class="inventory-slot"
        :class="{ 'has-item': slot.item }"
        :data-slot-id="slot.id"
        draggable="true"
        @dragstart="handleDragStart"
        @click="handleSlotClick(slot)"
      >
        <img v-if="slot.item" :src="slot.item.icon" :alt="slot.item.name" />
        <span v-if="slot.item?.count > 1" class="item-count">{{ slot.item.count }}</span>
      </div>
    </div>
    
    <InventoryDialog 
      ref="dialogRef"
      @confirm="handleInteraction"
    />
  </div>
</template>

<script setup lang="ts">
import InventoryDialog from './InventoryDialog.vue'
import { syncInventoryData } from './api/inventory'
import { useGameUI } from '../composables/useGameUI'
import { ref, computed } from 'vue'

// Props定义
interface Props {
  gameData: any
  theme: string
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false
})

const emit = defineEmits(['update', 'item-select', 'item-use'])

// 使用Hook
const {
  containerRef,
  dialogRef,
  handleInteraction,
  handleDragDrop,
  handleContextMenu,
  handleClick,
  updateGameUI,
  toggleTheme,
  bindLifecycle
} = useGameUI({
  type: 'inventory',
  title: '背包',
  syncFunction: syncInventoryData,
  needsDragDrop: true,
  hasContextMenu: true,
  hasThemeToggle: true
})

// 计算背包槽位
const inventorySlots = computed(() => {
  return props.gameData?.slots || []
})

// 拖拽开始
const handleDragStart = (event: DragEvent) => {
  const slotElement = event.target as HTMLElement
  const slotId = slotElement.dataset.slotId
  event.dataTransfer?.setData('text/plain', slotId || '')
}

// 槽位点击
const handleSlotClick = (slot: any) => {
  if (slot.item) {
    emit('item-select', { 
      item: slot.item,
      slot: slot.id 
    })
  }
}

// 绑定生命周期
bindLifecycle(props, emit)

// 暴露方法
defineExpose({
  updateGameUI: (data: any) => updateGameUI(data, props.theme)
})
</script>

<style scoped>
.inventory-panel {
  width: 100%;
  height: 100%;
  border: 2px solid #333;
  border-radius: 8px;
  background: var(--panel-bg);
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
  padding: 16px;
}

.inventory-slot {
  aspect-ratio: 1;
  border: 1px solid #666;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  background: var(--slot-bg);
}

.inventory-slot.has-item {
  background: var(--slot-active-bg);
}

.item-count {
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
</style>
```

技能组件的使用：

```vue
<!-- SkillComponent.vue - 使用相同的Hook -->
<template>
  <div class="skill-panel" @click="handleClick(gameData, $emit)" ref="containerRef">
    <div class="panel-header">
      <h3>技能树</h3>
      <button @click="toggleTheme(theme, $emit)">切换主题</button>
    </div>
    
    <div class="skill-tree" @contextmenu="handleContextMenu">
      <div 
        v-for="skill in skillNodes" 
        :key="skill.id"
        class="skill-node"
        :class="{ 
          'learned': skill.learned, 
          'available': skill.canLearn,
          'locked': !skill.available 
        }"
        :data-skill-id="skill.id"
        @click="handleSkillClick(skill)"
      >
        <img :src="skill.icon" :alt="skill.name" />
        <div v-if="skill.level > 0" class="skill-level">{{ skill.level }}</div>
        <div v-if="skill.cooldown > 0" class="cooldown-overlay">
          {{ skill.cooldown }}s
        </div>
      </div>
    </div>
    
    <SkillDialog 
      ref="dialogRef"
      @confirm="handleInteraction"
    />
  </div>
</template>

<script setup lang="ts">
import SkillDialog from './SkillDialog.vue'
import { syncSkillData } from './api/skill'
import { useGameUI } from '../composables/useGameUI'
import { computed } from 'vue'

const props = defineProps(['gameData', 'theme', 'readonly'])
const emit = defineEmits(['update', 'item-select', 'item-use'])

// 配置不同，使用相同Hook
const {
  containerRef,
  dialogRef,
  handleInteraction,
  handleContextMenu,
  handleClick,
  updateGameUI,
  toggleTheme,
  bindLifecycle
} = useGameUI({
  type: 'skill',
  title: '技能树',
  syncFunction: syncSkillData,
  needsDragDrop: false,  // 技能不需要拖拽
  hasContextMenu: true,
  hasThemeToggle: true
})

const skillNodes = computed(() => {
  return props.gameData?.skills || []
})

const handleSkillClick = (skill: any) => {
  if (skill.canLearn || skill.learned) {
    emit('item-select', { 
      skill: skill,
      action: skill.learned ? 'use' : 'learn'
    })
  }
}

bindLifecycle(props, emit)
defineExpose({ updateGameUI: (data: any) => updateGameUI(data, props.theme) })
</script>
```

## 📊 Hook方案分析 ##

### ✅ 优点 ###

- 逻辑复用，组件结构清晰
- 易于理解和调试（错误直接定位到组件）
- 渐进式重构（可与原组件并存）
- 类型安全，完整的TypeScript支持
- 符合Vue 3设计理念
- 高度灵活，易于扩展

### ❌ 缺点 ###

- 需要团队了解Composition API
- Hook设计需要一定经验
- 初期搭建比直接复制代码复杂

### 🎯 适用场景 ###

- Vue 3项目
- 团队熟悉 Composition API
- 需要逻辑复用但保持组件独立性
- 有一定的个性化需求

## 🛠️ 方案三：部分抽取（务实选择） ##

如果团队对抽象不熟悉，或者项目时间紧张，也可以选择部分抽取的方式：

```typescript
// utils/gameUIUtils.ts
import { ref } from 'vue'
import { renderUI, applyTheme } from './ui'

/**
 * 游戏UI管理工具
 */
export function useGameUICore() {
  const containerRef = ref<HTMLElement | null>(null)

  const renderGameUI = (type: string, data: any, theme: string) => {
    if (!containerRef.value) return
    
    applyTheme(containerRef.value, theme)
    return renderUI(type, data)
  }

  const cleanup = () => {
    if (containerRef.value) {
      containerRef.value.className = ''
    }
  }

  return { containerRef, renderGameUI, cleanup }
}

/**
 * 游戏数据同步通用逻辑
 */
export async function handleGameDataSync(
  actionData: any,
  syncFn: Function,
  onSuccess: Function,
  onError?: Function
) {
  try {
    const result = await syncFn(actionData)
    const response = await gameAPI.syncGameData(result)
    
    if (response.success) {
      onSuccess(response.data)
    }
  } catch (error) {
    console.error('游戏数据同步失败:', error)
    onError?.(error)
  }
}

/**
 * 拖拽处理工具
 */
export function useDragDrop(onDrop: Function) {
  const handleDragStart = (event: DragEvent) => {
    const element = event.target as HTMLElement
    const dragData = element.dataset
    event.dataTransfer?.setData('text/plain', JSON.stringify(dragData))
  }

  const handleDrop = async (event: DragEvent) => {
    event.preventDefault()
    const dragData = event.dataTransfer?.getData('text/plain')
    const dropTarget = event.target as HTMLElement
    
    if (dragData) {
      const parsedData = JSON.parse(dragData)
      await onDrop(parsedData, dropTarget.dataset)
    }
  }

  return { handleDragStart, handleDrop }
}
```

组件中使用：

```vue
<!-- InventoryComponent.vue - 部分抽取版本 -->
<template>
  <div class="inventory-panel" @click="handleClick" ref="containerRef">
    <div class="panel-header">
      <h3>背包</h3>
      <button @click="toggleTheme">切换主题</button>
    </div>
    
    <div 
      class="inventory-grid"
      @drop="handleDrop"
      @dragover.prevent
    >
      <div 
        v-for="slot in inventorySlots" 
        :key="slot.id"
        class="inventory-slot"
        :class="{ 'has-item': slot.item }"
        :data-slot-id="slot.id"
        :data-item-id="slot.item?.id"
        draggable="true"
        @dragstart="handleDragStart"
        @click="handleSlotClick(slot)"
      >
        <img v-if="slot.item" :src="slot.item.icon" :alt="slot.item.name" />
        <span v-if="slot.item?.count > 1" class="item-count">{{ slot.item.count }}</span>
      </div>
    </div>
    
    <InventoryDialog ref="dialogRef" @confirm="handleInventoryAction" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import InventoryDialog from './InventoryDialog.vue'
import { syncInventoryData } from './api/inventory'
import { 
  useGameUICore, 
  handleGameDataSync, 
  useDragDrop 
} from '@/utils/gameUIUtils'

const props = defineProps(['gameData', 'theme', 'readonly'])
const emit = defineEmits(['update', 'item-select', 'item-use'])

// 使用UI核心工具
const { containerRef, renderGameUI, cleanup } = useGameUICore()
const dialogRef = ref()

// 计算背包数据
const inventorySlots = computed(() => {
  return props.gameData?.slots || []
})

// 使用拖拽工具
const { handleDragStart, handleDrop } = useDragDrop(async (dragData: any, dropData: any) => {
  // 背包特定的拖拽逻辑
  await handleGameDataSync(
    {
      type: 'moveItem',
      fromSlot: dragData.slotId,
      toSlot: dropData.slotId,
      itemId: dragData.itemId
    },
    syncInventoryData,
    (result) => {
      // 成功回调 - 这部分仍然是组件特定的
      if (!props.readonly) {
        emit('update', {
          type: 'itemMoved',
          data: result
        })
      }
      
      renderGameUI('inventory', result, props.theme)
      dialogRef.value?.hide()
    },
    (error) => {
      dialogRef.value?.setError(error.message)
    }
  )
})

// 背包操作处理（仍需要一些特定逻辑）
const handleInventoryAction = async (actionData: any) => {
  await handleGameDataSync(
    {
      type: 'inventoryAction',
      action: actionData.action,
      slotId: actionData.slotId,
      quantity: actionData.quantity || 1 // 背包特有参数
    },
    syncInventoryData,
    (result) => {
      if (!props.readonly) {
        emit('update', {
          type: 'inventoryUpdate',
          data: result
        })
      }
      
      renderGameUI('inventory', result, props.theme)
      dialogRef.value?.hide()
    }
  )
}

const handleClick = () => {
  emit('item-use', { source: 'inventory' })
}

const handleSlotClick = (slot: any) => {
  if (slot.item) {
    emit('item-select', { item: slot.item, slot: slot.id })
  }
}

const toggleTheme = () => {
  const newTheme = props.theme === 'dark' ? 'light' : 'dark'
  emit('update', { type: 'themeChange', theme: newTheme })
}

const updateInventory = (data: any) => {
  renderGameUI('inventory', data, props.theme)
}

onMounted(() => {
  watch(() => props.gameData, () => {
    renderGameUI('inventory', props.gameData, props.theme)
  }, { immediate: true, deep: true })
  
  watch(() => props.theme, () => {
    renderGameUI('inventory', props.gameData, props.theme)
  })
})

onUnmounted(cleanup)
defineExpose({ updateInventory })
</script>
```

## 📊 部分抽取方案分析 ##

### ✅ 优点 ###

- 实施简单，风险低
- 减少了最核心的重复代码
- 保持组件结构不变
- 团队学习成本低

### ❌ 缺点 ###

- 仍有部分重复代码
- 没有充分利用现代框架特性
- 长期维护成本仍然较高

### 🎯 适用场景 ###

- 技术栈较老或团队经验不足
- 项目时间紧张
- 追求稳妥的渐进式改进

## 📈 三种方案对比总结 ##

| 方案  | 代码减少 |  理解难度  | 调试难度  | 灵活性 |  维护性  |  推荐指数  |
| :-------: | :-------: | :---------: | :-------: | :-------: | :---------: | :---------: |
| BaseComponent | 85% | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Composable Hook | 70% | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 部分抽取 | 40% | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

## 🎯 选择建议 ##

### 选择Hook方案 ###

- ✅ 使用Vue 3
- ✅ 团队熟悉Composition API
- ✅ 需要长期维护
- ✅ 组件间有个性化差异

### 选择BaseComponent方案 ###

- ✅ 组件逻辑高度一致
- ✅ 团队对抽象有共识
- ✅ 不需要频繁定制

### 选择部分抽取方案 ###

- ✅ 团队技术栈保守
- ✅ 项目时间紧张
- ✅ 追求稳妥实施

## 💡 实施建议 ##

### 渐进式迁移 ###

```bash
# 推荐的迁移策略
Phase 1: 创建Hook版本，与原版本并存
Phase 2: 在新功能中使用Hook版本
Phase 3: 逐步迁移现有组件
Phase 4: 移除原版本
```

### 团队培训 ###

- 组织Composition API培训
- 制定Hook设计规范
- 建立代码评审机制

### 监控效果 ###

- 统计代码行数减少
- 监控bug修复时间
- 收集开发者反馈

## 🔚 总结 ##

游戏UI组件重构没有银弹，选择合适的方案比追求完美更重要。Hook方案在大多数Vue 3游戏项目中都是不错的选择，它平衡了代码复用、可维护性和灵活性。

记住，好的抽象应该是简化而不是复杂化，清晰而不是晦涩。在实际项目中，根据团队情况和项目需求，选择最适合的方案才是明智之举。

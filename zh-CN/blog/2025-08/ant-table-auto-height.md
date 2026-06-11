---
lastUpdated: true
commentabled: true
recommended: true
title: Ant Design Vue Table 高度自适应
description: Ant Design Vue Table 高度自适应 
date: 2025-08-08 13:45:00 
pageClass: blog-page-class
cover: /covers/antdv.svg
---

[text](https://cloud.tencent.com/developer/article/2383229)

[text](https://blog.csdn.net/talentT/article/details/137146964)

[text](https://blog.csdn.net/qq_57015835/article/details/146564287)

[text](https://blog.csdn.net/qq_57015835/article/details/146564287)

## 不包含固定列 ##

```scss
.auto-scroll-table .ant-table-body {
  overflow-y: auto !important;
}
```

```vue
<a-table
        :columns="myData.columns"
        defaultExpandAllRows
        :loading
        ref="tableRef"
        :key="tableKey"
        class="auto-scroll-table"
        :scroll="{ x: 'max-content', y: 'calc(100vh - 230px)' }"
        :locale="{ emptyText: '未找到符合条件的组织' }"
        :dataSource="myData.dataSource"
        @expandedRowsChange="handleRowExpanded"
        bordered
        rowKey="organizationId"
        size="small"
        :pagination="false"></a-table>
```

## 包含固定列 ##

通过比较外部容器和表格的高度值，进行判断是否需要出现滚动条。

同时，需要在表格折叠的同时刷新高度。


```ts
// @ts-ignore
import { debounce } from 'lodash-es'
import {
  onBeforeUnmount,
  onMounted,
  ref,
  toRaw,
  unref,
  type ComponentPublicInstance,
  type Ref,
  nextTick
} from 'vue'

type TableElementRef = Ref<HTMLElement | ComponentPublicInstance | null>
type TableContainerElementRef = Ref<HTMLElement | null>

// 安全获取表格DOM元素
function resolveTableElement(
  elRef: HTMLElement | ComponentPublicInstance | null
): HTMLElement | null {
  if (!elRef) return null

  // 处理Vue组件实例
  if (typeof elRef === 'object' && '$el' in elRef) {
    const component = elRef as ComponentPublicInstance

    // 针对Ant Design Vue Table组件获取内部表格容器
    const tableContainer = component.$el.querySelector?.('.ant-table-container')
    if (tableContainer) return tableContainer as HTMLElement

    return component.$el as HTMLElement
  }

  return elRef as HTMLElement
}

export function useTableAutoHeight(
  tableRef: TableElementRef,
  tableContainerRef: TableContainerElementRef
) {
  const tableScroll = ref<{ x?: string | 'max-content'; y?: string }>({})

  const resetScroll = () => {
    tableScroll.value = { x: 'max-content', y: undefined }
  }

  let resizeObserver: ResizeObserver | null = null

  // 精确获取表格滚动容器
  const getScrollContainer = (): HTMLElement | null => {
    const tableEl = resolveTableElement(toRaw(unref(tableRef)))
    if (!tableEl) return null

    // 尝试查找 Ant Design Vue 的滚动容器
    const scrollContainer =
      tableEl.querySelector?.('.ant-table-tbody') ||
      tableEl.querySelector?.('.ant-table-content')

    return scrollContainer as HTMLElement | null
  }

  // 检查是否显示垂直滚动条
  const hasVerticalScrollbar = (container: HTMLElement): boolean => {
    if (!container) return false
    // 计算滚动条宽度差
    const scrollbarVisible = container.scrollHeight > container.clientHeight
    const scrollbarWidth = scrollbarVisible
      ? container.offsetWidth - container.clientWidth
      : 0

    // 确认是否有内容溢出
    const contentOverflow =
      container.scrollHeight > container.clientHeight + scrollbarWidth

    return contentOverflow
  }

  // 计算表格动态高度
  function calculateTableHeight() {
    const container = getScrollContainer()
    if (!container) return
    resetScroll()
    // 获取容器位置
    const containerRect = tableContainerRef.value!.getBoundingClientRect()
    const windowHeight = document.documentElement.clientHeight
    const bottomMargin = 80 // 底部安全边距

    // 计算可视区域可用高度
    const maxVisibleHeight = tableContainerRef.value!.clientHeight
    const maxVisibleWidth = tableContainerRef.value!.clientWidth
    // 检查是否需要滚动条
    // hasVerticalScrollbar(container)
    if (container.clientHeight > maxVisibleHeight) {
      tableScroll.value = {
        x: 'max-content',
        y: `calc(100vh - 230px)`
      }
    } else {
      // 不需要滚动条时，不设置y属性
      tableScroll.value = { x: 'max-content', y: undefined }
    }
  }

  // 防抖计算函数
  const debouncedCalc = debounce(
    () => {
      calculateTableHeight()
    },
    200,
    { leading: true }
  )

  // 初始化并设置监听
  const initHeightCalculation = () => {
    // 确保DOM加载完成
    nextTick(() => {
      debouncedCalc()

      // // 使用ResizeObserver监听表格容器变化
      // const container = resolveTableElement(toRaw(unref(tableRef)))
      // if (container) {
      //   if (resizeObserver) resizeObserver.disconnect()

      //   resizeObserver = new ResizeObserver(debouncedCalc)
      //   resizeObserver.observe(container)

      //   // 监听滚动容器变化
      //   const scrollContainer = container.querySelector('.ant-table-body')
      //   if (scrollContainer) {
      //     resizeObserver.observe(scrollContainer)
      //   }
      // }
    })
  }

  // 组件挂载时设置监听
  onMounted(() => {
    initHeightCalculation()
    window.addEventListener('resize', debouncedCalc)
  })

  // 组件卸载时清理
  onBeforeUnmount(() => {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
    window.removeEventListener('resize', debouncedCalc)
    debouncedCalc.cancel()
  })

  // 提供手动刷新方法
  return {
    scroll: tableScroll,
    recalculate: debouncedCalc
  }
}
// import { debounce } from 'lodash-es'
// import { markRaw, nextTick, onBeforeUnmount, onMounted, ref, toRaw, unref, type Ref } from 'vue'

// export function useTableHeight(tableRef: Ref<HTMLElement | null>) {
//   const tableSrcoll = ref<{
//     x?: string
//     y?: string
//   }>()

//    const getRawElement = () => {
//      if (!tableRef.value) return null
//      return toRaw(tableRef.value) // 返回原始 DOM 元素
//    }

//   // 计算表格动态高度
//   function calculateTableHeight() {
//     if (tableRef.value) {
//       console.log('tableRef.value', unref(tableRef.value))
//       const tableEl = unref(tableRef.value)
//       console.log('tableEl', tableEl)
//       const bodyEl = tableEl.querySelector('.ant-table')
//       console.log('bodyEl', bodyEl)
//       if (bodyEl) {
//         console.log(bodyEl.scrollHeight, bodyEl.clientHeight)
//         if (bodyEl.scrollHeight > bodyEl.clientHeight) {
//           // 内容超出时设置固定高度（触发滚动条）
//           tableSrcoll.value = { x: 'max-content', y: 'calc(100vh - 250px)' }
//         } else {
//           tableSrcoll.value = { x: 'max-content' }
//         }
//       }
//     }
//   }
//   // 初始化和监听 resize 事件，这里使用防抖提高性能
//   onMounted(() => {
//     nextTick(() => {
//       calculateTableHeight()
//     })
//     window.addEventListener('resize', debounce(calculateTableHeight, 200))
//   })
//   // 移除监听器
//   onBeforeUnmount(() => {
//     window.removeEventListener('resize', debounce(calculateTableHeight, 300))
//   })
//   return {
//     tableSrcoll
//   }
// }

// // useTableAutoHeight.ts
// import {
//   type Ref,
//   ref,
//   onMounted,
//   onUnmounted,
//   nextTick,
//   watch,
//   type ComponentPublicInstance
// } from 'vue'

// interface TableAutoHeightOptions {
//   extraHeight?: number // 额外需要减去的高度（如表单、按钮等）
//   minHeight?: number // 最小高度
//   maxHeight?: number // 最大高度
//   debounceTime?: number // 防抖时间(ms)
//   observeResize?: boolean // 是否监听窗口变化
//   observeElements?: HTMLElement[] // 需要监听的其他元素
// }

// interface TableAutoHeightReturn {
//   scroll: Ref<{ x?: string | number | 'max-content'; y?: string|number }>
//   refreshHeight: () => void // 手动刷新高度的函数
// }

// export default function useTableAutoHeight(
//   tableRef: Ref<ComponentPublicInstance | null>,
//   options: TableAutoHeightOptions = {}
// ): TableAutoHeightReturn {
//   // 合并默认选项
//   const {
//     extraHeight = 0,
//     minHeight = 100,
//     maxHeight = Infinity,
//     debounceTime = 100,
//     observeResize = true,
//     observeElements = []
//   } = options

//   const tableScroll = ref<{ x?: string | 'max-content'; y?: string }>({})

//   // 安全获取表格容器元素
//   const getTableContainer = (): HTMLElement | null => {
//     if (!tableRef.value) return null

//     try {
//       // 获取表格根元素
//         const tableRoot = tableRef.value.$el as HTMLElement
//         console.log('tableRoot', tableRoot)
//       if (!tableRoot) return null

//       // 获取表格容器
//         const container = tableRoot.querySelector(
//           '.ant-table-container'
//         ) as HTMLElement
//         console.log('container', container)
//         return container
//     } catch (error) {
//       console.error('获取表格容器失败:', error)
//       return null
//     }
//   }

//   // 计算表格高度
//   const calculateHeight = (): void => {
//     const container = getTableContainer()
//       if (!container) {
//         console.log('not found containere')
//         return
//     }

//     try {
//       // 获取表格容器的高度
//       const containerHeight = container.clientHeight

//       // 计算表格内容区域高度
//       let contentHeight = containerHeight

//       // 减去表头高度
//       const header = container.querySelector('.ant-table-thead') as HTMLElement
//       if (header) {
//         contentHeight -= header.offsetHeight
//       }

//       // 减去分页高度（如果存在）
//       const pagination = container.querySelector(
//         '.ant-pagination'
//       ) as HTMLElement
//       if (pagination) {
//         contentHeight -= pagination.offsetHeight
//       }

//       // 减去额外高度
//       contentHeight -= extraHeight

//       // 应用最小和最大高度限制
//       let finalHeight = Math.max(minHeight, contentHeight)
//       finalHeight = Math.min(maxHeight, finalHeight)

//       // 获取表格主体
//       const tableBody =
//         container.querySelector?.('.ant-table-body') ||
//         (container.querySelector?.('.ant-table-content') as HTMLElement)
// console.log(tableBody.scrollHeight, contentHeight)
//       // 只有当内容高度大于可用高度时才设置滚动条
//       if (tableBody && tableBody.scrollHeight > contentHeight) {
//         tableScroll.value.y = `${contentHeight}px`
//       } else {
//         tableScroll.value.y = undefined
//       }
//     } catch (error) {
//       console.error('计算表格高度出错:', error)
//     }
//   }

//   // 防抖函数
//   let debounceTimer: ReturnType<typeof setTimeout> | null = null
//   const debouncedCalculate = (): void => {
//     if (debounceTimer) {
//       clearTimeout(debounceTimer)
//     }

//     debounceTimer = setTimeout(() => {
//       nextTick(calculateHeight)
//     }, debounceTime)
//   }

//   // 监听器引用，用于卸载时清理
//   let resizeObserver: ResizeObserver | null = null
//   let mutationObserver: MutationObserver | null = null

//   // 初始化监听
//   onMounted(() => {
//     // 初始计算高度
//     debouncedCalculate()

//     // 监听窗口大小变化
//     if (observeResize) {
//       window.addEventListener('resize', debouncedCalculate)
//     }

//     // 监听容器大小变化
//     const container = getTableContainer()
//     if (container) {
//       resizeObserver = new ResizeObserver(debouncedCalculate)
//       resizeObserver.observe(container)

//       // 监听固定列容器变化
//       const fixedColumns = container.querySelectorAll('.ant-table-fixed')
//       fixedColumns.forEach(fixedCol => {
//         resizeObserver?.observe(fixedCol as HTMLElement)
//       })
//     }

//     // 监听其他元素变化
//     if (observeElements.length > 0 || container) {
//       mutationObserver = new MutationObserver(debouncedCalculate)

//       // 观察表格容器变化
//       if (container) {
//         mutationObserver.observe(container, {
//           childList: true,
//           subtree: true
//         })
//       }

//       // 观察其他指定元素
//       observeElements.forEach(el => {
//         if (el) {
//           mutationObserver?.observe(el, {
//             attributes: true,
//             childList: true,
//             subtree: true
//           })
//         }
//       })
//     }
//   })

//   // 组件卸载时清理
//   onUnmounted(() => {
//     if (observeResize) {
//       window.removeEventListener('resize', debouncedCalculate)
//     }

//     if (debounceTimer) {
//       clearTimeout(debounceTimer)
//     }

//     resizeObserver?.disconnect()
//     mutationObserver?.disconnect()
//   })

//   // 返回 scroll 对象和刷新函数
//   return {
//     scroll: tableScroll,
//     refreshHeight: debouncedCalculate
//   }
// }
```


```vue
<div ref="tableContainerRef" style="height:calc(100vh - 180px);overflow: hidden; ">
      <a-table
        :columns="myData.columns"
        defaultExpandAllRows
        :loading
        ref="tableRef"
        :key="tableKey"
        class="auto-scroll-table"
        :scroll="scroll"
        :locale="{ emptyText: '未找到符合条件的组织' }"
        :dataSource="myData.dataSource"
        @expandedRowsChange="handleRowExpanded"
        bordered
        rowKey="organizationId"
        size="small"
        :pagination="false"
      >
      </a-table>
    </div>
```

```ts
const handleRowExpanded = (expandedRows: []) => {
  nextTick(() => {
      recalculate()
      })
}

const tableRef = ref()
const tableContainerRef = ref()

const { scroll , recalculate} = useTableAutoHeight(tableRef, tableContainerRef)
```

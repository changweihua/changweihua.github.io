---
lastUpdated: true
commentabled: true
recommended: true
title: React Native 主题配置终极指南
description: React Native 主题配置终极指南
date: 2025-12-30 11:00:00 
pageClass: blog-page-class
cover: /covers/reactive.svg
---

本指南详细介绍如何在 Expo + React Native 项目中使用 NativeWind 配置深色/浅色模式主题系统。
目录

## 技术栈 ##

1. 安装依赖
2. 配置文件设置
3. 颜色系统设计
4. 主题管理实现
5. 根组件集成
6. UI组件应用
7. 最佳实践
8. 常见问题


## 技术栈 ##

- Expo - React Native 开发框架
- NativeWind v4 - Tailwind CSS for React Native
- React Native MMKV - 高性能持久化存储
- React Navigation - 导航库（可选）
- TypeScript - 类型安全

## 安装依赖 ##

### 安装核心依赖 ###

```bash
# 使用 Expo 安装命令确保版本兼容
npx expo install nativewind react-native-mmkv

# 安装开发依赖
npm install --save-dev tailwindcss
```

### 使用 React Navigation ###

```bash
npx expo install @react-navigation/native react-native-safe-area-context react-native-screens
```

### 完整依赖列表 ###

在 `package.json` 中确认以下依赖：

```json
{
  "dependencies": {
    "nativewind": "^4.1.21",
    "react-native-mmkv": "~3.1.0",
    "expo": "~53.0.12",
    "react-native": "0.79.4"
  },
  "devDependencies": {
    "tailwindcss": "3.4.4"
  }
}
```

## 配置文件设置 ##

### Tailwind 配置 (`tailwind.config.js`) ###

创建或修改 `tailwind.config.js`：

```javascript:tailwind.config.js
const colors = require('./src/components/ui/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // 指定要扫描的文件路径
  content: ['./src/**/*.{js,jsx,ts,tsx}'],

  // 使用 NativeWind preset
  presets: [require('nativewind/preset')],

  // 关键配置：使用 class 模式启用深色模式
  darkMode: 'class',

  theme: {
    extend: {
      // 自定义字体
      fontFamily: {
        inter: ['Inter'],
      },
      // 自定义颜色（从单独文件导入）
      colors,
    },
  },
  plugins: [],
};
```

**关键点**：

- `darkMode: 'class'` - 使用 CSS class 切换模式（NativeWind 必需）
- `content` - 指定所有使用 Tailwind 的文件路径
- `presets` - 使用 NativeWind preset

### Babel 配置 (babel.config.js) ###

```javascript:babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // NativeWind 必需的配置
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      // 路径别名配置（可选但推荐）
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
          },
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
          ],
        },
      ],
      // 如果使用动画，放在最后
      'react-native-reanimated/plugin',
    ],
  };
};
```

### 全局 CSS (`global.css`) ###

在项目根目录创建 `global.css`：

```css:global.css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### TypeScript 类型定义 (`nativewind-env.d.ts`)

在项目根目录创建类型定义：

```typescript:nativewind-env.d.ts
/// <reference types="nativewind/types" />
```

## 颜色系统设计 ##

### 创建颜色配置文件 ###

在 `src/components/ui/colors.js` 中定义颜色系统：

```javascript
module.exports = {
  white: '#ffffff',
  black: '#000000',

  // 深色模式主色调
  charcoal: {
    50: '#F2F2F2',
    100: '#E5E5E5',
    200: '#C9C9C9',
    300: '#B0B0B0',
    400: '#969696',
    500: '#7D7D7D',
    600: '#616161',
    700: '#474747',
    800: '#383838',
    850: '#2E2E2E', // 自定义深色背景
    900: '#1E1E1E',
    950: '#121212', // 深色模式主背景
  },

  // 中性色
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#F0EFEE',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // 主题色
  primary: {
    50: '#FFE2CC',
    100: '#FFC499',
    200: '#FFA766',
    300: '#FF984C',
    400: '#FF8933',
    500: '#FF7B1A',
    600: '#FF6C00',
    700: '#E56100',
    800: '#CC5600',
    900: '#B24C00',
  },

  // 语义化颜色
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  danger: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
};
```

**设计建议**：

- 使用语义化的颜色名称
- 为深色模式提供专用的颜色变体
- 保持颜色的对比度符合可访问性标准

## 主题管理实现 ##

### 存储配置 (`src/lib/storage.tsx`) ###

创建 MMKV 存储实例：

```typescript
import { MMKV } from 'react-native-mmkv';

// 创建全局存储实例
export const storage = new MMKV();

// 辅助函数
export function getItem<T>(key: string): T | null {
  const value = storage.getString(key);
  return value ? JSON.parse(value) || null : null;
}

export async function setItem<T>(key: string, value: T) {
  storage.set(key, JSON.stringify(value));
}

export async function removeItem(key: string) {
  storage.delete(key);
}
```

### 主题选择 Hook (`src/lib/hooks/use-selected-theme.tsx`) ###

这是核心的主题管理 Hook：

```typescript
import { colorScheme, useColorScheme } from 'nativewind';
import React from 'react';
import { useMMKVString } from 'react-native-mmkv';

import { storage } from '../storage';

const SELECTED_THEME = 'SELECTED_THEME';

// 主题类型定义
export type ColorSchemeType = 'light' | 'dark' | 'system';

/**
 * 主题选择 Hook
 *
 * 使用场景：仅在主题选择器组件中使用
 * 样式应用：使用 useColorScheme from nativewind 获取当前主题
 *
 * @returns {object} - selectedTheme: 当前选择的主题, setSelectedTheme: 设置主题的函数
 */
export const useSelectedTheme = () => {
  const { colorScheme: _color, setColorScheme } = useColorScheme();
  const [theme, _setTheme] = useMMKVString(SELECTED_THEME, storage);

  // 设置主题并持久化
  const setSelectedTheme = React.useCallback(
    (t: ColorSchemeType) => {
      setColorScheme(t); // 更新 NativeWind 主题
      _setTheme(t); // 持久化到 MMKV
    },
    [setColorScheme, _setTheme]
  );

  // 默认使用系统主题
  const selectedTheme = (theme ?? 'system') as ColorSchemeType;

  return { selectedTheme, setSelectedTheme } as const;
};

/**
 * 在应用启动时加载已保存的主题
 * 必须在 React 组件树外部调用（如 _layout.tsx 顶部）
 */
export const loadSelectedTheme = () => {
  const theme = storage.getString(SELECTED_THEME);
  if (theme !== undefined) {
    colorScheme.set(theme as ColorSchemeType);
  }
};
```

**关键功能**：

- 支持三种模式：`light`、`dark`、`system`
- 使用 `MMKV` 持久化用户选择
- `system` 模式自动跟随系统设置

### React Navigation 主题配置 (`src/lib/use-theme-config.tsx`) ###

如果使用 React Navigation，创建导航主题配置：

```typescript
import type { Theme } from '@react-navigation/native';
import {
  DarkTheme as _DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import { useColorScheme } from 'nativewind';

import colors from '@/components/ui/colors';

// 自定义深色主题
const DarkTheme: Theme = {
  ..._DarkTheme,
  colors: {
    ..._DarkTheme.colors,
    primary: colors.primary[200], // 深色模式下使用较浅的主题色
    background: colors.charcoal[950], // 深黑色背景
    text: colors.charcoal[100], // 浅色文字
    border: colors.charcoal[500], // 边框颜色
    card: colors.charcoal[850], // 卡片背景
  },
};

// 自定义浅色主题
const LightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary[400], // 浅色模式下使用较深的主题色
    background: colors.white, // 白色背景
  },
};

/**
 * 获取当前主题配置
 * 用于 React Navigation 的 ThemeProvider
 */
export function useThemeConfig() {
  const { colorScheme } = useColorScheme();

  if (colorScheme === 'dark') return DarkTheme;

  return LightTheme;
}
```

## 根组件集成 ##

### 根布局配置 (`src/app/_layout.tsx`) ###

在应用的根组件中集成主题系统：

```typescript
// 导入全局 CSS（必须在最顶部）
import '../../global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { loadSelectedTheme } from '@/lib';
import { useThemeConfig } from '@/lib/use-theme-config';

// ⚠️ 关键：在组件树外加载主题
loadSelectedTheme();

// 配置启动屏
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

export default function RootLayout() {
  return (
    <Providers>
      <Stack>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        {/* 其他路由 */}
      </Stack>
    </Providers>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  const theme = useThemeConfig();

  return (
    <GestureHandlerRootView
      style={styles.container}
      // ⚠️ 关键：根据主题添加 dark class
      className={theme.dark ? `dark` : undefined}
    >
      <KeyboardProvider>
        {/* React Navigation 主题提供者 */}
        <ThemeProvider value={theme}>
          <BottomSheetModalProvider>
            {children}
          </BottomSheetModalProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

**关键步骤**：

1. `导入 global.css` - 必须在最顶部
2. `调用 loadSelectedTheme()` - 在组件外加载保存的主题
3. `添加 dark className` - 在根容器根据主题动态添加
4. `ThemeProvider` - 为 React Navigation 提供主题

### 状态栏配置 (`src/components/ui/focus-aware-status-bar.tsx`) ###

创建响应主题的状态栏组件：

```typescript
import { useIsFocused } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Platform } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';

type Props = { hidden?: boolean };

export const FocusAwareStatusBar = ({ hidden = false }: Props) => {
  const isFocused = useIsFocused();
  const { colorScheme } = useColorScheme();

  if (Platform.OS === 'web') return null;

  return isFocused ? (
    <SystemBars
      // 浅色模式用深色图标，深色模式用浅色图标
      style={colorScheme === 'light' ? 'dark' : 'light'}
      hidden={hidden}
    />
  ) : null;
};
```

## UI组件应用 ##

### 基础文本组件 (`src/components/ui/text.tsx`) ###

```typescript
import React from 'react';
import type { TextProps } from 'react-native';
import { Text as RNText } from 'react-native';
import { twMerge } from 'tailwind-merge';

interface Props extends TextProps {
  className?: string;
}

export const Text = ({ className = '', style, children, ...props }: Props) => {
  const textStyle = React.useMemo(
    () =>
      twMerge(
        // 使用 dark: 前缀定义深色模式样式
        'text-base text-black dark:text-white font-inter font-normal',
        className
      ),
    [className]
  );

  return (
    <RNText className={textStyle} style={style} {...props}>
      {children}
    </RNText>
  );
};
```

**使用示例**：

```tsx
<Text>这段文字在浅色模式是黑色，深色模式是白色</Text>
<Text className="text-primary-600 dark:text-primary-200">
  主题色文字
</Text>
```

### 按钮组件 (`src/components/ui/button.tsx`) ###

使用 `tailwind-variants` 创建多变体按钮：

```typescript
import React from 'react';
import type { PressableProps } from 'react-native';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import type { VariantProps } from 'tailwind-variants';
import { tv } from 'tailwind-variants';

const button = tv({
  slots: {
    container: 'my-2 flex flex-row items-center justify-center rounded-md px-4',
    label: 'font-inter text-base font-semibold',
    indicator: 'h-6',
  },

  variants: {
    variant: {
      default: {
        // 深色模式自动反转颜色
        container: 'bg-black dark:bg-white',
        label: 'text-white dark:text-black',
        indicator: 'text-white dark:text-black',
      },
      outline: {
        container: 'border border-neutral-400',
        label: 'text-black dark:text-neutral-100',
        indicator: 'text-black dark:text-neutral-100',
      },
      ghost: {
        container: 'bg-transparent',
        label: 'text-black underline dark:text-white',
        indicator: 'text-black dark:text-white',
      },
    },
    size: {
      default: {
        container: 'h-10 px-4',
        label: 'text-base',
      },
      lg: {
        container: 'h-12 px-8',
        label: 'text-xl',
      },
      sm: {
        container: 'h-8 px-3',
        label: 'text-sm',
      },
    },
    disabled: {
      true: {
        // 禁用状态在两种模式下保持一致
        container: 'bg-neutral-300 dark:bg-neutral-300',
        label: 'text-neutral-600 dark:text-neutral-600',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
    disabled: false,
  },
});

type ButtonVariants = VariantProps<typeof button>;
interface Props extends ButtonVariants, Omit<PressableProps, 'disabled'> {
  label?: string;
  loading?: boolean;
  className?: string;
}

export const Button = ({
  label,
  loading = false,
  variant = 'default',
  disabled = false,
  size = 'default',
  className = '',
  ...props
}: Props) => {
  const styles = React.useMemo(
    () => button({ variant, disabled, size }),
    [variant, disabled, size]
  );

  return (
    <Pressable
      disabled={disabled || loading}
      className={styles.container({ className })}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" className={styles.indicator()} />
      ) : (
        <Text className={styles.label()}>{label}</Text>
      )}
    </Pressable>
  );
};
```

### 主题切换器组件 (`src/components/settings/theme-item.tsx`) ###

创建用户可以切换主题的 UI：

```typescript
import React from 'react';

import type { OptionType } from '@/components/ui';
import { Options, useModal } from '@/components/ui';
import type { ColorSchemeType } from '@/lib';
import { useSelectedTheme } from '@/lib';

import { Item } from './item';

export const ThemeItem = () => {
  const { selectedTheme, setSelectedTheme } = useSelectedTheme();
  const modal = useModal();

  const onSelect = React.useCallback(
    (option: OptionType) => {
      setSelectedTheme(option.value as ColorSchemeType);
      modal.dismiss();
    },
    [setSelectedTheme, modal]
  );

  const themes = React.useMemo(
    () => [
      { label: '深色模式 🌙', value: 'dark' },
      { label: '浅色模式 🌞', value: 'light' },
      { label: '跟随系统 ⚙️', value: 'system' },
    ],
    []
  );

  const theme = React.useMemo(
    () => themes.find((t) => t.value === selectedTheme),
    [selectedTheme, themes]
  );

  return (
    <>
      <Item
        text="主题设置"
        value={theme?.label}
        onPress={modal.present}
      />
      <Options
        ref={modal.ref}
        options={themes}
        onSelect={onSelect}
        value={theme?.value}
      />
    </>
  );
};
```

### 通用样式模式 ###

在任何组件中使用 `dark:` 前缀：

```tsx
// 背景色
<View className="bg-white dark:bg-charcoal-950">

// 文字颜色
<Text className="text-gray-900 dark:text-gray-100">

// 边框
<View className="border border-gray-300 dark:border-gray-700">

// 组合使用
<View className="bg-white dark:bg-black p-4 rounded-lg shadow-lg dark:shadow-none">
  <Text className="text-xl font-bold text-black dark:text-white">
    标题
  </Text>
  <Text className="text-gray-600 dark:text-gray-400 mt-2">
    描述文本
  </Text>
</View>
```

## 最佳实践 ##

### 颜色使用规范 ###

**定义语义化颜色变量**：

```javascript
// ✅ 好的做法
colors.primary[400]; // 浅色模式主色
colors.primary[200]; // 深色模式主色

// ❌ 避免
colors.orange[500]; // 语义不明确
```

**保持对比度**：

```tsx
// ✅ 确保足够的对比度
<Text className="text-gray-900 dark:text-gray-100">

// ❌ 对比度不足
<Text className="text-gray-500 dark:text-gray-600">
```

**使用自定义颜色**：

```tsx
// 在 colors.js 中定义
charcoal: {
  850: '#2E2E2E',  // 自定义深色卡片背景
  950: '#121212',  // 自定义深色主背景
}

// 使用
<View className="bg-white dark:bg-charcoal-850">
```

### 组件设计原则 ###

**默认支持主题**：

```tsx
// ✅ 所有基础组件都应包含 dark 变体
const Text = ({ className, ...props }) => (
  <RNText
    className={twMerge('text-black dark:text-white', className)}
    {...props}
  />
);
```

**可覆盖的默认样式**：

```tsx
// 用户可以覆盖默认主题样式
<Text className="text-blue-600 dark:text-blue-400">自定义颜色</Text>
```

**使用 useMemo 优化**：

```tsx
const styles = React.useMemo(
  () => button({ variant, disabled, size }),
  [variant, disabled, size]
);
```

### 性能优化 ###

**避免在渲染中直接读取存储**：

```tsx
// ❌ 不好的做法
const theme = storage.getString('SELECTED_THEME');

// ✅ 使用 Hook
const { selectedTheme } = useSelectedTheme();
```

**使用 colorScheme 而不是 selectedTheme**：

```tsx
// ❌ 样式组件不应该使用 useSelectedTheme
const { selectedTheme } = useSelectedTheme();

// ✅ 使用 useColorScheme 获取当前激活的主题
const { colorScheme } = useColorScheme();
```

**条件渲染优化**：

```tsx
// 对于完全不同的 UI，使用条件渲染
const { colorScheme } = useColorScheme();
return colorScheme === 'dark' ? <DarkHeader /> : <LightHeader />;
```

### 调试技巧 ###

**添加调试日志**：

```typescript
export const loadSelectedTheme = () => {
  const theme = storage.getString(SELECTED_THEME);
  console.log('🎨 Loading theme:', theme);
  if (theme !== undefined) {
    colorScheme.set(theme as ColorSchemeType);
  }
};
```

**主题切换测试**：

```tsx
// 在开发环境添加快速切换按钮
import { colorScheme } from 'nativewind';

const DevThemeToggle = () => (
  <Button
    onPress={() => {
      const current = colorScheme.get();
      colorScheme.set(current === 'dark' ? 'light' : 'dark');
    }}
  >
    Toggle Theme
  </Button>
);
```

## 常见问题 ##

### Q1: 主题切换后颜色没有变化？ ###

**原因**：可能是忘记在根组件添加 `dark` className

**解决方案**：

```tsx
// 确保根组件有这段代码
<GestureHandlerRootView
  className={theme.dark ? `dark` : undefined}
>
```

### Q2: 应用重启后主题重置了？ ###

**原因**：没有调用 `loadSelectedTheme()`

**解决方案**：

```tsx
// 在 _layout.tsx 组件外调用
loadSelectedTheme();

export default function RootLayout() {
  // ...
}
```

### Q3: 跟随系统主题不工作？ ###

**原因**：可能使用了 `selectedTheme` 而不是 `colorScheme`

**解决方案**：

```tsx
// ❌ 错误
const { selectedTheme } = useSelectedTheme();
const isDark = selectedTheme === 'dark';

// ✅ 正确
const { colorScheme } = useColorScheme();
const isDark = colorScheme === 'dark';
```

### Q4: Web 端主题不生效？ ###

**原因**：NativeWind 在 Web 端需要额外配置

**解决方案**：

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 添加 CSS 支持
config.transformer.minifierConfig = {
  keep_classnames: true,
  keep_fnames: true,
  mangle: {
    keep_classnames: true,
    keep_fnames: true,
  },
};

module.exports = config;
```

### Q5: TypeScript 类型错误？ ###

**原因**：缺少 NativeWind 类型定义

**解决方案**：

```typescript
// nativewind-env.d.ts
/// <reference types="nativewind/types" />
```

确保在 `tsconfig.json` 中包含：

```json
{
  "include": ["**/*.ts", "**/*.tsx", "nativewind-env.d.ts"]
}
```

### Q6: 部分组件主题不一致？ ###

**原因**：某些第三方组件不支持 NativeWind

**解决方案**：使用 `useColorScheme` 手动处理：

```tsx
const { colorScheme } = useColorScheme();

<ThirdPartyComponent
  backgroundColor={colorScheme === 'dark' ? '#000' : '#fff'}
  textColor={colorScheme === 'dark' ? '#fff' : '#000'}
/>;
```

### Q7: 开发时热重载后主题重置？ ###

**原因**：这是正常的，因为热重载会重新执行模块

**解决方案**：使用完整重载（Expo Go 中点击 R）或忽略这个问题，生产环境不会出现。

## 完整示例 ##

### 项目结构 ###

```txt
project-name/
├── src/
│   ├── app/
│   │   └── _layout.tsx                    # 根布局，集成主题
│   ├── components/
│   │   ├── ui/
│   │   │   ├── colors.js                  # 颜色定义
│   │   │   ├── text.tsx                   # 文本组件
│   │   │   ├── button.tsx                 # 按钮组件
│   │   │   └── focus-aware-status-bar.tsx # 状态栏
│   │   └── settings/
│   │       └── theme-item.tsx             # 主题切换器
│   └── lib/
│       ├── storage.tsx                    # 存储配置
│       ├── use-theme-config.tsx           # Navigation 主题
│       └── hooks/
│           └── use-selected-theme.tsx     # 主题 Hook
├── global.css                             # Tailwind 指令
├── tailwind.config.js                     # Tailwind 配置
├── babel.config.js                        # Babel 配置
└── nativewind-env.d.ts                    # 类型定义
```

### 使用示例页面 ###

```tsx
// src/app/index.tsx
import React from 'react';
import { View, Text, Button } from '@/components/ui';
import { useColorScheme } from 'nativewind';

export default function HomeScreen() {
  const { colorScheme } = useColorScheme();

  return (
    <View className="flex-1 bg-white dark:bg-charcoal-950">
      {/* 状态栏 */}
      <FocusAwareStatusBar />

      {/* 内容区域 */}
      <View className="flex-1 justify-center items-center p-4">
        {/* 标题 */}
        <Text className="text-3xl font-bold text-black dark:text-white mb-4">
          欢迎使用
        </Text>

        {/* 副标题 */}
        <Text className="text-lg text-gray-600 dark:text-gray-400 mb-8 text-center">
          当前主题: {colorScheme === 'dark' ? '深色' : '浅色'}
        </Text>

        {/* 卡片示例 */}
        <View className="w-full max-w-sm bg-neutral-100 dark:bg-charcoal-850 p-6 rounded-2xl shadow-lg">
          <Text className="text-xl font-semibold text-black dark:text-white mb-2">
            主题卡片
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            这个卡片会根据当前主题自动调整颜色
          </Text>
        </View>

        {/* 按钮组 */}
        <View className="mt-8 w-full max-w-sm space-y-2">
          <Button label="默认按钮" variant="default" />
          <Button label="轮廓按钮" variant="outline" />
          <Button label="幽灵按钮" variant="ghost" />
        </View>
      </View>
    </View>
  );
}
```

## 总结 ##

### 核心要点 ###

**配置层面**：

- Tailwind 使用 `darkMode: 'class'`
- Babel 添加 NativeWind preset
- 导入 `global.css`

**存储层面**：

- 使用 `MMKV` 持久化用户选择
- 支持 `light`/`dark`/`system` 三种模式

**应用层面**：

- 在根组件加载主题并添加 `dark className`
- 使用 `useColorScheme` 获取当前激活的主题
- 使用 `useSelectedTheme` 仅在主题选择器中

**样式层面**：

- 使用 `dark:` 前缀定义深色样式
- 所有 UI 组件默认支持主题切换

## 检查清单 ##

在新项目中配置主题时，按以下清单检查：

- 安装 `nativewind` 和 `react-native-mmkv`
- 创建 `tailwind.config.js` 并设置 `darkMode: 'class'`
- 配置 `babel.config.js` 添加 NativeWind preset
- 创建 `global.css` 并导入到 `_layout.tsx`
- 创建 `nativewind-env.d.ts` 类型定义
- 创建 `colors.js` 颜色系统
- 创建 `storage.tsx` MMKV 配置
- 创建 `use-selected-theme.tsx` Hook
- 在 `_layout.tsx` 调用 `loadSelectedTheme()`
- 在根组件添加 `dark` className
- 创建基础 UI 组件（Text, Button 等）
- 创建主题切换器组件
- 测试三种模式（light/dark/system）

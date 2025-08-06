---
lastUpdated: true
commentabled: true
recommended: true
title: React Native国际化实践
description: React Native国际化实践
date: 2025-08-06 15:25:00  
pageClass: blog-page-class
cover: /covers/reactive.svg
---

## 一、主流国际化方案选择 ##

- **react-i18next + react-native-localize**
  - **react-i18next**：功能强大的国际化框架，支持复数、插值、嵌套等复杂语法，且与React无缝集成。
  - **react-native-localize**：用于获取设备语言和地区信息，与i18next配合使用更高效。
  - **推荐理由**：组合方案能同时处理语言切换、设备语言检测和翻译管理，且社区支持活跃。
- 其他可选方案
  - **react-native-i18n**：已废弃，但适合学习基础国际化概念。
  - **react-intl**：适用于复杂Web和移动应用的国际化需求，但配置较复杂。

## 二、实现步骤（以react-i18next为例） ##

### 安装依赖库 ###

```bash
npm install i18next react-i18next react-native-localize
# 或使用yarn
yarn add i18next react-i18next react-native-localize
```

### 配置语言文件 ###

- 创建语言文件目录：

```txt
src/
locales/
en.json    # 英文翻译
zh-CN.json # 中文翻译
```

示例文件内容：

```json:en.json
{
  "welcome": "Welcome",
  "greeting": "Hello, {{name}}!",
  "apple": {
    "one": "1 apple",
    "other": "{{count}} apples"
  }
}
```
### 初始化i18n实例 ###

在src/i18n.js中配置：

```ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

// 导入语言包
import en from './locales/en.json';
import zhCN from './locales/zh-CN.json';

const resources = {
  en: { translation: en },
  'zh-CN': { translation: zhCN }
};

// 获取设备首选语言
const deviceLanguage = RNLocalize.getLocales()[0].languageTag;

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3', // 兼容Android旧版本
    resources,
    lng: deviceLanguage,      // 默认使用设备语言
    fallbackLng: 'en',       // 备用语言
    interpolation: {
      escapeValue: false     // 允许HTML标签插值
    }
  });

export default i18n;
```

### 在组件中使用翻译 ###

函数组件：

```react
import { useTranslation } from 'react-i18next';

const App = () => {
  const { t, i18n } = useTranslation();
  return (
    <View>
      <Text>{t('welcome')}</Text>
      <Text>{t('greeting', { name: 'John' })}</Text>
      <Button 
        title="Switch Language" 
        onPress={() => i18n.changeLanguage(i18n.language === 'en' ? 'zh-CN' : 'en')}
      />
    </View>
  );
};
```

类组件：通过withTranslation高阶组件实现。

### 动态加载语言文件（优化性能） ###

使用异步加载减少初始包大小：

```ts
const loadLanguage = async (lang) => {
  const languageFile = await import(`./locales/${lang}.json`);
  i18n.addResourceBundle(lang, 'translation', languageFile);
};
loadLanguage('en'); // 默认预加载英文
```

## 三、高级功能与优化 ##

### 处理复数与性别 ###

在语言文件中定义复数规则：

```json:en.json
{
  "apple": {
    "one": "1 apple",
    "other": "{{count}} apples"
  }
}
```

使用方式：`t('apple', { count: 3 })` → 输出 "3 apples"。

### 持久化语言设置 ###

结合 `redux-persist` 或 `AsyncStorage` 保存用户选择：

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// 切换语言时保存到本地
const changeLanguage = async (lang) => {
  await AsyncStorage.setItem('userLanguage', lang);
  i18n.changeLanguage(lang);
};
```

### 多平台适配 ###

- iOS：在Xcode的 `Info` 标签页中添加支持的语言。
- Android：在 `android/app/src/main/res` 下创建对应语言的 `values-xx` 目录。

## 四、注意事项 ##

### 版本兼容性 ###

- 避免使用已废弃的库（如react-native-i18n），优先选择react-i18next。
- 检查React Native版本与国际化库的兼容性，例如 `compatibilityJSON: 'v3'` 解决Android旧版本问题。

### 本地化扩展 ###

- 货币、日期格式：使用 `moment.js` 或 `date-fns` 处理本地化时间。
- 图标本地化：结合 `react-native-vector-icons` 显示不同语言对应的图标。

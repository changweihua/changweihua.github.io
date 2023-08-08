---
commentabled: true
recommended: false 
---

# 如何为小程序配置不同的运行环境 #

## 背景 ##

默认情况下，小程序的开发版、体验版和正式版使用的是同一套缓存数据和缓存位置。在多个环境之间切换时，如何避免因为缓存导致程序出行异常显得格外重要。


为此，考虑全局引入环境值标识符，在所有缓存的Key前统一增加环境标识、以此保障不同环境读取到对应环境的缓存。

## 规范缓存Key命名 ##

使用常量，存放系统所有使用的Key值。

统一添加环境值和前缀值，拼接为统一的前缀。

```typescript
import { appConfig } from './app.config'

export const StorageKeys: Record<string, string> = {
  Prefix: `${appConfig.mode}_${appConfig.storage_prefix}`,
  AuthenticateScheme: `${appConfig.mode}_${appConfig.storage_prefix}_AUTHENTICATE_SCHEME`,
  SessionId: `${appConfig.mode}_${appConfig.storage_prefix}_SESSION_ID`,
  AccessToken: `${appConfig.mode}_${appConfig.storage_prefix}_ACCESS_TOKEN`,
  RefreshToken: `${appConfig.mode}_${appConfig.storage_prefix}_REFRESH_TOKEN`,
  AuthorizationState: `${appConfig.mode}_${appConfig.storage_prefix}_AUTHORIZATION_STATE`,
  AuthenticationState: `${appConfig.mode}_${appConfig.storage_prefix}_AUTHENTICATION_STATE`,
  MobileAuthenticationState: `${appConfig.mode}_${appConfig.storage_prefix}_MOBILE_AUTHENTICATION_STATE`,
  UserInfo: `${appConfig.mode}_${appConfig.storage_prefix}_USER_INFO`
}
```

## 系统配置 ##

```typescript
export type AppConfig = {
  storage_prefix: string,
  brand: AppBrand
  log: LogConfig
  mode: 'development' | 'staging' | 'production' | 'testing'
  api_assets_url: string
  api_base_url: string
  temaplate_ids: string[]
  headers: Record<string, string>
  tips: Record<number, string>
  /**
   * 提示框显示市场
   * 
   * 单位 秒
   */
  tip_display_duration: number
  debounceWait: number
}

export type AppBrand = {
  name: string
  color: string
  fullColor: string
  halfColor: string
}

export type LogConfig = {
  debug: {
    emoji: string
    color: string
  }
  info: {
    emoji: string
    color: string
  }
  warn: {
    emoji: string
    color: string
  }
  error: {
    emoji: string
    color: string
  }
}
```

```typescript
import { AppConfig } from "~/types"

const appConfig: AppConfig = {
  storage_prefix: 'STAFF',
  brand: {
    name: '阳光服务地面服务',
    color: '#506BEE',
    fullColor: 'rgba(80, 107, 238, 1)',
    halfColor: 'rgba(80, 107, 238, 0.5)'
  },
  log:{
    debug: {
      emoji: 'eyes',
      color:  'green',
    },
    info: {
      emoji:  'bulb',
      color:  'blue',
    },
    warn: {
      emoji:  'u7981',
      color:  'yellow',
    },
    error: {
      emoji:  'bomb',
      color:  'bold_red',
    }
  },
  mode: 'development',
  api_assets_url: 'http://192.168.100.21:5105',
  api_base_url: 'http://192.168.100.21:5105/api',
  temaplate_ids: [],
  headers: {
    'content-type': 'application/json',
    'platform': 'Staff'
  },
  tips: {
    1: '抱歉，出现了一个错误',
    400: '表单填写有误',
    1005: 'appkey无效',
    3000: '期刊不存在',
    100001: '无效的Token',
    100002: '您输入的手机号无法使用本系统',
    100003: '无效的手机验证码',
    200001: '登录失败'
  },
  tip_display_duration: 1500,
  debounceWait: 3 * 1000
}

export { appConfig }
```

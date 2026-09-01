---
lastUpdated: true
commentabled: true
recommended: true
title: 单点登录还在手动跳转？
description: 这几个SSO实现技巧让你的用户体验飞起来
date: 2025-10-22 10:30:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 🌟 引言 ##

在现代企业级应用开发中，你是否遇到过这样的困扰：

- **多系统登录烦恼**：用户需要在每个子系统都登录一次，体验极差
- **密码管理混乱**：不同系统不同密码，用户记不住，安全性堪忧
- **权限管理复杂**：每个系统都要维护用户信息，数据不一致
- **开发成本高昂**：每个系统都要重复开发认证功能，浪费资源

今天分享5个单点登录（SSO）的核心实现技巧，让你的多系统认证体验丝滑如德芙！

## 💡 核心技巧详解 ##

### CAS协议实现：经典的票据认证机制 ###

#### 🔍 应用场景 ####

企业内部多个Web应用需要统一认证，用户只需登录一次即可访问所有系统。

#### ❌ 常见问题 ####

传统做法是每个系统独立认证，用户体验差，维护成本高。

```javascript
// ❌ 传统独立认证方式
const loginToSystemA = async (username, password) => {
  const response = await fetch('/api/system-a/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  return response.json();
};

const loginToSystemB = async (username, password) => {
  const response = await fetch('/api/system-b/login', {
    method: 'POST', 
    body: JSON.stringify({ username, password })
  });
  return response.json();
};
```

#### ✅ 推荐方案 ####

使用CAS协议实现统一认证服务。

```javascript
/**
 * CAS客户端认证管理器
 * @description 实现CAS协议的客户端认证逻辑
 */
class CASClient {
  constructor(casServerUrl, serviceUrl) {
    this.casServerUrl = casServerUrl;
    this.serviceUrl = serviceUrl;
    this.ticket = null;
  }

  /**
   * 检查用户认证状态
   * @description 检查当前用户是否已通过CAS认证
   * @returns {boolean} 是否已认证
   */
  isAuthenticated = () => {
    return !!this.ticket && this.isTicketValid();
  };

  /**
   * 重定向到CAS登录页面
   * @description 当用户未认证时，重定向到CAS服务器登录
   */
  redirectToLogin = () => {
    const loginUrl = `${this.casServerUrl}/login?service=${encodeURIComponent(this.serviceUrl)}`;
    window.location.href = loginUrl;
  };

  /**
   * 验证CAS票据
   * @description 使用从CAS服务器获取的票据进行验证
   * @param {string} ticket - CAS票据
   * @returns {Promise<Object>} 验证结果
   */
  validateTicket = async (ticket) => {
    try {
      const validateUrl = `${this.casServerUrl}/validate?ticket=${ticket}&service=${encodeURIComponent(this.serviceUrl)}`;
      const response = await fetch(validateUrl);
      const result = await response.text();
      
      if (result.startsWith('yes')) {
        const username = result.split('\n')[1];
        this.ticket = ticket;
        this.storeUserSession(username);
        return { success: true, username };
      }
      
      return { success: false, error: 'Invalid ticket' };
    } catch (error) {
      console.error('CAS ticket validation failed:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * 存储用户会话信息
   * @description 将认证成功的用户信息存储到本地
   * @param {string} username - 用户名
   */
  storeUserSession = (username) => {
    const sessionData = {
      username,
      loginTime: Date.now(),
      ticket: this.ticket
    };
    sessionStorage.setItem('cas_session', JSON.stringify(sessionData));
  };

  /**
   * 检查票据有效性
   * @description 检查当前票据是否仍然有效
   * @returns {boolean} 票据是否有效
   */
  isTicketValid = () => {
    const session = sessionStorage.getItem('cas_session');
    if (!session) return false;
    
    const { loginTime } = JSON.parse(session);
    const now = Date.now();
    const sessionTimeout = 30 * 60 * 1000; // 30分钟
    
    return (now - loginTime) < sessionTimeout;
  };
}
```

#### 💡 核心要点 ####

- 统一认证入口：所有系统都通过CAS服务器进行认证
- 票据机制：使用一次性票据确保安全性
- 会话管理：合理设置会话超时时间
- 安全传输：所有认证请求都使用HTTPS

#### 🎯 实际应用 ####

在Vue3项目中集成CAS认证：

```javascript
// 在Vue3应用中使用CAS认证
import { ref, onMounted } from 'vue';

/**
 * CAS认证组合式函数
 * @description 封装CAS认证相关逻辑
 */
export const useCASAuth = () => {
  const isLoggedIn = ref(false);
  const userInfo = ref(null);
  const casClient = new CASClient(
    'https://cas.example.com',
    window.location.origin
  );

  /**
   * 初始化认证状态
   * @description 页面加载时检查认证状态
   */
  const initAuth = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const ticket = urlParams.get('ticket');
    
    if (ticket) {
      // 验证CAS票据
      const result = await casClient.validateTicket(ticket);
      if (result.success) {
        isLoggedIn.value = true;
        userInfo.value = { username: result.username };
        // 清除URL中的ticket参数
        window.history.replaceState({}, '', window.location.pathname);
      }
    } else if (casClient.isAuthenticated()) {
      // 检查现有会话
      isLoggedIn.value = true;
      const session = JSON.parse(sessionStorage.getItem('cas_session'));
      userInfo.value = { username: session.username };
    } else {
      // 重定向到CAS登录
      casClient.redirectToLogin();
    }
  };

  /**
   * 登出功能
   * @description 清除本地会话并重定向到CAS登出
   */
  const logout = () => {
    sessionStorage.removeItem('cas_session');
    window.location.href = `${casClient.casServerUrl}/logout?service=${encodeURIComponent(window.location.origin)}`;
  };

  onMounted(initAuth);

  return {
    isLoggedIn,
    userInfo,
    logout
  };
};
```

### SAML协议实现：企业级标准认证 ###

#### 🔍 应用场景 ####

大型企业需要与第三方系统（如Office 365、Salesforce）进行身份联合，实现跨域认证。

#### ❌ 常见问题 ####

手动处理SAML XML格式复杂，容易出现安全漏洞。

```javascript
// ❌ 手动解析SAML响应（不推荐）
const parseSAMLResponse = (xmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');
  // 手动解析XML，容易出错且不安全
  return doc.querySelector('saml:Assertion');
};
```

#### ✅ 推荐方案 ####

使用专业的SAML库处理认证流程。

```javascript
/**
 * SAML认证管理器
 * @description 处理SAML协议的认证流程
 */
class SAMLAuthManager {
  constructor(config) {
    this.config = {
      entityId: config.entityId,
      ssoUrl: config.ssoUrl,
      x509Certificate: config.x509Certificate,
      privateKey: config.privateKey,
      ...config
    };
  }

  /**
   * 生成SAML认证请求
   * @description 创建SAML AuthnRequest并重定向到IdP
   * @param {string} relayState - 认证后的回调状态
   */
  initiateSSO = (relayState = '/') => {
    const authnRequest = this.createAuthnRequest();
    const encodedRequest = this.encodeRequest(authnRequest);
    
    const ssoUrl = new URL(this.config.ssoUrl);
    ssoUrl.searchParams.set('SAMLRequest', encodedRequest);
    ssoUrl.searchParams.set('RelayState', relayState);
    
    window.location.href = ssoUrl.toString();
  };

  /**
   * 创建SAML认证请求
   * @description 生成符合SAML标准的AuthnRequest
   * @returns {string} SAML AuthnRequest XML
   */
  createAuthnRequest = () => {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();
    
    return `
      <samlp:AuthnRequest 
        xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
        xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
        ID="${requestId}"
        Version="2.0"
        IssueInstant="${timestamp}"
        Destination="${this.config.ssoUrl}"
        AssertionConsumerServiceURL="${this.config.acsUrl}">
        <saml:Issuer>${this.config.entityId}</saml:Issuer>
        <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" AllowCreate="true"/>
      </samlp:AuthnRequest>
    `;
  };

  /**
   * 处理SAML响应
   * @description 验证并解析IdP返回的SAML响应
   * @param {string} samlResponse - Base64编码的SAML响应
   * @returns {Promise<Object>} 解析后的用户信息
   */
  handleSAMLResponse = async (samlResponse) => {
    try {
      // 解码SAML响应
      const decodedResponse = atob(samlResponse);
      
      // 验证签名（实际项目中应使用专业库）
      const isValid = await this.validateSignature(decodedResponse);
      if (!isValid) {
        throw new Error('Invalid SAML signature');
      }

      // 解析用户属性
      const userAttributes = this.parseUserAttributes(decodedResponse);
      
      // 创建本地会话
      this.createUserSession(userAttributes);
      
      return {
        success: true,
        user: userAttributes
      };
    } catch (error) {
      console.error('SAML response processing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  /**
   * 解析用户属性
   * @description 从SAML断言中提取用户信息
   * @param {string} samlXml - SAML响应XML
   * @returns {Object} 用户属性对象
   */
  parseUserAttributes = (samlXml) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(samlXml, 'text/xml');
    
    const attributes = {};
    const attributeNodes = doc.querySelectorAll('saml\\:Attribute, Attribute');
    
    attributeNodes.forEach(attr => {
      const name = attr.getAttribute('Name');
      const valueNode = attr.querySelector('saml\\:AttributeValue, AttributeValue');
      if (valueNode) {
        attributes[name] = valueNode.textContent;
      }
    });

    return {
      email: attributes['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      name: attributes['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      department: attributes['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/department'],
      roles: attributes['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']?.split(',') || []
    };
  };

  /**
   * 生成请求ID
   * @description 生成唯一的SAML请求标识符
   * @returns {string} 请求ID
   */
  generateRequestId = () => {
    return '_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  };

  /**
   * 创建用户会话
   * @description 将SAML认证的用户信息存储到会话中
   * @param {Object} userAttributes - 用户属性
   */
  createUserSession = (userAttributes) => {
    const sessionData = {
      ...userAttributes,
      loginTime: Date.now(),
      authMethod: 'SAML'
    };
    sessionStorage.setItem('saml_session', JSON.stringify(sessionData));
  };
}
```

#### 💡 核心要点 ####

- 标准协议：SAML是业界标准，兼容性好
- 安全性高：支持数字签名和加密
- 属性传递：可以传递丰富的用户属性信息
- 跨域支持：天然支持跨域认证

#### 🎯 实际应用 ####

在企业应用中集成SAML认证：

```javascript
// Vue3中使用SAML认证
export const useSAMLAuth = () => {
  const samlManager = new SAMLAuthManager({
    entityId: 'https://myapp.example.com',
    ssoUrl: 'https://idp.example.com/sso',
    acsUrl: 'https://myapp.example.com/saml/acs',
    x509Certificate: process.env.VUE_APP_SAML_CERT
  });

  /**
   * 启动SAML登录
   * @description 重定向到IdP进行SAML认证
   */
  const login = () => {
    samlManager.initiateSSO(window.location.pathname);
  };

  /**
   * 处理SAML回调
   * @description 处理IdP返回的SAML响应
   */
  const handleCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const samlResponse = urlParams.get('SAMLResponse');
    
    if (samlResponse) {
      const result = await samlManager.handleSAMLResponse(samlResponse);
      if (result.success) {
        // 认证成功，跳转到目标页面
        const relayState = urlParams.get('RelayState') || '/';
        window.location.href = relayState;
      }
    }
  };

  return { login, handleCallback };
};
```

### OAuth 2.0 + OpenID Connect：现代化认证标准 ###

#### 🔍 应用场景 ####

需要与第三方服务（如Google、GitHub、微信）集成，或构建现代化的API认证体系。

#### ❌ 常见问题 ####

直接使用OAuth 2.0进行身份认证，缺少标准化的用户信息获取机制。

```javascript
// ❌ 仅使用OAuth 2.0（缺少身份信息）
const getAccessToken = async (code) => {
  const response = await fetch('/oauth/token', {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: 'your_client_id'
    })
  });
  // 只能获取访问令牌，无法直接获取用户身份信息
  return response.json();
};
```

#### ✅ 推荐方案 ####

使用OpenID Connect在OAuth 2.0基础上实现身份认证。

```javascript
/**
 * OpenID Connect认证管理器
 * @description 基于OAuth 2.0和OpenID Connect的现代认证实现
 */
class OIDCAuthManager {
  constructor(config) {
    this.config = {
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: config.redirectUri,
      scope: 'openid profile email',
      responseType: 'code',
      ...config
    };
    this.discoveryDocument = null;
  }

  /**
   * 初始化OIDC配置
   * @description 从.well-known端点获取OIDC配置信息
   */
  initialize = async () => {
    try {
      const discoveryUrl = `${this.config.issuer}/.well-known/openid_configuration`;
      const response = await fetch(discoveryUrl);
      this.discoveryDocument = await response.json();
    } catch (error) {
      console.error('Failed to load OIDC discovery document:', error);
      throw error;
    }
  };

  /**
   * 启动认证流程
   * @description 重定向到OIDC提供商进行认证
   * @param {string} state - 防CSRF攻击的状态参数
   */
  startAuthentication = (state = this.generateState()) => {
    const authUrl = new URL(this.discoveryDocument.authorization_endpoint);
    
    authUrl.searchParams.set('client_id', this.config.clientId);
    authUrl.searchParams.set('redirect_uri', this.config.redirectUri);
    authUrl.searchParams.set('response_type', this.config.responseType);
    authUrl.searchParams.set('scope', this.config.scope);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('nonce', this.generateNonce());

    // 存储state用于验证
    sessionStorage.setItem('oidc_state', state);
    
    window.location.href = authUrl.toString();
  };

  /**
   * 处理认证回调
   * @description 处理从OIDC提供商返回的授权码
   * @param {string} code - 授权码
   * @param {string} state - 状态参数
   * @returns {Promise<Object>} 认证结果
   */
  handleCallback = async (code, state) => {
    try {
      // 验证state参数
      const storedState = sessionStorage.getItem('oidc_state');
      if (state !== storedState) {
        throw new Error('Invalid state parameter');
      }

      // 交换访问令牌
      const tokenResponse = await this.exchangeCodeForTokens(code);
      
      // 验证ID Token
      const userInfo = await this.validateIdToken(tokenResponse.id_token);
      
      // 获取用户详细信息
      const userProfile = await this.getUserInfo(tokenResponse.access_token);
      
      // 创建用户会话
      this.createUserSession({
        ...userInfo,
        ...userProfile,
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token
      });

      return {
        success: true,
        user: { ...userInfo, ...userProfile }
      };
    } catch (error) {
      console.error('OIDC callback processing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  /**
   * 交换授权码获取令牌
   * @description 使用授权码换取访问令牌和ID令牌
   * @param {string} code - 授权码
   * @returns {Promise<Object>} 令牌响应
   */
  exchangeCodeForTokens = async (code) => {
    const tokenEndpoint = this.discoveryDocument.token_endpoint;
    
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri
      })
    });

    if (!response.ok) {
      throw new Error('Token exchange failed');
    }

    return response.json();
  };

  /**
   * 验证ID Token
   * @description 验证JWT格式的ID Token并提取用户信息
   * @param {string} idToken - ID Token
   * @returns {Object} 解析后的用户信息
   */
  validateIdToken = async (idToken) => {
    // 简化的JWT解析（实际项目中应使用专业库验证签名）
    const [header, payload, signature] = idToken.split('.');
    const decodedPayload = JSON.parse(atob(payload));
    
    // 验证令牌有效期
    const now = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp < now) {
      throw new Error('ID Token expired');
    }

    // 验证issuer
    if (decodedPayload.iss !== this.config.issuer) {
      throw new Error('Invalid issuer');
    }

    return {
      sub: decodedPayload.sub,
      email: decodedPayload.email,
      name: decodedPayload.name,
      picture: decodedPayload.picture
    };
  };

  /**
   * 获取用户信息
   * @description 使用访问令牌获取用户详细信息
   * @param {string} accessToken - 访问令牌
   * @returns {Promise<Object>} 用户信息
   */
  getUserInfo = async (accessToken) => {
    const userInfoEndpoint = this.discoveryDocument.userinfo_endpoint;
    
    const response = await fetch(userInfoEndpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    return response.json();
  };

  /**
   * 生成状态参数
   * @description 生成随机状态字符串防止CSRF攻击
   * @returns {string} 状态参数
   */
  generateState = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  /**
   * 生成nonce参数
   * @description 生成随机nonce防止重放攻击
   * @returns {string} nonce参数
   */
  generateNonce = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  /**
   * 创建用户会话
   * @description 将认证信息存储到本地会话
   * @param {Object} userInfo - 用户信息
   */
  createUserSession = (userInfo) => {
    const sessionData = {
      ...userInfo,
      loginTime: Date.now(),
      authMethod: 'OIDC'
    };
    sessionStorage.setItem('oidc_session', JSON.stringify(sessionData));
  };
}
```

#### 💡 核心要点 ####

- 标准化：基于OAuth 2.0的标准身份认证扩展
- 安全性：支持PKCE、state参数等安全机制
- 互操作性：与主流身份提供商兼容
- 用户体验：支持静默刷新和单点登出

#### 🎯 实际应用 ####

在Vue3应用中集成OIDC认证：

```javascript
// Vue3中使用OIDC认证
export const useOIDCAuth = () => {
  const oidcManager = new OIDCAuthManager({
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    issuer: 'https://accounts.google.com',
    redirectUri: `${window.location.origin}/auth/callback`
  });

  const isAuthenticated = ref(false);
  const user = ref(null);

  /**
   * 初始化认证
   * @description 应用启动时初始化OIDC配置
   */
  const initAuth = async () => {
    await oidcManager.initialize();
    
    // 检查现有会话
    const session = sessionStorage.getItem('oidc_session');
    if (session) {
      const sessionData = JSON.parse(session);
      isAuthenticated.value = true;
      user.value = sessionData;
    }
  };

  /**
   * 登录
   * @description 启动OIDC认证流程
   */
  const login = () => {
    oidcManager.startAuthentication();
  };

  /**
   * 处理认证回调
   * @description 处理OIDC认证回调
   */
  const handleAuthCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      const result = await oidcManager.handleCallback(code, state);
      if (result.success) {
        isAuthenticated.value = true;
        user.value = result.user;
        // 清除URL参数
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  };

  return {
    isAuthenticated,
    user,
    initAuth,
    login,
    handleAuthCallback
  };
};
```

### JWT Token统一管理：无状态认证的最佳实践 ###

#### 🔍 应用场景 ####

微服务架构中需要在多个服务间传递用户身份信息，要求无状态、可扩展的认证方案。

#### ❌ 常见问题 ####

JWT Token管理混乱，缺少刷新机制和安全存储。

```javascript
// ❌ 简单粗暴的Token管理
localStorage.setItem('token', 'jwt-token-here'); // 不安全
const token = localStorage.getItem('token'); // 没有过期检查
```

#### ✅ 推荐方案 ####

实现完整的JWT Token管理系统。

```javascript
/**
 * JWT Token管理器
 * @description 提供完整的JWT Token生命周期管理
 */
class JWTTokenManager {
  constructor(config = {}) {
    this.config = {
      tokenKey: 'access_token',
      refreshTokenKey: 'refresh_token',
      refreshThreshold: 5 * 60 * 1000, // 5分钟
      maxRetries: 3,
      ...config
    };
    this.refreshPromise = null;
  }

  /**
   * 存储Token
   * @description 安全地存储访问令牌和刷新令牌
   * @param {string} accessToken - 访问令牌
   * @param {string} refreshToken - 刷新令牌
   */
  storeTokens = (accessToken, refreshToken) => {
    // 使用httpOnly cookie存储刷新令牌（更安全）
    document.cookie = `${this.config.refreshTokenKey}=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/`;
    
    // 访问令牌存储在内存中（sessionStorage作为备选）
    sessionStorage.setItem(this.config.tokenKey, accessToken);
    
    // 设置自动刷新
    this.scheduleTokenRefresh(accessToken);
  };

  /**
   * 获取访问令牌
   * @description 获取当前有效的访问令牌
   * @returns {Promise<string|null>} 访问令牌
   */
  getAccessToken = async () => {
    let token = sessionStorage.getItem(this.config.tokenKey);
    
    if (!token) {
      return null;
    }

    // 检查Token是否即将过期
    if (this.isTokenNearExpiry(token)) {
      token = await this.refreshAccessToken();
    }

    return token;
  };

  /**
   * 检查Token是否即将过期
   * @description 判断Token是否需要刷新
   * @param {string} token - JWT Token
   * @returns {boolean} 是否即将过期
   */
  isTokenNearExpiry = (token) => {
    try {
      const payload = this.parseJWTPayload(token);
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = (payload.exp - now) * 1000;
      
      return timeUntilExpiry < this.config.refreshThreshold;
    } catch (error) {
      console.error('Failed to parse JWT:', error);
      return true; // 解析失败时认为需要刷新
    }
  };

  /**
   * 解析JWT载荷
   * @description 解析JWT Token的载荷部分
   * @param {string} token - JWT Token
   * @returns {Object} 载荷对象
   */
  parseJWTPayload = (token) => {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  };

  /**
   * 刷新访问令牌
   * @description 使用刷新令牌获取新的访问令牌
   * @returns {Promise<string|null>} 新的访问令牌
   */
  refreshAccessToken = async () => {
    // 防止并发刷新
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  };

  /**
   * 执行Token刷新
   * @description 实际执行Token刷新的网络请求
   * @returns {Promise<string|null>} 新的访问令牌
   */
  performTokenRefresh = async () => {
    try {
      const refreshToken = this.getRefreshTokenFromCookie();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include' // 包含cookies
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      // 存储新的Token
      this.storeTokens(data.accessToken, data.refreshToken);
      
      return data.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      // 重定向到登录页面
      window.location.href = '/login';
      return null;
    }
  };

  /**
   * 从Cookie获取刷新令牌
   * @description 从httpOnly cookie中提取刷新令牌
   * @returns {string|null} 刷新令牌
   */
  getRefreshTokenFromCookie = () => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === this.config.refreshTokenKey) {
        return value;
      }
    }
    return null;
  };

  /**
   * 安排Token刷新
   * @description 根据Token过期时间安排自动刷新
   * @param {string} token - 当前访问令牌
   */
  scheduleTokenRefresh = (token) => {
    try {
      const payload = this.parseJWTPayload(token);
      const now = Math.floor(Date.now() / 1000);
      const timeUntilRefresh = (payload.exp - now) * 1000 - this.config.refreshThreshold;
      
      if (timeUntilRefresh > 0) {
        setTimeout(() => {
          this.refreshAccessToken();
        }, timeUntilRefresh);
      }
    } catch (error) {
      console.error('Failed to schedule token refresh:', error);
    }
  };

  /**
   * 清除所有Token
   * @description 清除存储的所有认证信息
   */
  clearTokens = () => {
    sessionStorage.removeItem(this.config.tokenKey);
    document.cookie = `${this.config.refreshTokenKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  /**
   * 创建认证拦截器
   * @description 为HTTP请求添加认证头
   * @returns {Function} 请求拦截器函数
   */
  createAuthInterceptor = () => {
    return async (config) => {
      const token = await this.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    };
  };
}
```

#### 💡 核心要点 ####

- 安全存储：刷新令牌使用httpOnly cookie，访问令牌存储在内存
- 自动刷新：基于过期时间自动刷新Token
- 并发控制：防止多个请求同时触发Token刷新
- 错误处理：刷新失败时自动清理并重定向

#### 🎯 实际应用 ####

在Vue3应用中集成JWT Token管理：

```javascript
// Vue3中使用JWT Token管理
import axios from 'axios';

export const useJWTAuth = () => {
  const tokenManager = new JWTTokenManager();
  
  // 配置axios拦截器
  axios.interceptors.request.use(tokenManager.createAuthInterceptor());
  
  // 响应拦截器处理401错误
  axios.interceptors.response.use(
    response => response,
    async error => {
      if (error.response?.status === 401) {
        // Token可能已过期，尝试刷新
        const newToken = await tokenManager.refreshAccessToken();
        if (newToken) {
          // 重试原请求
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return axios.request(error.config);
        }
      }
      return Promise.reject(error);
    }
  );

  /**
   * 登录
   * @description 用户登录并存储Token
   * @param {Object} credentials - 登录凭据
   */
  const login = async (credentials) => {
    try {
      const response = await axios.post('/api/auth/login', credentials);
      const { accessToken, refreshToken } = response.data;
      
      tokenManager.storeTokens(accessToken, refreshToken);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  /**
   * 登出
   * @description 清除Token并登出
   */
  const logout = () => {
    tokenManager.clearTokens();
    window.location.href = '/login';
  };

  return {
    login,
    logout,
    getAccessToken: tokenManager.getAccessToken
  };
};
```

### 跨域单点登出：优雅的全局退出机制 ###

#### 🔍 应用场景 ####

用户在一个系统中登出后，需要同时登出所有相关的子系统，确保安全性。

#### ❌ 常见问题 ####

各系统独立处理登出，用户需要逐个退出，体验差且存在安全隐患。

```javascript
// ❌ 各系统独立登出
const logout = () => {
  localStorage.clear();
  window.location.href = '/login';
  // 其他系统的会话仍然有效
};
```

#### ✅ 推荐方案 ####

实现统一的跨域单点登出机制。

```javascript
/**
 * 单点登出管理器
 * @description 实现跨域的统一登出机制
 */
class SingleLogoutManager {
  constructor(config) {
    this.config = {
      logoutEndpoint: config.logoutEndpoint,
      participantSystems: config.participantSystems || [],
      timeout: config.timeout || 5000,
      ...config
    };
    this.logoutFrame = null;
  }

  /**
   * 执行单点登出
   * @description 协调所有参与系统的登出流程
   * @param {string} reason - 登出原因
   * @returns {Promise<Object>} 登出结果
   */
  performSingleLogout = async (reason = 'user_initiated') => {
    try {
      // 1. 通知认证服务器开始登出流程
      await this.notifyAuthServer(reason);
      
      // 2. 并行登出所有参与系统
      const logoutPromises = this.config.participantSystems.map(system => 
        this.logoutFromSystem(system)
      );
      
      // 3. 等待所有系统登出完成（设置超时）
      const results = await Promise.allSettled(
        logoutPromises.map(promise => 
          this.withTimeout(promise, this.config.timeout)
        )
      );
      
      // 4. 清理本地会话
      this.clearLocalSession();
      
      // 5. 分析登出结果
      const summary = this.analyzeLogoutResults(results);
      
      return {
        success: true,
        summary,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Single logout failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: Date.now()
      };
    }
  };

  /**
   * 通知认证服务器
   * @description 向认证服务器发送登出通知
   * @param {string} reason - 登出原因
   */
  notifyAuthServer = async (reason) => {
    const response = await fetch(this.config.logoutEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'initiate_logout',
        reason,
        timestamp: Date.now()
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to notify auth server');
    }
  };

  /**
   * 从指定系统登出
   * @description 使用iframe方式从指定系统登出
   * @param {Object} system - 系统配置
   * @returns {Promise<Object>} 登出结果
   */
  logoutFromSystem = (system) => {
    return new Promise((resolve, reject) => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = `${system.baseUrl}/logout?slo=true&return_url=${encodeURIComponent(window.location.origin)}`;
      
      const timeout = setTimeout(() => {
        document.body.removeChild(iframe);
        reject(new Error(`Logout timeout for ${system.name}`));
      }, this.config.timeout);

      iframe.onload = () => {
        clearTimeout(timeout);
        setTimeout(() => {
          document.body.removeChild(iframe);
          resolve({
            system: system.name,
            success: true,
            timestamp: Date.now()
          });
        }, 1000); // 给系统一些时间处理登出
      };

      iframe.onerror = () => {
        clearTimeout(timeout);
        document.body.removeChild(iframe);
        reject(new Error(`Failed to logout from ${system.name}`));
      };

      document.body.appendChild(iframe);
    });
  };

  /**
   * 添加超时控制
   * @description 为Promise添加超时机制
   * @param {Promise} promise - 原始Promise
   * @param {number} timeout - 超时时间
   * @returns {Promise} 带超时的Promise
   */
  withTimeout = (promise, timeout) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Operation timeout')), timeout)
      )
    ]);
  };

  /**
   * 清理本地会话
   * @description 清除所有本地存储的会话信息
   */
  clearLocalSession = () => {
    // 清除所有存储
    sessionStorage.clear();
    localStorage.clear();
    
    // 清除所有cookies
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  };

  /**
   * 分析登出结果
   * @description 分析各系统的登出结果
   * @param {Array} results - 登出结果数组
   * @returns {Object} 结果摘要
   */
  analyzeLogoutResults = (results) => {
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    return {
      total: results.length,
      successful,
      failed,
      successRate: (successful / results.length * 100).toFixed(2) + '%',
      details: results.map((result, index) => ({
        system: this.config.participantSystems[index]?.name || `System ${index}`,
        status: result.status,
        error: result.status === 'rejected' ? result.reason.message : null
      }))
    };
  };

  /**
   * 监听登出事件
   * @description 监听来自其他系统的登出通知
   */
  listenForLogoutEvents = () => {
    // 监听postMessage事件
    window.addEventListener('message', (event) => {
      if (event.data.type === 'sso_logout') {
        this.handleRemoteLogout(event.data);
      }
    });

    // 监听storage事件（同域下的其他标签页）
    window.addEventListener('storage', (event) => {
      if (event.key === 'sso_logout_signal') {
        this.handleRemoteLogout(JSON.parse(event.newValue));
      }
    });
  };

  /**
   * 处理远程登出
   * @description 处理来自其他系统的登出通知
   * @param {Object} logoutData - 登出数据
   */
  handleRemoteLogout = (logoutData) => {
    console.log('Received remote logout signal:', logoutData);
    
    // 清理本地会话
    this.clearLocalSession();
    
    // 重定向到登录页面
    window.location.href = '/login?reason=remote_logout';
  };
}
```

#### 💡 核心要点 ####

- 协调机制：统一协调所有参与系统的登出流程
- 超时控制：防止某个系统响应慢影响整体体验
- 错误处理：即使部分系统登出失败也要继续流程
- 安全清理：彻底清除所有本地存储的认证信息

#### 🎯 实际应用 ####

在Vue3应用中集成单点登出：

```javascript
// Vue3中使用单点登出
export const useSingleLogout = () => {
  const logoutManager = new SingleLogoutManager({
    logoutEndpoint: 'https://auth.example.com/logout',
    participantSystems: [
      { name: 'CRM系统', baseUrl: 'https://crm.example.com' },
      { name: '财务系统', baseUrl: 'https://finance.example.com' },
      { name: '人事系统', baseUrl: 'https://hr.example.com' }
    ],
    timeout: 8000
  });

  /**
   * 执行登出
   * @description 启动单点登出流程
   */
  const logout = async () => {
    const result = await logoutManager.performSingleLogout('user_initiated');
    
    if (result.success) {
      console.log('登出成功:', result.summary);
      // 重定向到登录页面
      window.location.href = '/login';
    } else {
      console.error('登出失败:', result.error);
      // 即使失败也要清理本地会话
      logoutManager.clearLocalSession();
      window.location.href = '/login?error=logout_failed';
    }
  };

  // 初始化时监听登出事件
  onMounted(() => {
    logoutManager.listenForLogoutEvents();
  });

  return { logout };
};
```

## 📊 技巧对比总结 ##

|  技巧   | 使用场景 | 优势 | 注意事项 |
| :-----------: | :-----------: | :-----------: | :-----------: |
| CAS协议 | 企业内部Web应用 |  简单易实现，成熟稳定  |   主要适用于Web应用，移动端支持有限  |
| SAML协议 | 企业级跨域认证 |  标准化程度高，安全性强  |   配置复杂，XML处理繁琐  |
| OIDC认证 | 现代化应用，第三方集成 |  基于JSON，易于集成需要理解  |   OAuth 2.0基础  |
| JWT管理 | 微服务架构，API认证 |  无状态，可扩展性好  |   Token安全存储和刷新机制重要  |
| 单点登出 | 多系统统一退出 |  提升安全性和用户体验  |   网络依赖，需要处理超时和失败  |

## 🎯 实战应用建议 ##

### 最佳实践 ###

- CAS协议应用：适合传统企业内部系统，实现简单，维护成本低
- SAML协议应用：大型企业与第三方系统集成的首选，安全性要求高的场景
- OIDC认证应用：现代化应用的标准选择，特别适合移动端和SPA应用
- JWT管理应用：微服务架构中的核心认证机制，需要完善的生命周期管理
- 单点登出应用：所有SSO系统都应该实现，确保安全性和用户体验

### 性能考虑 ###

- 缓存策略：合理缓存用户信息和权限数据，减少认证服务器压力
- 负载均衡：认证服务器需要支持高并发，考虑集群部署
- 网络优化：减少认证过程中的网络往返次数

### 安全注意事项 ###

- HTTPS强制：所有认证相关的通信必须使用HTTPS
- Token安全：访问令牌存储在内存，刷新令牌使用httpOnly cookie
- 防重放攻击：使用nonce、timestamp等机制防止重放攻击

## 💡 总结 ##

这5个单点登录技巧在现代应用开发中极其重要，掌握它们能让你的认证系统：

- CAS协议实现：提供简单可靠的企业级认证解决方案
- SAML协议实现：实现标准化的跨域身份联合
- OIDC认证实现：构建现代化的身份认证体系
- JWT Token管理：提供无状态、可扩展的认证机制
- 单点登出机制：确保安全的全局退出体验

希望这些技巧能帮助你在SSO开发中构建更安全、更高效的单点登录系统！

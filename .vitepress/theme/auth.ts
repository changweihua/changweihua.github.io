// 存储登录 token 的 key
const AUTH_TOKEN_KEY = "auth_token";

// 保存登录状态
export function setAuthToken(token) {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

// 检查是否登录
export function isLoggedIn() {
  if (typeof window !== "undefined") {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  }
  return false;
}

// 清除登录状态
export function clearAuth() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

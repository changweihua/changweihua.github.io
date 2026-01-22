// .vitepress/theme/mermaid-theme.ts
import { MermaidConfig } from 'mermaid'

// 浅色主题配置
export const lightMermaidConfig: MermaidConfig = {
  theme: 'base',
  themeVariables: {
    primaryColor: '#ffffff',
    primaryBorderColor: 'rgba(180, 145, 121, 0.5)',
    primaryTextColor: '#213547',
    secondaryColor: '#f9f9f9',
    secondaryBorderColor: '#e2e8f0',
    secondaryTextColor: '#5d6c7a',
    lineColor: 'rgba(180, 145, 121, 0.5)',
    fontSize: '16px',
    nodeBkg: '#ffffff',
    mainBkg: '#ffffff',
    nodeTextColor: '#213547',
    labelBackground: '#f9f9f9',
    labelBorderColor: '#e2e8f0',
    labelTextColor: '#5d6c7a',
    clusterBkg: '#f9f9f9',
    clusterBorder: '#e2e8f0',
    titleColor: '#213547',
    noteBkgColor: 'rgba(240, 141, 73, 0.1)',
    noteTextColor: '#213547',
    noteBorderColor: '#d97706',
    successColor: '#3eaf7c',
    warningColor: '#f08d49',
    errorColor: '#e3553a',
    infoColor: '#3b82f6',
  },
}

// 深色主题配置
export const darkMermaidConfig: MermaidConfig = {
  theme: 'dark',
  themeVariables: {
    primaryColor: '#1a1a1a',
    primaryBorderColor: 'rgba(180, 145, 121, 0.5)',
    primaryTextColor: '#e4e6eb',
    secondaryColor: '#242424',
    secondaryBorderColor: '#3a3a3a',
    secondaryTextColor: '#b0b3b8',
    lineColor: 'rgba(180, 145, 121, 0.5)',
    fontSize: '16px',
    nodeBkg: '#1a1a1a',
    mainBkg: '#1a1a1a',
    nodeTextColor: '#e4e6eb',
    labelBackground: '#242424',
    labelBorderColor: '#3a3a3a',
    labelTextColor: '#b0b3b8',
    clusterBkg: '#242424',
    clusterBorder: '#3a3a3a',
    titleColor: '#e4e6eb',
    noteBkgColor: 'rgba(240, 141, 73, 0.2)',
    noteTextColor: '#e4e6eb',
    noteBorderColor: '#f08d49',
    successColor: '#3eaf7c',
    warningColor: '#f08d49',
    errorColor: '#e3553a',
    infoColor: '#3b82f6',
  },
}

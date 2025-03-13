---
lastUpdated: true
commentabled: true
recommended: true
title: vite-plugin-pwa
description: vite-plugin-pwa
date: 2025-03-13 10:00:00
pageClass: blog-page-class
---

# vite-plugin-pwa #

vite-plugin-pwa 是一个用于在 Vite 项目中快速集成 PWA（Progressive Web App，渐进式 Web 应用）的插件。它帮助开发者轻松地将应用转变为一个支持离线功能、缓存、Web App 安装等特性的现代 Web 应用。
主要功能和作用

生成 service worker




vite-plugin-pwa 自动生成和配置一个 service worker，它用于缓存资源并提供离线支持。通过 service worker，应用可以在没有网络连接时继续运行，提供更好的用户体验。




离线缓存




通过配置，插件会自动缓存应用中的静态资源（如 HTML、CSS、JavaScript 文件等）。这样，用户在首次访问网站后，即使没有网络，也能继续使用应用。




Web App 安装支持




vite-plugin-pwa 会生成一个 manifest.json 文件，使得应用支持像原生 App 一样的安装功能。用户可以通过浏览器的安装提示将应用“添加到主屏幕”，从而以类似本地应用的方式运行。




推送通知




插件还支持与推送通知相关的功能（例如，与 Service Worker 配合使用推送通知）。




自动生成图标和应用启动画面




插件会自动为你的应用生成适合不同设备的图标，并支持不同屏幕尺寸的启动画面。




PWA 缓存策略配置




提供了灵活的缓存策略配置，允许开发者自定义哪些资源需要缓存、缓存的策略（如缓存优先、网络优先等）。




安装与配置

安装插件
使用以下命令安装 vite-plugin-pwa：

css 代码解读复制代码npm install vite-plugin-pwa --save-dev


配置 vite.config.js
在 vite.config.js 中配置 vite-plugin-pwa：

php 代码解读复制代码import { defineConfig } from 'vite';
import VitePWA from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',  // 配置 service worker 的注册方式
      includeAssets: ['favicon.svg', 'robots.txt'],  // 指定需要包含的静态资源
      manifest: {
        name: 'My PWA App',
        short_name: 'My App',
        description: 'A progressive web app built with Vite',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});

主要配置项：



registerType: 指定 service worker 的注册方式，常见的选项是 autoUpdate（自动更新）和 prompt（提示用户更新）。
includeAssets: 指定除了 index.html 和 JS/CSS 外需要缓存的其他静态资源。
manifest: 用于配置 PWA 的 manifest.json 文件，包括应用名称、图标、启动画面、主题色等。




生成图标和启动画面
你需要提供图标文件，例如 icons/icon-192x192.png 和 icons/icon-512x512.png，这些图标将用于 PWA 安装时显示。


插件的工作原理

Service Worker




vite-plugin-pwa 会自动为你的项目生成并注册一个 service worker，它将负责缓存静态资源、处理离线请求并提供推送通知等功能。




Manifest 文件




通过配置的 manifest，插件生成一个 manifest.json 文件，包含了应用名称、图标、启动画面、主题色等元数据，使得你的应用能够支持 Web App 安装功能。




缓存策略




service worker 根据插件的配置缓存应用的资源。当用户第一次访问时，资源会被缓存到浏览器的缓存存储中。之后用户可以在离线状态下使用该应用，或者在下次访问时快速加载缓存资源。




自动更新




插件支持自动更新 service worker，确保用户每次访问时都能使用最新的缓存和更新后的资源。




为什么使用 vite-plugin-pwa

提升用户体验：PWA 使得 Web 应用能够离线工作，提升了应用的稳定性，尤其是在网络不稳定或没有网络的情况下。
Web App 安装功能：通过生成 manifest.json，用户可以将 Web 应用添加到主屏幕，仿佛是一个原生应用，提升了用户参与度。
性能提升：通过缓存资源，PWA 可以显著减少重复的网络请求，提高应用加载速度。
易于集成：vite-plugin-pwa 是一个简单易用的插件，轻松集成到 Vite 项目中，无需过多的配置。


总结
vite-plugin-pwa 是一个非常实用的插件，它帮助 Vite 项目轻松实现 PWA 的特性，提供离线支持、Web App 安装、缓存策略等功能。通过简单的配置，你可以让你的 Web 应用具备更好的用户体验和性能，类似于原生应用的行为。

作者：LEOOOOOOOO
链接：https://juejin.cn/post/7449012909876789263
来源：稀土掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

<template>
  <div>
<div class="min-h-screen bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-300 relative overflow-hidden font-sans">

    <!-- iOS风格光晕背景 -->
    <div class="absolute inset-0 bg-gradient-to-br from-blue-100/80 via-indigo-100/70 to-purple-200/80"></div>
    <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/35 to-indigo-400/30 rounded-full blur-3xl"></div>
    <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-indigo-400/30 to-purple-400/35 rounded-full blur-3xl"></div>

    <!-- 顶部导航栏 -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/70">
        <div class="container mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <!-- Logo区域 -->
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-2xl bg-white/50 backdrop-blur-sm
                               shadow-[0_4px_16px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,0.6)]
                               border border-white/60 relative overflow-hidden">
                        <div class="absolute inset-0 flex items-center justify-center">
                            <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                        </div>

                    </div>
                    <h1 class="text-xl font-bold text-gray-800">LiquidWeb</h1>
                </div>

                <!-- 导航菜单 -->
                <div class="hidden md:flex items-center gap-6">
                    <a href="#" class="text-gray-700 hover:text-gray-900 transition-colors duration-200">首页</a>
                    <a href="#" class="text-gray-700 hover:text-gray-900 transition-colors duration-200">产品</a>
                    <a href="#" class="text-gray-700 hover:text-gray-900 transition-colors duration-200">服务</a>
                    <a href="#" class="text-gray-700 hover:text-gray-900 transition-colors duration-200">关于</a>
                </div>

                <!-- 用户操作按钮组 -->
                <div class="flex items-center gap-3">
                    <div class="relative px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl border border-white/70
                               shadow-[0_4px_16px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.6)]
                               hover:bg-white/70 transition-all duration-200 cursor-pointer">
                        <span class="text-gray-700 font-medium">登录</span>

                    </div>
                    <div class="relative px-4 py-2 bg-white/70 backdrop-blur-sm rounded-xl border border-white/80
                               shadow-[0_4px_16px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.7)]
                               hover:bg-white/80 transition-all duration-200 cursor-pointer">
                        <span class="text-gray-800 font-medium">注册</span>

                    </div>
                </div>
            </div>
        </div>

    </nav>

    <!-- 主要内容区域 -->
    <main class="pt-24 pb-12 z-50 relative">

        <!-- Hero区域 -->
        <section class="container mx-auto px-6 py-20 text-center">
            <div class="max-w-4xl mx-auto animate-slide-in">
                <!-- 主标题 -->
                <h2 class="text-5xl md:text-7xl font-bold text-gray-800 mb-8 leading-tight animate-gentle-float">
                    现代化Web设计
                    <span class="bg-gradient-to-r from-violet-600 to-purple-700 bg-clip-text text-transparent">新体验</span>
                </h2>

                <!-- 副标题 -->
                <p class="text-xl text-white mb-12 leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                    基于Liquid Glass设计语言，打造优雅、现代的用户界面体验
                </p>

                <!-- 操作按钮组 -->
                <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                    <div class="relative px-8 py-4 bg-white/60 backdrop-blur-2xl border border-white/70 rounded-2xl
                               shadow-[0_4px_20px_rgba(0,0,0,0.1)]
                               hover:bg-white/70 hover:scale-105 transition-all duration-300 cursor-pointer active:scale-95">
                        <span class="text-gray-800 font-semibold text-lg">立即体验</span>
                    </div>
                    <div class="relative px-8 py-4 bg-white/50 backdrop-blur-2xl border border-white/60 rounded-2xl
                               shadow-[0_4px_20px_rgba(0,0,0,0.1)]
                               hover:bg-white/60 hover:scale-105 transition-all duration-300 cursor-pointer active:scale-95">
                        <span class="text-gray-700 font-semibold text-lg">了解更多</span>
                    </div>
                </div>

                <!-- 特性卡片预览 -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
                    <!-- 设计特性 -->
                    <div class="bg-white/60 backdrop-blur-2xl backdrop-saturate-150 border border-white/50 rounded-3xl p-8
                                shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_20px_rgba(255,255,255,0.1)]
                                hover:bg-white/80 hover:scale-105 transition-all duration-300 animate-gentle-float delay-200">

                        <!-- 图标 -->
                        <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-2xl mb-6 mx-auto
                                   shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.6)]
                                   relative overflow-hidden backdrop-blur-sm">
                            <div class="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                            <div class="absolute inset-0 flex items-center justify-center">
                                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"></path>
                                </svg>
                            </div>
                        </div>

                        <h3 class="text-xl font-bold text-black/80 mb-4">响应式设计</h3>
                        <p class="text-black/30 leading-relaxed">
                            适配所有设备尺寸，确保在手机、平板、桌面端都有完美的显示效果。
                        </p>

                        <!-- 内部高光 -->
                        <div class="absolute top-1 left-1 right-1 h-4 bg-white/15 rounded-t-3xl blur-sm"></div>
                    </div>

                    <!-- 性能特性 -->
                    <div class="bg-white/60 backdrop-blur-2xl backdrop-saturate-150 border border-white/50 rounded-3xl p-8
                                shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_20px_rgba(255,255,255,0.1)]
                                hover:bg-white/80 hover:scale-105 transition-all duration-300 animate-gentle-float delay-200">

                        <!-- 图标 -->
                        <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl mb-6 mx-auto
                                   shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.6)]
                                   relative overflow-hidden backdrop-blur-sm">
                            <div class="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                            <div class="absolute inset-0 flex items-center justify-center">
                                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                            </div>
                        </div>

                        <h3 class="text-xl font-bold text-black/80 mb-4">高性能渲染</h3>
                        <p class="text-black/30 leading-relaxed">
                            GPU加速的实时渲染技术，确保液态玻璃效果的流畅性能表现。
                        </p>

                        <!-- 内部高光 -->
                        <div class="absolute top-1 left-1 right-1 h-4 bg-white/15 rounded-t-3xl blur-sm"></div>
                    </div>

                    <!-- 体验特性 -->
                    <div class="bg-white/60 backdrop-blur-2xl backdrop-saturate-150 border border-white/50 rounded-3xl p-8
                                shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_20px_rgba(255,255,255,0.1)]
                                hover:bg-white/80 hover:scale-105 transition-all duration-300 animate-gentle-float delay-200">

                        <!-- 图标 -->
                        <div class="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-600 rounded-2xl mb-6 mx-auto
                                   shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.6)]
                                   relative overflow-hidden backdrop-blur-sm">
                            <div class="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                            <div class="absolute inset-0 flex items-center justify-center">
                                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                </svg>
                            </div>
                        </div>

                        <h3 class="text-xl font-bold text-black/80 mb-4">用户体验</h3>
                        <p class="text-black/30 leading-relaxed">
                            直观的交互设计和优雅的动画效果，提供愉悦的用户体验。
                        </p>

                        <!-- 内部高光 -->
                        <div class="absolute top-1 left-1 right-1 h-4 bg-white/15 rounded-t-3xl blur-sm"></div>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <!-- 浮动通知 -->
    <div class="fixed top-20 right-8 z-40 bg-green-500/80 backdrop-blur-2xl backdrop-saturate-150
                border border-white/20 rounded-2xl p-4 shadow-[0_8px_32px_rgba(34,197,94,0.4)]
                transform translate-x-full transition-transform duration-500" id="notification">
        <div class="flex items-center gap-3">
            <div class="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
            <span class="text-white font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">欢迎体验LiquidWeb！</span>
        </div>
        <!-- 顶部高光 -->
        <div class="absolute top-1 left-1 right-1 h-2 bg-white/25 rounded-t-xl blur-sm"></div>
    </div>
  </div>


    <div
      class="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 relative overflow-hidden flex items-center justify-center p-8 font-sans"
    >
      <!-- iOS风格光晕背景 -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80"
      ></div>
      <div
        class="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-violet-300/40 to-blue-300/40 rounded-full blur-3xl"
      ></div>
      <div
        class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-300/40 to-pink-300/40 rounded-full blur-3xl"
      ></div>

      <!-- 品牌展示区域 -->
      <div class="text-center relative z-10">
        <!-- 主品牌LOGO -->
        <div class="relative inline-block mb-8">
          <div
            class="relative w-24 h-24 rounded-3xl overflow-hidden bg-white/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,0.6)]"
          >
            <!-- LOGO图标 -->
            <div class="absolute inset-0 flex items-center justify-center">
              <svg
                class="w-10 h-10 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- 品牌文字 -->
        <h1 class="text-4xl font-bold text-gray-800 mb-2">LiquidWeb</h1>
        <p class="text-gray-600 text-lg">现代Web设计工作室</p>

        <!-- iOS风格按钮组 -->
        <div class="flex justify-center gap-4 mt-12">
          <!-- 按钮1 -->
          <div
            class="relative w-16 h-16 rounded-2xl bg-white/50 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.12)] flex items-center justify-center transition-all duration-200 hover:bg-white/60 active:scale-95"
          >
            <svg
              class="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              ></path>
            </svg>
          </div>

          <!-- 按钮2 -->
          <div
            class="relative w-16 h-16 rounded-2xl bg-white/50 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.12)] flex items-center justify-center transition-all duration-200 hover:bg-white/60 active:scale-95"
          >
            <svg
              class="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              ></path>
            </svg>
          </div>

          <!-- 按钮3 -->
          <div
            class="relative w-16 h-16 rounded-2xl bg-white/50 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.12)] flex items-center justify-center transition-all duration-200 hover:bg-white/60 active:scale-95"
          >
            <svg
              class="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div
      class="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-200 via-blue-200 to-indigo-200 p-8 font-sans"
    >
      <!-- iOS风格光晕背景 -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-slate-100/80 via-blue-100/60 to-indigo-100/80"
      ></div>
      <div
        class="absolute top-1/3 left-1/3 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl"
      ></div>
      <div
        class="absolute right-1/3 bottom-1/3 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-3xl"
      ></div>

      <!-- Web应用卡片展示 -->
      <div class="relative z-10 mx-auto max-w-6xl">
        <div class="mb-12 text-center">
          <h1 class="mb-4 text-4xl font-bold text-gray-900">Web应用组件库</h1>
          <p class="text-lg text-gray-700">现代化液态玻璃设计</p>
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <!-- 产品展示卡片 -->
          <div
            class="relative overflow-hidden rounded-3xl border border-white/40 bg-white/20 p-6 shadow-[0_8px_32px_rgba(31,38,135,0.08),inset_0_1px_2px_rgba(255,255,255,0.6)] backdrop-blur-2xl backdrop-saturate-180 transition-all duration-300 hover:bg-white/25"
          >
            <!-- 产品图片区域 -->
            <div
              class="relative mb-4 h-40 w-full overflow-hidden rounded-2xl border border-white/50 bg-white/30 shadow-[0_4px_16px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.4)] backdrop-blur-sm"
            >
              <div class="absolute inset-0 flex items-center justify-center">
                <svg
                  class="h-12 w-12 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
            </div>

            <!-- 产品信息 -->
            <div class="mb-4">
              <h3 class="mb-2 text-xl font-bold text-gray-900">设计工具</h3>
              <p class="text-sm leading-relaxed text-gray-700">
                专业的UI/UX设计工具，支持现代化的液态玻璃效果设计。
              </p>
            </div>

            <!-- 价格和按钮 -->
            <div class="flex items-center justify-between">
              <span class="text-2xl font-bold text-gray-900">¥299</span>
              <div
                class="relative cursor-pointer rounded-xl bg-blue-500/90 px-6 py-2 backdrop-blur-sm transition-all duration-200 hover:bg-blue-500 active:scale-95"
              >
                <span class="font-medium text-white">购买</span>
              </div>
            </div>
          </div>

          <!-- 团队成员卡片 -->
          <div
            class="relative overflow-hidden rounded-3xl border border-white/40 bg-white/20 p-6 shadow-[0_8px_32px_rgba(31,38,135,0.08),inset_0_1px_2px_rgba(255,255,255,0.6)] backdrop-blur-2xl backdrop-saturate-180 transition-all duration-300 hover:scale-105 hover:bg-white/25"
          >
            <!-- 头像 -->
            <div
              class="relative mx-auto mb-4 h-20 w-20 overflow-hidden rounded-2xl bg-blue-500 shadow-[0_8px_24px_rgba(59,130,246,0.3)]"
            >
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-2xl font-bold text-white">李</span>
              </div>
            </div>

            <!-- 成员信息 -->
            <div class="mb-4 text-center">
              <h3 class="mb-1 text-xl font-bold text-gray-900">李设计师</h3>
              <p class="text-sm text-gray-600">UI/UX 设计总监</p>
            </div>

            <!-- 技能标签 -->
            <div class="mb-4 flex flex-wrap justify-center gap-2">
              <span
                class="rounded-full border border-white/40 bg-white/25 px-3 py-1 text-xs text-gray-700 backdrop-blur-sm"
                >Figma</span
              >
              <span
                class="rounded-full border border-white/40 bg-white/25 px-3 py-1 text-xs text-gray-700 backdrop-blur-sm"
                >Sketch</span
              >
              <span
                class="rounded-full border border-white/40 bg-white/25 px-3 py-1 text-xs text-gray-700 backdrop-blur-sm"
                >PS</span
              >
            </div>

            <!-- 联系按钮 -->
            <button
              class="w-full rounded-xl bg-pink-500/90 py-3 font-medium text-white backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-pink-500"
            >
              联系我们
            </button>
          </div>

          <!-- 数据统计卡片 -->
          <div
            class="relative overflow-hidden rounded-3xl border border-white/40 bg-white/20 p-6 shadow-[0_8px_32px_rgba(31,38,135,0.08),inset_0_1px_2px_rgba(255,255,255,0.6)] backdrop-blur-2xl backdrop-saturate-180 transition-all duration-300 hover:scale-105 hover:bg-white/25"
          >
            <!-- 图表区域 -->
            <div
              class="relative mb-4 h-32 overflow-hidden rounded-2xl border border-white/50 bg-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] backdrop-blur-sm"
            >
              <!-- 模拟图表线 -->
              <svg class="absolute inset-0 h-full w-full" viewBox="0 0 200 100">
                <path
                  d="M20,80 Q60,20 100,40 T180,30"
                  stroke="#3B82F6"
                  stroke-width="3"
                  fill="none"
                />
                <circle cx="20" cy="80" r="4" fill="#3B82F6" />
                <circle cx="100" cy="40" r="4" fill="#3B82F6" />
                <circle cx="180" cy="30" r="4" fill="#3B82F6" />
              </svg>
            </div>

            <!-- 统计数据 -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-700">总访问量</span>
                <span class="text-lg font-bold text-gray-900">125,430</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-700">活跃用户</span>
                <span class="text-lg font-bold text-gray-900">8,924</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-700">转化率</span>
                <span class="text-lg font-bold text-green-600">+12.5%</span>
              </div>
            </div>

            <!-- 查看详情按钮 -->
            <button
              class="mt-4 w-full rounded-xl bg-gray-600/90 py-2 font-medium text-white backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-gray-600"
            >
              查看详情
            </button>
          </div>

          <!-- 功能特性卡片 -->
          <div
            class="relative overflow-hidden rounded-3xl border border-white/40 bg-white/20 p-6 shadow-[0_8px_32px_rgba(31,38,135,0.08),inset_0_1px_2px_rgba(255,255,255,0.6)] backdrop-blur-2xl backdrop-saturate-180 transition-all duration-300 hover:scale-105 hover:bg-white/25"
          >
            <!-- 功能图标 -->
            <div
              class="relative mx-auto mb-4 h-16 w-16 overflow-hidden rounded-2xl bg-green-500 shadow-[0_8px_24px_rgba(34,197,94,0.3)]"
            >
              <div class="absolute inset-0 flex items-center justify-center">
                <svg
                  class="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  ></path>
                </svg>
              </div>
            </div>

            <!-- 功能描述 -->
            <div class="mb-4 text-center">
              <h3 class="mb-2 text-xl font-bold text-gray-900">高性能渲染</h3>
              <p class="text-sm leading-relaxed text-gray-700">
                基于GPU加速的实时渲染技术，确保玻璃效果的流畅性能表现。
              </p>
            </div>

            <!-- 特性列表 -->
            <div class="mb-4 space-y-2">
              <div class="flex items-center gap-3">
                <div class="h-2 w-2 rounded-full bg-green-500"></div>
                <span class="text-sm text-gray-700">60fps 流畅动画</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="h-2 w-2 rounded-full bg-green-500"></div>
                <span class="text-sm text-gray-700">硬件加速</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="h-2 w-2 rounded-full bg-green-500"></div>
                <span class="text-sm text-gray-700">跨平台兼容</span>
              </div>
            </div>

            <!-- 了解更多按钮 -->
            <button
              class="w-full rounded-xl bg-green-500/90 py-2 font-medium text-white backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-green-500"
            >
              了解更多
            </button>
          </div>

          <!-- 通知消息卡片 -->
          <div
            class="relative overflow-hidden rounded-3xl border border-white/40 bg-white/20 p-6 shadow-[0_8px_32px_rgba(31,38,135,0.08),inset_0_1px_2px_rgba(255,255,255,0.6)] backdrop-blur-2xl backdrop-saturate-180 transition-all duration-300 hover:scale-105 hover:bg-white/25"
          >
            <!-- 通知标题 -->
            <div class="mb-4 flex items-center gap-3">
              <div
                class="h-3 w-3 animate-pulse rounded-full bg-orange-400"
              ></div>
              <h3 class="text-lg font-bold text-gray-900">系统通知</h3>
            </div>

            <!-- 通知列表 -->
            <div class="mb-4 space-y-3">
              <div
                class="flex items-start gap-3 rounded-xl border border-white/40 bg-white/25 p-3 backdrop-blur-sm"
              >
                <div
                  class="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-400"
                ></div>
                <div>
                  <p class="text-sm font-medium text-gray-900">版本更新</p>
                  <p class="mt-1 text-xs text-gray-600">
                    新版本已发布，包含性能优化
                  </p>
                </div>
              </div>
              <div
                class="flex items-start gap-3 rounded-xl border border-white/40 bg-white/25 p-3 backdrop-blur-sm"
              >
                <div
                  class="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-400"
                ></div>
                <div>
                  <p class="text-sm font-medium text-gray-900">备份完成</p>
                  <p class="mt-1 text-xs text-gray-600">数据备份已成功完成</p>
                </div>
              </div>
            </div>

            <!-- 查看全部按钮 -->
            <button
              class="w-full rounded-xl bg-gray-600/90 py-2 font-medium text-white backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-gray-600"
            >
              查看全部
            </button>
          </div>

          <!-- 设置面板卡片 -->
          <div
            class="relative overflow-hidden rounded-3xl border border-white/40 bg-white/20 p-6 shadow-[0_8px_32px_rgba(31,38,135,0.08),inset_0_1px_2px_rgba(255,255,255,0.6)] backdrop-blur-2xl backdrop-saturate-180 transition-all duration-300 hover:scale-105 hover:bg-white/25"
          >
            <!-- 设置标题 -->
            <h3 class="mb-4 text-xl font-bold text-gray-900">偏好设置</h3>

            <!-- 设置选项 -->
            <div class="space-y-4">
              <!-- 主题切换 -->
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-700">深色模式</span>
                <div
                  class="h-6 w-12 rounded-full border border-white/50 bg-white/30 p-1"
                >
                  <div
                    class="ml-auto h-4 w-4 rounded-full bg-white shadow-sm"
                  ></div>
                </div>
              </div>

              <!-- 通知设置 -->
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-700">推送通知</span>
                <div
                  class="h-6 w-12 rounded-full border border-blue-400/60 bg-blue-500/90 p-1"
                >
                  <div class="h-4 w-4 rounded-full bg-white shadow-sm"></div>
                </div>
              </div>

              <!-- 音效设置 -->
              <div>
                <div class="mb-2 flex items-center justify-between">
                  <span class="text-sm text-gray-700">音效音量</span>
                  <span class="text-xs text-gray-600">75%</span>
                </div>
                <div
                  class="h-2 w-full rounded-full border border-white/40 bg-white/30"
                >
                  <div
                    class="h-full w-3/4 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"
                  ></div>
                </div>
              </div>
            </div>

            <!-- 保存按钮 -->
            <button
              class="mt-6 w-full rounded-xl bg-gradient-to-r from-purple-500/90 to-blue-600/90 py-2 font-medium text-white backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:from-purple-500 hover:to-blue-600"
            >
              保存设置
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      class="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-300 via-gray-300 to-blue-300 p-8 font-sans"
    >
      <!-- iOS 26液态背景 -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-slate-200/80 via-gray-200/70 to-blue-200/80"
      ></div>
      <div
        class="absolute top-1/4 left-1/5 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-blue-400/15 to-indigo-400/15 blur-3xl"
      ></div>
      <div
        class="absolute right-1/5 bottom-1/4 h-80 w-80 animate-pulse rounded-full bg-gradient-to-br from-purple-400/15 to-pink-400/15 blur-3xl delay-1000"
      ></div>

      <!-- Web按钮组件展示 -->
      <div class="relative z-10 mx-auto max-w-6xl">
        <div class="mb-12 text-center">
          <h1 class="mb-4 text-4xl font-bold text-gray-800">
            iOS 26液态玻璃按钮
          </h1>
          <p class="text-lg text-gray-600">现代化交互体验设计</p>
        </div>

        <div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <!-- Web应用导航栏 -->
          <div class="space-y-6">
            <h3 class="text-2xl font-bold text-gray-800">Web应用导航栏</h3>

            <!-- 导航栏示例 -->
            <div
              class="relative rounded-2xl border-0 bg-white/30 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.5)] backdrop-blur-xl backdrop-saturate-150"
            >
              <div class="flex items-center justify-between">
                <!-- Logo -->
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600"
                  >
                    <span class="text-sm font-bold text-white">W</span>
                  </div>
                  <span class="font-semibold text-gray-800">WebApp</span>
                </div>

                <!-- 导航菜单 -->
                <div class="hidden items-center gap-6 md:flex">
                  <a
                    href="#"
                    class="text-gray-700 transition-colors duration-200 hover:text-gray-900"
                    >首页</a
                  >
                  <a
                    href="#"
                    class="text-gray-700 transition-colors duration-200 hover:text-gray-900"
                    >产品</a
                  >
                  <a
                    href="#"
                    class="text-gray-700 transition-colors duration-200 hover:text-gray-900"
                    >服务</a
                  >
                  <a
                    href="#"
                    class="text-gray-700 transition-colors duration-200 hover:text-gray-900"
                    >关于</a
                  >
                </div>

                <!-- 操作按钮 -->
                <div class="flex items-center gap-3">
                  <button
                    class="group relative rounded-xl bg-white/40 px-4 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.6)] backdrop-blur-sm transition-all duration-300 ease-out hover:scale-105 hover:bg-white/60 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:scale-95"
                  >
                    <span class="font-medium text-gray-700">登录</span>
                    <div
                      class="absolute top-1 left-1 h-2 w-2 rounded-full bg-white/40 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100"
                    ></div>
                  </button>

                  <button
                    class="group relative rounded-xl bg-blue-500/80 px-4 py-2 shadow-[0_2px_8px_rgba(0，0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.7)] backdrop-blur-sm transition-all duration-300 ease-out hover:scale-105 hover:bg-blue-500 hover:shadow-[0_4px_16px_rgba(59,130,246,0.4)] active:scale-95"
                  >
                    <span class="font-medium text-white">注册</span>
                    <div
                      class="absolute top-1 left-1 h-2 w-2 rounded-full bg-white/60 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100"
                    ></div>
                  </button>
                </div>
              </div>
            </div>

            <!-- Web表单按钮组 -->
            <div class="space-y-4">
              <h4 class="text-lg font-semibold text-gray-800">表单操作按钮</h4>
              <div class="grid grid-cols-2 gap-4">
                <!-- 提交按钮 -->
                <button
                  class="group relative rounded-xl bg-green-500/80 p-3 shadow-[0_3px_12px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.7)] backdrop-blur-sm transition-all duration-300 ease-out hover:scale-105 hover:bg-green-500 hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] active:scale-95"
                >
                  <div class="flex items-center justify-center gap-2">
                    <svg
                      class="h-5 w-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span class="font-medium text-white">提交表单</span>
                  </div>
                  <div
                    class="absolute top-1 left-2 h-3 w-3 rounded-full bg-white/50 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100"
                  ></div>
                </button>

                <!-- 重置按钮 -->
                <button
                  class="group relative rounded-xl bg-white/40 p-3 shadow-[0_3px_12px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.6)] backdrop-blur-sm transition-all duration-300 ease-out hover:scale-105 hover:bg-white/60 hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] active:scale-95"
                >
                  <div class="flex items-center justify-center gap-2">
                    <svg
                      class="h-5 w-5 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span class="font-medium text-gray-700">重置</span>
                  </div>
                  <div
                    class="absolute top-1 left-2 h-3 w-3 rounded-full bg-white/40 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100"
                  ></div>
                </button>
              </div>
            </div>
          </div>

          <!-- Web控制面板 -->
          <div class="space-y-6">
            <h3 class="text-2xl font-bold text-gray-800">Web控制面板</h3>

            <!-- 管理面板操作区 -->
            <div
              class="relative rounded-2xl bg-white/30 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.5)] backdrop-blur-xl backdrop-saturate-150"
            >
              <div class="space-y-4">
                <!-- 面板标题 -->
                <div class="flex items-center justify-between">
                  <h4 class="text-lg font-semibold text-gray-800">系统控制</h4>
                  <div class="flex items-center gap-2">
                    <div
                      class="h-2 w-2 animate-pulse rounded-full bg-green-500"
                    ></div>
                    <span class="text-sm text-gray-600">运行中</span>
                  </div>
                </div>

                <!-- 快速操作按钮组 -->
                <div class="grid grid-cols-3 gap-3">
                  <button
                    class="group relative rounded-xl bg-white/40 p-4 shadow-[0_3px_12px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.6)] backdrop-blur-sm transition-all duration-300 ease-out hover:scale-105 hover:bg-white/60 hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] active:scale-95"
                  >
                    <div class="text-center">
                      <svg
                        class="mx-auto mb-2 h-6 w-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      <span class="text-sm font-medium text-gray-700"
                        >数据统计</span
                      >
                    </div>
                    <div
                      class="absolute top-1 left-1 h-2 w-2 rounded-full bg-white/50 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100"
                    ></div>
                  </button>

                  <button
                    class="group relative rounded-xl bg-white/40 p-4 shadow-[0_3px_12px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.6)] backdrop-blur-sm transition-all duration-300 ease-out hover:scale-105 hover:bg-white/60 hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] active:scale-95"
                  >
                    <div class="text-center">
                      <svg
                        class="mx-auto mb-2 h-6 w-6 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span class="text-sm font-medium text-gray-700"
                        >系统设置</span
                      >
                    </div>
                    <div
                      class="absolute top-1 left-1 h-2 w-2 rounded-full bg-white/50 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100"
                    ></div>
                  </button>

                  <button
                    class="group relative rounded-xl bg-white/40 p-4 shadow-[0_3px_12px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.6)] backdrop-blur-sm transition-all duration-300 ease-out hover:scale-105 hover:bg-white/60 hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] active:scale-95"
                  >
                    <div class="text-center">
                      <svg
                        class="mx-auto mb-2 h-6 w-6 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span class="text-sm font-medium text-gray-700"
                        >添加内容</span
                      >
                    </div>
                    <div
                      class="absolute top-1 left-1 h-2 w-2 rounded-full bg-white/50 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100"
                    ></div>
                  </button>
                </div>
              </div>
            </div>

            <!-- Tab切换器 -->
            <div class="space-y-4">
              <h4 class="text-lg font-semibold text-gray-800">内容分类Tab</h4>
              <div
                class="relative rounded-2xl bg-white/30 p-2 shadow-[0_4px_20px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.5)] backdrop-blur-xl backdrop-saturate-150"
              >
                <div class="flex items-center gap-2">
                  <!-- 活跃Tab -->
                  <button
                    class="group relative h-10 flex-1 rounded-xl bg-white/60 shadow-[0_2px_8px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.8)] backdrop-blur-sm transition-all duration-300 ease-out"
                  >
                    <span class="font-medium text-gray-800">文章管理</span>
                    <div
                      class="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/10 to-transparent"
                    ></div>
                  </button>

                  <!-- 普通Tab -->
                  <button
                    class="group relative h-10 flex-1 rounded-xl transition-all duration-300 ease-out hover:scale-102 hover:bg-white/40 hover:shadow-[0_3px_12px_rgba(0,0,0,0.08)] active:scale-95"
                  >
                    <span class="font-medium text-gray-600">用户管理</span>
                    <div
                      class="absolute top-1 left-2 h-2 w-2 rounded-full bg-white/40 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100"
                    ></div>
                  </button>

                  <button
                    class="group relative h-10 flex-1 rounded-xl transition-all duration-300 ease-out hover:scale-102 hover:bg-white/40 hover:shadow-[0_3px_12px_rgba(0,0,0,0.08)] active:scale-95"
                  >
                    <span class="font-medium text-gray-600">系统日志</span>
                    <div
                      class="absolute top-1 left-2 h-2 w-2 rounded-full bg-white/40 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100"
                    ></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Web数据展示区域 -->
        <div class="space-y-8">
          <h3 class="mb-6 text-2xl font-bold text-gray-800">Web数据展示组件</h3>

          <!-- 仪表盘统计卡片 -->
          <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
            <!-- 访问量统计 -->
            <div
              class="group relative rounded-2xl bg-white/30 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.5)] backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 ease-out hover:scale-105 hover:bg-white/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] active:scale-95"
            >
              <div class="mb-4 flex items-center justify-between">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/80 shadow-[0_4px_16px_rgba(59,130,246,0.3)] backdrop-blur-sm transition-transform duration-300 group-hover:scale-110"
                >
                  <svg
                    class="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <span class="text-2xl font-bold text-gray-800">12.5K</span>
              </div>
              <div>
                <h4 class="mb-1 font-medium text-gray-700">页面访问量</h4>
                <p class="text-sm font-medium text-green-600">+8.2% 较上月</p>
              </div>
              <div
                class="absolute top-2 left-2 h-3 w-3 rounded-full bg-white/50 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100"
              ></div>
            </div>

            <!-- 用户数量 -->
            <div
              class="group relative rounded-2xl bg-white/30 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.5)] backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 ease-out hover:scale-105 hover:bg-white/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] active:scale-95"
            >
              <div class="mb-4 flex items-center justify-between">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/80 shadow-[0_4px_16px_rgba(34,197,94,0.3)] backdrop-blur-sm transition-transform duration-300 group-hover:scale-110"
                >
                  <svg
                    class="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <span class="text-2xl font-bold text-gray-800">3.2K</span>
              </div>
              <div>
                <h4 class="mb-1 font-medium text-gray-700">活跃用户</h4>
                <p class="text-sm font-medium text-green-600">+12.5% 较上月</p>
              </div>
              <div
                class="absolute top-2 left-2 h-3 w-3 rounded-full bg-white/50 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100"
              ></div>
            </div>

            <!-- 转化率 -->
            <div
              class="group relative rounded-2xl bg-white/30 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.5)] backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 ease-out hover:scale-105 hover:bg-white/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] active:scale-95"
            >
              <div class="mb-4 flex items-center justify-between">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/80 shadow-[0_4px_16px_rgba(147,51,234,0.3)] backdrop-blur-sm transition-transform duration-300 group-hover:scale-110"
                >
                  <svg
                    class="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <span class="text-2xl font-bold text-gray-800">68%</span>
              </div>
              <div>
                <h4 class="mb-1 font-medium text-gray-700">转化率</h4>
                <p class="text-sm font-medium text-green-600">+3.4% 较上月</p>
              </div>
              <div
                class="absolute top-2 left-2 h-3 w-3 rounded-full bg-white/50 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

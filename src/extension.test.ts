import { describe, expect, it } from 'vitest'

describe('浏览器扩展测试', () => {
  it('测试 Popup 页面', async () => {
    const popupPage = await browser.getPopupPage()
    const text = await popupPage.waitForSelector('.welcome-text')
    expect(await text.textContent()).toBe('欢迎使用扩展')
  })

  it('测试 Side Panel 页面', async () => {
    const sidePanelPage = await browser.getSidePanelPage()
    const title = await sidePanelPage.title()
    expect(title).toContain('侧边栏')
  })

  it('测试 Content Script 注入', async () => {
    const page = await context.newPage()
    await page.goto('https://www.example.com')
    const toggleButton = await page.waitForSelector('.toggle-button')
    await toggleButton.click()
    const appContainer = await page.waitForSelector('.app-content')
    expect(await appContainer.textContent()).toBeTruthy()
  })
})

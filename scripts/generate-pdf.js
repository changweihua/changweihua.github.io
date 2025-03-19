const puppeteer = require('puppeteer');
const { glob } = require('glob');
const fs = require('fs');

(async () => {
  // 启动本地服务（需先启动 VitePress）
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // 获取所有文档路径
  const files = await glob('docs/**/*.md');
  const urls = files.map(file =>
    `http://localhost:3000/${file.replace('docs/', '').replace('.md', '')}`
  );

  // 批量生成 PDF
  for (const url of urls) {
    await page.goto(url, { waitUntil: 'networkidle0' });
    const pdfPath = `output/${url.split('/').pop()}.pdf`;
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '30px', right: '30px', bottom: '30px', left: '30px' }
    });
    console.log(`Generated: ${pdfPath}`);
  }

  await browser.close();
})();

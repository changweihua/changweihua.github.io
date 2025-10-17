import { RSSOptions } from 'vitepress-plugin-rss'

const rssBaseUrl = process.env.VITE_APP_RSS_BASE_URL || 'https://changweihua.github.io' //import.meta.env.VITE_APP_RSS_BASE_URL;

const RSS: RSSOptions = {
    // necessary（必选参数）
    title: 'CMONO.NET',
    baseUrl: rssBaseUrl,
    copyright: `Copyright (c) 2013-${new Date().getFullYear()}, CMONO.NET`,

    // optional（可选参数）
    description:
        "计算机科学的工程实践和个人思考。涵盖前端开发、后端架构、DevOps运维、AI工程等技术领域的深度文章和实战经验分享。",
    url: `${rssBaseUrl}/feed.rss`, // RSS feed 的完整 URL
    icon: '<svg t="1692670607447" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6532" width="128" height="128"><path d="M265.216 758.784c22.528 22.528 34.816 51.2 34.816 83.968 0 32.768-13.312 62.464-34.816 83.968-22.528 22.528-53.248 34.816-83.968 34.816-32.768 0-62.464-13.312-83.968-34.816C73.728 905.216 61.44 874.496 61.44 843.776c0-32.768 13.312-62.464 34.816-83.968 22.528-22.528 51.2-34.816 83.968-34.816 33.792-1.024 62.464 12.288 84.992 33.792zM61.44 367.616v172.032c111.616 0 218.112 44.032 296.96 122.88S481.28 848.896 481.28 962.56h172.032c0-163.84-66.56-312.32-174.08-419.84C373.76 436.224 225.28 369.664 61.44 367.616zM61.44 61.44v172.032c402.432 0 729.088 326.656 729.088 729.088H962.56c0-247.808-101.376-473.088-264.192-636.928C536.576 163.84 311.296 63.488 61.44 61.44z" fill="#EBA33A" p-id="6533"></path></svg>',

    // optional（可选参数）
    language: 'zh-CN',
    author: {
        name: '常伟华',
        email: 'changweihua@outlook.com',
        link: 'https://changweihua.github.io'
    },
    authors: [{
        name: '常伟华',
        email: 'changweihua@outlook.com',
        link: 'https://changweihua.github.io'
    }],
    filename: 'feed.rss',
    log: true,
    ignoreHome: true,

    renderHTML: (filecontent: string) => {
        // 这个后续会讲到
        // 使用正则表达式去除所有的 &ZeroWidthSpace;
        return filecontent.replaceAll(/&ZeroWidthSpace;/g, '');
    },

    // 关键：通过过滤器精确控制哪些内容需要被收录
    // 这里我们只收录 'blog' 目录下的文章
    filter: (post, idx, posts) => {
        return post.url.startsWith("/blog/")
    },
}

export {
    RSS
}

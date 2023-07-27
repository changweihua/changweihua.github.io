import path from "path";
import { writeFileSync } from "fs";
import { Feed } from "feed";
import { createContentLoader, type SiteConfig } from "vitepress";

const hostname = "https://changweihua.github.io";

export async function createRssFile(config: SiteConfig) {
	const feed = new Feed({
		title: "CMONO.NET",
		description: "123",
		id: hostname,
		link: hostname,
		language: "zh-CH",
		image: "https://.png",
		favicon: `https://.ico`,
		copyright: "Copyright© 2021-present",
	});

	const posts = await createContentLoader("blogs/**/*.md", {
		excerpt: true,
		render: true,
	}).load();

	posts.sort((a, b) => Number(+getDate(b.url) - +getDate(a.url)));

	for (const { url, excerpt, html } of posts) {
    // 排除index.md与2022|2021|2020发布的文章
    if(url.search(/index|202[0-2]/) >= 0) {
      continue;
    }
    // 仅保留最近3篇文章
    if(feed.items.length >= 3) {
      break;
    }
		const lastStr = url.split('/').pop();
		const title = lastStr?.substring(2, lastStr.length - 5) || ''
		feed.addItem({
			title,
			id: `${hostname}${url}`,
			link: `${hostname}${url}`,
			description: excerpt,
			content: html,
			author: [
				{
					name: "常伟华",
					email: "changweihua@outlook.com",
					link: "https://changweihua.github.io",
				},
			],
			date: getDate(url),
		});
	}

	writeFileSync(path.join(config.outDir, "feed.xml"), feed.rss2(), "utf-8");
}

export function getDate(url: string) {
	return new Date(url.substring(4, 14));
}

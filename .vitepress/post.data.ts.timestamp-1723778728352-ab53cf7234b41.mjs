// .vitepress/post.data.ts
import { createContentLoader } from "file:///D:/Github/changweihua.github.io/node_modules/vitepress/dist/node/index.js";
import dayjs from "file:///D:/Github/changweihua.github.io/node_modules/dayjs/dayjs.min.js";
import "file:///D:/Github/changweihua.github.io/node_modules/dayjs/locale/zh-cn.js";
import relativeTime from "file:///D:/Github/changweihua.github.io/node_modules/dayjs/plugin/relativeTime.js";
import utc from "file:///D:/Github/changweihua.github.io/node_modules/dayjs/plugin/utc.js";
import timezone from "file:///D:/Github/changweihua.github.io/node_modules/dayjs/plugin/timezone.js";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Shanghai");
dayjs.extend(relativeTime);
dayjs.locale("zh-cn");
var post_data_default = createContentLoader("zh-CN/blog/**/*.md", {
  transform(raw) {
    const postMap = {};
    const yearMap = {};
    const tagMap = {};
    const blogs = raw.map(({ url, frontmatter, excerpt }) => {
      let tags = [url.split("/")[2]];
      if (frontmatter?.tags) {
        tags = [...tags, ...frontmatter.tags];
      }
      const blog = {
        title: frontmatter.title,
        url,
        excerpt,
        description: frontmatter.description,
        date: formatDate(frontmatter.date),
        tags
      };
      postMap[blog.url] = blog;
      return blog;
    }).sort((a, b) => b.date.time - a.date.time);
    blogs.forEach((item) => {
      if (item.title !== "Index") {
        const year = new Date(item.date.string).getFullYear();
        if (year) {
          if (!yearMap[year]) {
            yearMap[year] = [];
          }
          yearMap[year].push(item.url);
          item.tags.forEach((tag) => {
            if (!tagMap[tag]) {
              tagMap[tag] = [];
            }
            tagMap[tag].push(item.url);
          });
        }
      }
    });
    return {
      yearMap,
      postMap,
      tagMap
    };
  },
  globOptions: {
    ignore: ["index.md"]
  }
});
function formatDate(raw) {
  return {
    time: dayjs.tz(raw).valueOf(),
    string: dayjs.tz(raw).format("YYYY-MM-DD hh:mm")
  };
}
export {
  post_data_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLnZpdGVwcmVzcy9wb3N0LmRhdGEudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXEdpdGh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFxwb3N0LmRhdGEudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0dpdGh1Yi9jaGFuZ3dlaWh1YS5naXRodWIuaW8vLnZpdGVwcmVzcy9wb3N0LmRhdGEudHNcIjtpbXBvcnQgeyBjcmVhdGVDb250ZW50TG9hZGVyIH0gZnJvbSAndml0ZXByZXNzJ1xyXG5pbXBvcnQgZGF5anMgZnJvbSBcImRheWpzXCI7XHJcbmltcG9ydCBcImRheWpzL2xvY2FsZS96aC1jblwiO1xyXG5pbXBvcnQgcmVsYXRpdmVUaW1lIGZyb20gXCJkYXlqcy9wbHVnaW4vcmVsYXRpdmVUaW1lXCI7XHJcbmltcG9ydCB1dGMgZnJvbSBcImRheWpzL3BsdWdpbi91dGNcIjtcclxuaW1wb3J0IHRpbWV6b25lIGZyb20gXCJkYXlqcy9wbHVnaW4vdGltZXpvbmVcIjtcclxuZGF5anMuZXh0ZW5kKHV0YylcclxuZGF5anMuZXh0ZW5kKHRpbWV6b25lKVxyXG5cclxuZGF5anMudHouc2V0RGVmYXVsdChcIkFzaWEvU2hhbmdoYWlcIilcclxuZGF5anMuZXh0ZW5kKHJlbGF0aXZlVGltZSk7XHJcbmRheWpzLmxvY2FsZShcInpoLWNuXCIpO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlQ29udGVudExvYWRlcignemgtQ04vYmxvZy8qKi8qLm1kJywge1xyXG4gIHRyYW5zZm9ybShyYXcpIHtcclxuXHJcbiAgICBjb25zdCBwb3N0TWFwID0ge307XHJcbiAgICBjb25zdCB5ZWFyTWFwID0ge307XHJcbiAgICBjb25zdCB0YWdNYXAgPSB7fTtcclxuXHJcbiAgICBjb25zdCBibG9ncyA9IHJhd1xyXG4gICAgICAubWFwKCh7IHVybCwgZnJvbnRtYXR0ZXIsIGV4Y2VycHQgfSkgPT4ge1xyXG5cclxuICAgIGxldCB0YWdzID0gW3VybC5zcGxpdChcIi9cIilbMl1dXHJcbiAgICBpZiAoZnJvbnRtYXR0ZXI/LnRhZ3MpIHtcclxuICAgICAgdGFncyA9IFsuLi50YWdzLCAuLi5mcm9udG1hdHRlci50YWdzXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGJsb2cgPSB7XHJcbiAgICAgICAgICB0aXRsZTogZnJvbnRtYXR0ZXIudGl0bGUsXHJcbiAgICAgICAgICB1cmwsXHJcbiAgICAgICAgICBleGNlcnB0LFxyXG4gICAgICAgICAgZGVzY3JpcHRpb246IGZyb250bWF0dGVyLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgZGF0ZTogZm9ybWF0RGF0ZShmcm9udG1hdHRlci5kYXRlKSxcclxuICAgICAgICAgIHRhZ3NcclxuICAgICAgICB9XHJcbiAgICAgICAgcG9zdE1hcFtibG9nLnVybF0gPSBibG9nO1xyXG5cclxuICAgICAgICByZXR1cm4gYmxvZ1xyXG4gICAgICB9KVxyXG4gICAgICAuc29ydCgoYSwgYikgPT4gYi5kYXRlLnRpbWUgLSBhLmRhdGUudGltZSlcclxuXHJcbiAgICBibG9ncy5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgIGlmIChpdGVtLnRpdGxlICE9PSAnSW5kZXgnKSB7XHJcbiAgICAgICAgY29uc3QgeWVhciA9IG5ldyBEYXRlKGl0ZW0uZGF0ZS5zdHJpbmcpLmdldEZ1bGxZZWFyKCk7XHJcbiAgICAgICAgaWYgKHllYXIpIHtcclxuICAgICAgICAgIGlmICgheWVhck1hcFt5ZWFyXSkge1xyXG4gICAgICAgICAgICB5ZWFyTWFwW3llYXJdID0gW107XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB5ZWFyTWFwW3llYXJdLnB1c2goaXRlbS51cmwpO1xyXG5cclxuICAgICAgICAgIGl0ZW0udGFncy5mb3JFYWNoKCh0YWcpID0+IHtcclxuICAgICAgICAgICAgaWYgKCF0YWdNYXBbdGFnXSkge1xyXG4gICAgICAgICAgICAgIHRhZ01hcFt0YWddID0gW11cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0YWdNYXBbdGFnXS5wdXNoKGl0ZW0udXJsKVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHllYXJNYXAsXHJcbiAgICAgIHBvc3RNYXAsXHJcbiAgICAgIHRhZ01hcCxcclxuICAgIH1cclxuICB9LFxyXG4gIGdsb2JPcHRpb25zOiB7XHJcbiAgICBpZ25vcmU6IFsnaW5kZXgubWQnXVxyXG4gIH1cclxufSlcclxuXHJcbmZ1bmN0aW9uIGZvcm1hdERhdGUocmF3OiBzdHJpbmcpIHtcclxuICByZXR1cm4ge1xyXG4gICAgdGltZTogZGF5anMudHoocmF3KS52YWx1ZU9mKCksXHJcbiAgICBzdHJpbmc6IGRheWpzLnR6KHJhdykuZm9ybWF0KCdZWVlZLU1NLUREIGhoOm1tJylcclxuICB9XHJcbn1cclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvVCxTQUFTLDJCQUEyQjtBQUN4VixPQUFPLFdBQVc7QUFDbEIsT0FBTztBQUNQLE9BQU8sa0JBQWtCO0FBQ3pCLE9BQU8sU0FBUztBQUNoQixPQUFPLGNBQWM7QUFDckIsTUFBTSxPQUFPLEdBQUc7QUFDaEIsTUFBTSxPQUFPLFFBQVE7QUFFckIsTUFBTSxHQUFHLFdBQVcsZUFBZTtBQUNuQyxNQUFNLE9BQU8sWUFBWTtBQUN6QixNQUFNLE9BQU8sT0FBTztBQUVwQixJQUFPLG9CQUFRLG9CQUFvQixzQkFBc0I7QUFBQSxFQUN2RCxVQUFVLEtBQUs7QUFFYixVQUFNLFVBQVUsQ0FBQztBQUNqQixVQUFNLFVBQVUsQ0FBQztBQUNqQixVQUFNLFNBQVMsQ0FBQztBQUVoQixVQUFNLFFBQVEsSUFDWCxJQUFJLENBQUMsRUFBRSxLQUFLLGFBQWEsUUFBUSxNQUFNO0FBRTFDLFVBQUksT0FBTyxDQUFDLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQzdCLFVBQUksYUFBYSxNQUFNO0FBQ3JCLGVBQU8sQ0FBQyxHQUFHLE1BQU0sR0FBRyxZQUFZLElBQUk7QUFBQSxNQUNsQztBQUVBLFlBQU0sT0FBTztBQUFBLFFBQ1gsT0FBTyxZQUFZO0FBQUEsUUFDbkI7QUFBQSxRQUNBO0FBQUEsUUFDQSxhQUFhLFlBQVk7QUFBQSxRQUN6QixNQUFNLFdBQVcsWUFBWSxJQUFJO0FBQUEsUUFDakM7QUFBQSxNQUNGO0FBQ0EsY0FBUSxLQUFLLEdBQUcsSUFBSTtBQUVwQixhQUFPO0FBQUEsSUFDVCxDQUFDLEVBQ0EsS0FBSyxDQUFDLEdBQUcsTUFBTSxFQUFFLEtBQUssT0FBTyxFQUFFLEtBQUssSUFBSTtBQUUzQyxVQUFNLFFBQVEsQ0FBQyxTQUFTO0FBQ3RCLFVBQUksS0FBSyxVQUFVLFNBQVM7QUFDMUIsY0FBTSxPQUFPLElBQUksS0FBSyxLQUFLLEtBQUssTUFBTSxFQUFFLFlBQVk7QUFDcEQsWUFBSSxNQUFNO0FBQ1IsY0FBSSxDQUFDLFFBQVEsSUFBSSxHQUFHO0FBQ2xCLG9CQUFRLElBQUksSUFBSSxDQUFDO0FBQUEsVUFDbkI7QUFDQSxrQkFBUSxJQUFJLEVBQUUsS0FBSyxLQUFLLEdBQUc7QUFFM0IsZUFBSyxLQUFLLFFBQVEsQ0FBQyxRQUFRO0FBQ3pCLGdCQUFJLENBQUMsT0FBTyxHQUFHLEdBQUc7QUFDaEIscUJBQU8sR0FBRyxJQUFJLENBQUM7QUFBQSxZQUNqQjtBQUNBLG1CQUFPLEdBQUcsRUFBRSxLQUFLLEtBQUssR0FBRztBQUFBLFVBQzNCLENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUVELFdBQU87QUFBQSxNQUNMO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsYUFBYTtBQUFBLElBQ1gsUUFBUSxDQUFDLFVBQVU7QUFBQSxFQUNyQjtBQUNGLENBQUM7QUFFRCxTQUFTLFdBQVcsS0FBYTtBQUMvQixTQUFPO0FBQUEsSUFDTCxNQUFNLE1BQU0sR0FBRyxHQUFHLEVBQUUsUUFBUTtBQUFBLElBQzVCLFFBQVEsTUFBTSxHQUFHLEdBQUcsRUFBRSxPQUFPLGtCQUFrQjtBQUFBLEVBQ2pEO0FBQ0Y7IiwKICAibmFtZXMiOiBbXQp9Cg==

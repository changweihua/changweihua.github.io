// import { replacer } from "../../scripts/utils";
// import type { Plugin } from "vite";

// export function MarkdownTransform(): Plugin {
//   return {
//     name: "cmono-md-transform",
//     enforce: "pre",
//     async transform(code, id) {
//       if (!id.match(/\.md\b/)) return null;
//       // convert links to relative
//       // code = code.replace(/https?:\/\/changweihua\.github\.io\//g, "/");
//       const [_name, i] = id.split("/").slice(-2);
//       console.log(_name);
//       // // convert img
//       // const imgRegex = /!\[(.+?)\]\((.+?)\)/g;
//       // let imgMatches = imgRegex.exec(code);
//       // while (imgMatches) {
//       //   const [text, link] = imgMatches.slice(1);
//       //   code = code.replace(
//       //     imgMatches[0],
//       //     `<img src="${link}" alt="${text || "img"}" />`
//       //   );
//       //   imgMatches = imgRegex.exec(code);
//       // }

//       // // convert links to components
//       // const linkRegex = /\[(.+?)\]\((.+?)\)/g;
//       // let matches = linkRegex.exec(code);
//       // while (matches) {
//       //   const [text, link] = matches.slice(1);
//       //   code = code.replace(
//       //     matches[0],
//       //     `<CustomLink title="${text}" href="${link}" />`
//       //   );
//       //   matches = linkRegex.exec(code);
//       // }

//       console.log(id, _name);
//       // cut index.md
//       if (
//         _name === "category" ||
//         _name === "gallery" ||
//         _name === "about" ||
//         _name === "course" ||
//         i === "index.md"
//       )
//         return code;

//       const { footer } = await getDocsMarkdown();
//       code = replacer(code, footer, "FOOTER", "tail");
//       // const { readTime, words } = getReadingTime(code)
//       // code = code
//       //   .replace(/(#\s.+?\n)/, `$1\n\n<PageInfo readTime="${readTime}" words="${words}"/>\n`)

//       return code;
//     },
//   };
// }

// export async function getDocsMarkdown() {
//   const ContributorsSection = '\n## Contributors ##\n<Contributors />';

//   const CopyRightSection = '<CopyRight />';

//   const footer = `${ContributorsSection}\n${CopyRightSection}\n`;

//   return {
//     footer,
//   };
// }

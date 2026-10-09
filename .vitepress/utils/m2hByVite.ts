// import path from "path";
// import markdown2html from "../markdown/markdown2html";
// import { handleTagName } from "./util";
// import { TempPath } from "../config";
// import fs from "fs";

// const m2hByVite = async (code: string, id: string) => {
//   const dynamicComponents: Record<string, string> = {
//     showcode: "@src/components/ShowCode",
//   };

//   const htmlFile = await markdown2html(code, {
//     codeBlock: {
//       handleCode(index, node) {
//         if (node.children.length > 0) {
//           const mdName = path.basename(id);
//           const filename = handleTagName(
//             `${mdName.replace(".md", "")}_demo_${index}`
//           );
//           const filePath = path.resolve(TempPath, "./" + filename + ".tsx");
//           fs.writeFileSync(filePath, node.children[0].value, "utf-8");
//           dynamicComponents[filename] = filePath;

//           return {
//             tagName: filename,
//             children: [],
//           };
//         }
//         return null;
//       },
//     },
//     codeTag: {
//       handleCode(index, node) {
//         if (
//           node.tagName == "code" &&
//           node.properties.src &&
//           node.properties.src.startsWith(".")
//         ) {
//           console.log(node);
//           const mdName = path.basename(id);
//           const filename = handleTagName(
//             `${mdName.replace(".md", "")}_demo_tag_${index}`
//           );
//           const compoPath = path.resolve(path.dirname(id), node.properties.src);

//           if (!fs.existsSync(compoPath)) return null;

//           dynamicComponents[filename] = compoPath;

//           return {
//             tagName: filename,
//           };
//         }
//         return null;
//       },
//     },
//   });

//   return {
//     html: htmlFile.value,
//     dynamicComponents,
//   };
// };

// export default m2hByVite;

const firstCharUpperCase = (str: string) => {
  return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
};

const handleTagName = (tagName: string) => {
  return tagName.toLowerCase();
};

const switchTagName = (tagNames: string[], code: string) => {
  code = code.replace(
    new RegExp(`${tagNames.map((item) => item.toLowerCase()).join("|")}`, "g"),
    (match: string) => {
      return firstCharUpperCase(match);
    }
  );

  return code;
};

export { firstCharUpperCase, handleTagName, switchTagName };


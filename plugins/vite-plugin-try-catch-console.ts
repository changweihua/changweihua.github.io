import { Plugin } from "vite";
import * as babel from "@babel/core";
import { parse } from "@babel/core";
import _traverse from "@babel/traverse";
const traverse =
  typeof _traverse === "function" ? _traverse : (_traverse as any).default;
import { generate } from "@babel/generator";
import * as t from "@babel/types";

const vitePluginTryCatchConsole = (): Plugin => {
  return {
    name: "vite-plugin-try-catch-console",
    enforce: "post", // 确保在其他转换之后执行
    async transform(code, id) {
      // 1. 过滤文件类型，只处理 JS/TS/JSX/TSX/Vue 文件，并跳过 node_modules
      if (!/\.(js|ts|jsx|tsx|vue)$/.test(id) || id.includes("node_modules")) {
        return null; // 不处理这些文件
      }

      // 2. 解析代码生成 AST
      const ast = parse(code, {
        sourceType: "module",
        filename: id,
        plugins: [
          "@babel/plugin-transform-typescript", // 处理 TypeScript
          "@vue/babel-plugin-jsx", // 处理 Vue 中的 JSX
        ],
      });

      if (!ast) {
        return null;
      }

      let transformed = false; // 标记是否进行了转换

      // 3. 遍历 AST，找到 CatchClause 节点并修改
      traverse(ast, {
        CatchClause(path: babel.NodePath<t.CatchClause>) {
          const block = path.node.body; // 获取 catch 块的函数体

          // 检查 catch 块中是否已经有 console.error(error) 了
          const hasConsoleError = block.body.some((statement: t.Statement) => {
            return (
              t.isExpressionStatement(statement) &&
              t.isCallExpression(statement.expression) &&
              t.isMemberExpression(statement.expression.callee) &&
              t.isIdentifier(statement.expression.callee.object, {
                name: "console",
              }) &&
              t.isIdentifier(statement.expression.callee.property, {
                name: "error",
              })
            );
          });

          if (!hasConsoleError) {
            // 如果 catch 块没有参数 (catch {})，我们需要手动给它添加一个参数
            if (!path.node.param) {
              path.node.param = t.identifier("error"); // 添加一个名为 'error' 的标识符作为参数
            }
            const errorArg = path.node.param as t.Identifier; // 获取 catch 块的错误参数

            // 创建 console.error(errorArg) 语句
            const consoleErrorStatement = t.expressionStatement(
              t.callExpression(
                t.memberExpression(
                  t.identifier("console"),
                  t.identifier("error")
                ), // console.error
                [errorArg] // 传入错误参数
              )
            );

            // 将新语句插入到 catch 块的最前面
            block.body.unshift(consoleErrorStatement);
            transformed = true;
          }
        },
      });

      // 4. 如果有修改，重新生成代码和 Source Map
      if (transformed) {
        const output = generate(
          ast,
          { sourceMaps: true, sourceFileName: id },
          code
        );
        return { code: output.code, map: output.map };
      }

      return null; // 没有修改则返回 null
    },
  };
};

export default vitePluginTryCatchConsole;

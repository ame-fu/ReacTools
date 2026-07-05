/**
 * 使用 Prettier 格式化 HTML 或 CSS 代码
 * 使用动态导入以减小初始 bundle 体积
 */
export async function formatHtmlOrCss(
  code: string,
  lang: "html" | "css"
): Promise<string> {
  if (!code?.trim()) return code;

  const [prettier, htmlPlugin, postcssPlugin] = await Promise.all([
    import("prettier/standalone"),
    import("prettier/plugins/html"),
    import("prettier/plugins/postcss"),
  ]);

  const plugins = lang === "html" ? [htmlPlugin] : [postcssPlugin];
  const parser = lang === "html" ? "html" : "css";

  try {
    return await prettier.default.format(code, {
      parser,
      plugins,
      printWidth: 80,
      tabWidth: 2,
    });
  } catch {
    return code;
  }
}

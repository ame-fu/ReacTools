/** 与 next.config.ts 中 basePath 保持一致，供客户端 fetch / 静态资源使用 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** 为以 / 开头的路径加上 basePath 前缀 */
export function withBasePath(path: string): string {
  if (!path.startsWith("/")) return path;
  if (!basePath) return path;
  return `${basePath}${path}`;
}

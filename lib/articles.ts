import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

export interface ArticleMeta {
  title: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  pinned?: boolean;
  showExcerpt?: boolean;
  excerpt?: string;
  firstImage?: string;
}

export interface Article {
  slug: string;
  meta: ArticleMeta;
  content: string;
}

function getSlugFromFilename(filename: string): string {
  return filename.replace(/\.(mdx?|md)$/, "");
}

function extractExcerpt(content: string, maxLines = 2): string {
  const stripped = content
    .replace(/^---[\s\S]*?---/, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#*`_~]/g, "")
    .replace(/\n+/g, "\n")
    .trim();
  const lines = stripped.split("\n").filter((l) => l.trim());
  const text = lines.slice(0, maxLines).join(" ").trim();
  return text.length > 120 ? text.slice(0, 120) + "…" : text;
}

function extractFirstImage(content: string): string | undefined {
  const match = content.match(/!\[[^\]]*\]\(([^)]+)\)/);
  return match ? match[1].trim() : undefined;
}

export function getArticlesList(): (ArticleMeta & { slug: string })[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  const files = fs.readdirSync(ARTICLES_DIR).filter((f) => /\.(mdx?|md)$/.test(f));
  const list: (ArticleMeta & { slug: string })[] = [];
  for (const file of files) {
    const slug = getSlugFromFilename(file);
    const fullPath = path.join(ARTICLES_DIR, file);
    const raw = fs.readFileSync(fullPath, "utf-8");
    const { data, content } = matter(raw);
    const pinned = Boolean(data.pinned);
    const showExcerpt = data.showExcerpt !== false;
    list.push({
      slug,
      title: data.title ?? slug,
      createdAt: data.createdAt ?? "",
      updatedAt: data.updatedAt ?? "",
      tags: Array.isArray(data.tags) ? data.tags : [],
      pinned,
      showExcerpt,
      excerpt: showExcerpt ? extractExcerpt(content) : undefined,
      firstImage: showExcerpt ? extractFirstImage(content) : undefined,
    });
  }
  list.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    const tA = a.updatedAt || a.createdAt;
    const tB = b.updatedAt || b.createdAt;
    return tB.localeCompare(tA);
  });
  return list;
}

export function getArticleBySlug(slug: string): Article | null {
  if (!fs.existsSync(ARTICLES_DIR)) return null;
  const files = fs.readdirSync(ARTICLES_DIR);
  const match = files.find((f) => getSlugFromFilename(f) === slug);
  if (!match) return null;
  const fullPath = path.join(ARTICLES_DIR, match);
  const raw = fs.readFileSync(fullPath, "utf-8");
  const { data, content } = matter(raw);
  return {
    slug,
    meta: {
      title: data.title ?? slug,
      createdAt: data.createdAt ?? "",
      updatedAt: data.updatedAt ?? "",
      tags: Array.isArray(data.tags) ? data.tags : [],
      pinned: Boolean(data.pinned),
    },
    content,
  };
}

export function getAllArticleSlugs(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => /\.(mdx?|md)$/.test(f))
    .map((f) => getSlugFromFilename(f));
}

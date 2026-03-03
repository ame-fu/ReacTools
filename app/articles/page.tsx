import { getArticlesList } from "@/lib/articles";
import { ArticlesListClient } from "./ArticlesListClient";

export const metadata = {
  title: "ReacTools - Articles",
  description: "Articles and notes",
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams?: Promise<{ tag?: string }>;
}) {
  const list = getArticlesList();
  const params = await searchParams;
  const initialTag = params?.tag ?? null;
  return <ArticlesListClient initialList={list} initialTag={initialTag} />;
}

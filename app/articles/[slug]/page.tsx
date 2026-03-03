import { notFound } from "next/navigation";
import { getArticleBySlug, getAllArticleSlugs, getArticlesList } from "@/lib/articles";
import { ArticlePageContent } from "@/components/ArticlePageContent";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps) {
  const { slug } = await props.params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "ReacTools" };
  return {
    title: `${article.meta.title} - ReacTools`,
    description: article.meta.title,
  };
}

export default async function ArticlePage(props: PageProps) {
  const { slug } = await props.params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const list = getArticlesList();
  const index = list.findIndex((item) => item.slug === slug);
  const prev = index > 0 ? list[index - 1] : null;
  const next = index >= 0 && index < list.length - 1 ? list[index + 1] : null;

  return (
    <ArticlePageContent
      title={article.meta.title}
      updatedAt={article.meta.updatedAt}
      tags={article.meta.tags}
      content={article.content}
      prevSlug={prev?.slug ?? null}
      prevTitle={prev?.title ?? null}
      nextSlug={next?.slug ?? null}
      nextTitle={next?.title ?? null}
    />
  );
}

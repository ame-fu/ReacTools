import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import { ToolContent } from "@/components/ToolContent";
import { getToolBySlug } from "@/lib/tools.config";
import { Base64HexMessageDecoderHeaderIcon } from "@/components/tools/Base64HexMessageDecoder";

interface PageProps {
  params: Promise<{
    tool: string;
  }>;
}

export async function generateMetadata(
  props: PageProps,
): Promise<Metadata> {
  const { tool } = await props.params;
  const config = getToolBySlug(tool);
  if (!config) return {};

  return {
    title: `${config.name} - ReacTools`,
    description: config.description,
    keywords: config.keywords,
  };
}

export default async function ToolPage(props: PageProps) {
  const { tool } = await props.params;
  const config = getToolBySlug(tool);

  if (!config) {
    notFound();
  }

  const headerIcon =
    config.slug === "base64-hex-message-decoder" ? (
      <Base64HexMessageDecoderHeaderIcon />
    ) : undefined;

  return (
    <ToolLayout
      slug={config.slug}
      title={config.name}
      description={config.description}
      headerIcon={headerIcon}
    >
      <ToolContent slug={config.slug} />
    </ToolLayout>
  );
}

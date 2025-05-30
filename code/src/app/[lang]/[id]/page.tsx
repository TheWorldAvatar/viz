import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import markdownIt from "markdown-it";

import StaticContentPage from 'ui/pages/static-content-page';
import OptionalPages, { OptionalPage } from 'io/config/optional-pages';

// Type definition for incoming page parameters
interface Properties {
  params: Promise<{
    id: string;
  }>
}

// Utilities to render markdown into HTML
const markdowner = markdownIt({
  html: true,
  typographer: true,
  breaks: true,
  linkify: true
});

/**
 * Dynamically set page metadata based on the incoming route.
 * 
 * @param params incoming route parameters.
 * 
 * @returns metadata promise.
 */
export async function generateMetadata({ params }: Properties): Promise<Metadata> {
  const resolvedParams = await params;
  const page: OptionalPage = OptionalPages.getPage(resolvedParams.id);
  return {
    title: page.title,
    description: page.description
  }
}

/**
 * Dynamically load and render content from an optional metadata file
 * based on the incoming URL route.
 * 
 * @param params incoming route parameters.
 * 
 * @returns React component for display. 
 */
export default async function Post({ params }: Properties) {
  const resolvedParams = await params;
  const exclusions: string[] = ["landing", "help"];
  // Ignore landing or help page
  if (!exclusions.includes(resolvedParams.id)) {
    // Get cached page content.
    const page: OptionalPage = OptionalPages.getPage(resolvedParams.id);
    const markdownResult = markdowner.render(page.content);
    return (
      <StaticContentPage
        childString={markdownResult}
      />
    )
  }
  return notFound();
}
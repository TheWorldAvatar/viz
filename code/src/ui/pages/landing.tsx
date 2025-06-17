"use client";
/**
 * Optional landing page.
 */

import "github-markdown-css/github-markdown.css";
import styles from "./landing.module.css";

import markdownit from "markdown-it";

import { OptionalPage } from "io/config/optional-pages";
import { Dictionary } from "types/dictionary";
import { UISettings } from "types/settings";

// Utilities to render markdown into HTML
const markdowner = markdownit({
  html: true,
  typographer: true,
  breaks: true,
  linkify: true,
});

interface LandingPageProps {
  dict: Dictionary;
  settings: UISettings;
  pages: OptionalPage[];
}

/**
 * Represents a standard landing page for the TWA platform. Can optionally
 * contain dynamically created links to other static pages (e.g. acknowledgements,
 * glossaries, licensing etc.).
 *
 * @returns JSX for landing page.
 */
export default function LandingPage(props: Readonly<LandingPageProps>) {
  // CSS class names
  const introClasses = ["markdown-body", styles.introInner].join(" ");

  return (
    <div className="bg-muted border-border   rounded-xl border-1  shadow-2xl mx-auto mt-4 flex h-10/12  p-2 sm:w-sm md:h-10/12 md:w-11/12 lg:h-11/12 lg:w-11/12 lg:p-4  xl:h-10/12 xl:w-9/12 2xl:h-11/12 ">
      <div
        className={introClasses}
        dangerouslySetInnerHTML={{
          __html: getIntroductionContent(props.pages),
        }}
      />
    </div>
  );
}
/**
 * Grabs introduction content from the optional page defining the landing.
 *
 * @returns Introduction HTML content.
 */
function getIntroductionContent(pages: OptionalPage[]): string {
  const filteredPages: OptionalPage[] = pages.filter(
    (page) => page.slug === "landing"
  );
  if (filteredPages.length === 0) {
    return "";
  }
  // Only one page should be returned

  return markdowner.render(filteredPages[0]?.content);
}

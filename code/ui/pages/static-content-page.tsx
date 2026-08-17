/**
 * Single page used to show static, user-generated content pulled
 * from a markdown file.
 */

"use client";

import "github-markdown-css/github-markdown.css";

// Interface for properties with react nodes
interface Props {
  childString?: string;
}

/**
 * Component that represents a single page with static content.
 * Commonly used for glossaries, legends, acknowledgements etc.
 *
 * @param childString HTML string to add to this component.
 */
export default function StaticContentPage({
  childString,
}: Readonly<Props>) {
  return (
    <div className="flex w-full px-12 py-8">
      <div
        className={"markdown-body bg-muted!"}
        dangerouslySetInnerHTML={{ __html: childString }}
      />
    </div>
  );
}

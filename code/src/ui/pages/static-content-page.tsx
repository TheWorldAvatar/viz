/**
 * Single page used to show static, user-generated content pulled
 * from a markdown file.
 */

"use client";

import styles from "./static-content-page.module.css";
import "github-markdown-css/github-markdown.css";
import { ReactNode } from "react";

// Interface for properties with react nodes
interface Props {
  childNodes?: ReactNode;
  childString?: string;
}

/**
 * Component that represents a single page with static content.
 * Commonly used for glossaries, legends, acknowledgements etc.
 *
 * @param childNodes React nodes to add to this component.
 * @param childString HTML string to add to this component.
 */
export default function StaticContentPage({
  childNodes,
  childString,
}: Readonly<Props>) {
  // CSS class names
  const classNames = ["markdown-body", styles.contentInner].join(" ");

  if (childNodes != null) {
    return (
      <div
        className=" mx-auto  overflow-auto  flex  h-dvh w-full"
        key="static-content-page"
      >
        <div className="h-full w-full overflow-y-hidden  bg-muted  p-5  ">
          <div className={classNames}>{childNodes}</div>
        </div>
      </div>
    );
  } else if (childString != null) {
    return (
      <div
        className="mx-auto  overflow-auto  flex  h-dvh w-full"
        key="static-content-page"
      >
        <div className="h-full w-full overflow-y-hidden  bg-muted   p-5 ">
          <div
            className={classNames}
            dangerouslySetInnerHTML={{ __html: childString }}
          />
        </div>
      </div>
    );
  }
}

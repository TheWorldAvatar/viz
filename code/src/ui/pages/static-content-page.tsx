/**
 * Single page used to show static, user-generated content pulled
 * from a markdown file.
 */

"use client";

import styles from "./static-content-page.module.css";
import returnButtonStyles from "../navigation/return/return.module.css";

import "github-markdown-css/github-markdown.css";

import { ReactNode } from "react";

import ReturnButton from "ui/navigation/return/return";

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
        className=" w-full h-full flex flex-col justify-center items-center md:mb-16 lg:mb-0"
        key="static-content-page"
      >
        <ReturnButton />
        <div className="grow h-full w-full overflow-y-hidden  mb-20 bg-muted border-border rounded-xl border-1 p-5 shadow-2xl">
          <div className={classNames}>{childNodes}</div>
        </div>
      </div>
    );
  } else if (childString != null) {
    return (
      <div
        className="w-full h-full flex flex-col justify-center items-center md:mb-16 lg:mb-0"
        key="static-content-page"
      >
        <ReturnButton styles={returnButtonStyles["button-padding"]} />
        <div className="grow h-full w-full overflow-y-hidden  bg-muted border-border rounded-xl border-1 p-6 shadow-2xl">
          <div
            className={classNames}
            dangerouslySetInnerHTML={{ __html: childString }}
          />
        </div>
      </div>
    );
  }
}

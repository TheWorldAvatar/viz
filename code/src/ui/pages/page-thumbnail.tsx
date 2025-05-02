"use client";

import styles from './page-thumbnail.module.css';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import Tooltip from 'ui/interaction/tooltip/tooltip';

// Interface for incoming parameters
export interface DefaultPageThumbnailProps {
  title?: string;
  caption?: string;
  icon?: string;
  url: string;
}

/**
 * A default page thumbnail on the landing page that can redirect to the specified url on click.
 * 
 * @param {string} title Thumbnail title.
 * @param {string} description Description.
 * @param {string} icon Icon to display.
 * @param {string} redirectUrl Redirects to this url when clicked.
 */
export function DefaultPageThumbnail(props: Readonly<DefaultPageThumbnailProps>): React.ReactElement {
  const imageDescription = "Thumbnail icon for the '" + props.title + "' page.";
  return (
    <Tooltip text={`Click to open the '${props.title}' page.`} placement={"left"}>
      <Link href={props.url} className={styles.container}>
        <div className={styles.thumbnail}>
          <Image src={props.icon} height={50} width={50} alt={imageDescription} />
        </div>
        <div className={styles.content}>
          <h3 className={styles.title}>
            {props.title}
          </h3>
          <div className={styles.description} >
            {props.caption}
          </div>
        </div>
      </Link >
    </Tooltip>
  );
}
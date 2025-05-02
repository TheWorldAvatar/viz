"use client";

import styles from './page-thumbnail.module.css';

import Image from 'next/image';
import React from 'react';

import { useDictionary } from 'hooks/useDictionary';
import { useRouter } from 'next/navigation';
import { Dictionary } from 'types/dictionary';
import Tooltip from 'ui/interaction/tooltip/tooltip';

type PageThumbnailType = "default" | "file";

export interface DefaultPageThumbnailProps {
  title: string;
  caption: string;
  icon: string;
  url: string;
  type?: PageThumbnailType;
}

/**
 * A default page thumbnail on the landing page that can redirect to the specified url on click.
 * 
 * @param {string} title Thumbnail title.
 * @param {string} caption Description.
 * @param {string} icon Icon to display.
 * @param {string} url Redirects to this url when clicked.
 * @param {PageThumbnailType} type  Optional parameter that changes the thumbnail's functionality. 
 *                                  Defaults to "default" for redirect functionality. 
 *                                  When set to "file", the thumbnail allows users to send a local file to the target url.
 */
export function DefaultPageThumbnail(props: Readonly<DefaultPageThumbnailProps>): React.ReactElement {
  const dict: Dictionary = useDictionary();
  const fileInputRef = React.useRef(null);
  const imageDescription = dict.accessibility.thumbnailImage.replace("{replace}", props.title);
  const router = useRouter();

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await fetch(props.url, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          console.info("File uploaded successfully!");
        } else {
          console.error("File upload failed:", response.status);
        }
      } catch (error) {
        console.error("There was an error uploading the file:", error);
      }
    }
  };

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (event: React.MouseEvent<HTMLDivElement>): void => {
    event.preventDefault();
    if (props.type === "file") {
      fileInputRef.current.click();
    } else {
      router.push(props.url);
    }
  };

  return (
    <Tooltip text={dict.nav.tooltip.landingRedirect.replace("{replace}", props.title)} placement={"left"}>
      <div className={styles.container} onClick={handleClick}>
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
      </div>
      {// File input is hidden and can only be triggered by via the ref
        props.type === "file" && <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />}
    </Tooltip>
  );
}
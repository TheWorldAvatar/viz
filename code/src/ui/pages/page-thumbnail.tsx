"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import FileModal from "ui/interaction/modal/file/file-modal";
import Tooltip from "ui/interaction/tooltip/tooltip";

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
export function DefaultPageThumbnail(
  props: Readonly<DefaultPageThumbnailProps>,
): React.ReactElement {
  const router = useRouter();
  const dict: Dictionary = useDictionary();
  const [isFileModalOpen, setIsFileModalOpen] = React.useState<boolean>(false);
  const imageDescription = dict.accessibility.thumbnailImage.replace(
    "{replace}",
    props.title,
  );

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (
    event: React.MouseEvent<HTMLDivElement>,
  ): void => {
    event.preventDefault();
    if (props.type === "file") {
      setIsFileModalOpen(true);
    } else {
      router.push(props.url);
    }
  };

  return (
    <Tooltip
      text={
        props.type === "file"
          ? dict.nav.tooltip.fileUpload
          : dict.nav.tooltip.landingRedirect.replace("{replace}", props.title)
      }
      placement={"left"}
    >
      <div
        className="mt-4 flex h-fit w-72 cursor-pointer items-center gap-2 rounded-md p-1.5 transition-colors duration-200 hover:bg-gray-300"
        onClick={handleClick}
      >
        <div className="flex w-18 items-center justify-center">
          <Image
            src={props.icon}
            height={48}
            width={48}
            alt={imageDescription}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <h3 className="text-foreground text-lg font-bold">{props.title}</h3>
          <p className="text-sm text-gray-500">{props.caption}</p>
        </div>
      </div>
      {props.type === "file" && isFileModalOpen && (
        <FileModal
          url={props.url}
          isOpen={isFileModalOpen}
          setIsOpen={setIsFileModalOpen}
        />
      )}
    </Tooltip>
  );
}

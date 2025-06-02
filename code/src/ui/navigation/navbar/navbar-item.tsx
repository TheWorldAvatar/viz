"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import FileModal from "ui/interaction/modal/file/file-modal";
import Tooltip from "ui/interaction/tooltip/tooltip";

type NavBarItemType = "default" | "file";

export interface NavBarItemProps {
  title: string;
  icon: string;
  url: string;
  isMobile: boolean;
  caption?: string;
  type?: NavBarItemType;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * A nav bar item with an icon, title, and caption that may either redirect to a URL or upload a file.
 *
 * @param {string} title Title.
 * @param {string} icon Icon to display.
 * @param {string} url Redirects to this url when clicked.
 * @param {boolean} isMobile Indicates if the design should be in mobile mode.
 * @param {string} caption Optional description text. Ignored in mobile mode.
 * @param {NavBarItemType} type  Optional parameter that changes the thumbnail's functionality.
 *                                  Defaults to "default" for redirect functionality.
 *                                  When set to "file", the thumbnail allows users to send a local file to the target url.
 * @param setIsOpen Optional dispatch function for setting the open state.
 */
export function NavBarItem(
  props: Readonly<NavBarItemProps>
): React.ReactElement {
  const router = useRouter();
  const dict: Dictionary = useDictionary();
  const [isFileModalOpen, setIsFileModalOpen] = React.useState<boolean>(false);
  const imageDescription = dict.accessibility.thumbnailImage.replace(
    "{replace}",
    props.title
  );

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (
    event: React.MouseEvent<HTMLDivElement>
  ): void => {
    event.preventDefault();
    props.setIsOpen?.(false);
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
        className={`${props.isMobile ? "" : "mt-4 w-72"} flex h-fit cursor-pointer items-center gap-2 rounded-md p-1.5 transition-colors duration-200 hover:bg-gray-300`}
        onClick={handleClick}
      >
        <div className={`${props.isMobile ? "" : "w-18"} flex items-center justify-center`}>
          <Image
            src={props.icon}
            height={48}
            width={48}
            alt={imageDescription}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <h3 className="text-foreground text-lg font-bold">{props.title}</h3>
          {!props.isMobile &&
            <p className="text-sm text-gray-500">{props.caption}</p>
          }
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

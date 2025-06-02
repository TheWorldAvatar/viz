"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import Tooltip from "ui/interaction/tooltip/tooltip";

export type NavBarItemType = "default" | "file";

export interface NavBarItemProps {
  title: string;
  icon: string;
  url: string;
  isMobile: boolean;
  tooltip?: string;
  caption?: string;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  handleClick?: React.MouseEventHandler<HTMLDivElement>;
}

/**
 * A nav bar item with an icon, title, and caption that may redirect to a URL by default.
 *
 * @param {string} title Title.
 * @param {string} icon Icon to display.
 * @param {string} url Redirects to this url when clicked.
 * @param {boolean} isMobile Indicates if the design should be in mobile mode.
 * @param {string} tooltip Overrides the existing tooltip text to this url when clicked.
 * @param {string} caption Optional description text. Ignored in mobile mode.
 * @param setIsOpen Optional dispatch function for setting the open state.
 * @param handleClick Overrides the default redirect event behaviour on click.
 */
export function NavBarItem(
  props: Readonly<NavBarItemProps>
): React.ReactElement {
  const router = useRouter();
  const dict: Dictionary = useDictionary();
  const imageDescription = dict.accessibility.thumbnailImage.replace(
    "{replace}",
    props.title
  );

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (
    event: React.MouseEvent<HTMLDivElement>
  ): void => {
    event.preventDefault();
    props.setIsOpen?.(false);
    router.push(props.url);
  };

  return (
    <Tooltip
      text={props.tooltip ?? dict.nav.tooltip.landingRedirect.replace("{replace}", props.title)}
      placement={"left"}
    >
      <div
        className={`${props.isMobile ? "" : "mt-4 w-72"} flex h-fit cursor-pointer items-center gap-2 rounded-md p-1.5 transition-colors duration-200 hover:bg-gray-300`}
        onClick={props.handleClick ?? handleClick}
      >
        <div className={`${props.isMobile ? "" : "w-18"} flex items-center justify-center`}>
          <Image
            src={props.icon}
            height={props.isMobile ? 32 : 48}
            width={props.isMobile ? 32 : 48}
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
    </Tooltip>
  );
}

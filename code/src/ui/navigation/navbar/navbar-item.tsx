"use client";

import React from "react";

import { Icon } from "@mui/material";
import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import Tooltip from "ui/interaction/tooltip/tooltip";


export type NavBarItemType = "default" | "file" | "date";

export interface NavBarItemProps {
  title: string;
  icon: string;
  url: string;
  isMobile: boolean;
  tooltip?: string;
  caption?: string;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  handleClick?: React.MouseEventHandler<HTMLDivElement>;
  isMenuExpanded?: boolean;
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
  const dict: Dictionary = useDictionary();

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (
    event: React.MouseEvent<HTMLDivElement>
  ): void => {
    event.preventDefault();
    props.setIsOpen?.(false);
    // Do not use router.push() as Next.js is unable to clear previous parallel routes, and forms will remain open
    window.location.href = props.url;
  };

  return (
    <Tooltip
      text={
        props.tooltip ??
        dict.nav.tooltip.landingRedirect.replace("{replace}", props.title)
      }
      placement={"left"}
    >
      <div
        className={`${props.isMobile
          ? "p-1.5 gap-4"
          : props.isMenuExpanded
            ? "p-4 gap-4"
            : "p-3 rounded-full"
          } flex h-fit cursor-pointer items-center transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-zinc-700`}
        onClick={props.handleClick ?? handleClick}
      >
        <div
          className={"flex items-center justify-center"}
        >
          <Icon
            sx={{
              color: "#16687B",
            }}
            fontSize={props.isMobile ? "medium" : "large"}
            className="material-symbols-outlined"
          >
            {props.icon}
          </Icon>
        </div>
        <div className="flex flex-1 flex-col">
          <h3
            className={`text-foreground text-base font-bold  ${props.isMenuExpanded ? "" : "hidden"
              }`}
          >
            {props.title}
          </h3>
          {!props.isMobile && props.isMenuExpanded && (
            <p className="text-sm text-gray-500 dark:text-foreground/85 wrap-break-word hyphens-auto">
              {props.caption}
            </p>
          )}
        </div>
      </div>
    </Tooltip>
  );
}

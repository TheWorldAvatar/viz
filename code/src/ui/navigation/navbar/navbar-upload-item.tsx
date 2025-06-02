"use client";

import React from "react";

import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import FileModal from "ui/interaction/modal/file/file-modal";
import { NavBarItem, NavBarItemProps } from "./navbar-item";

/**
 * A nav bar item to upload a file on click.
 *
 * @param {string} title Title.
 * @param {string} icon Icon to display.
 * @param {string} url Redirects to this url when clicked.
 * @param {boolean} isMobile Indicates if the design should be in mobile mode.
 * @param {string} caption Optional description text. Ignored in mobile mode.
 */
export function NavBarUploadItem(
  props: Readonly<NavBarItemProps>
): React.ReactElement {
  const dict: Dictionary = useDictionary();
  const [isFileModalOpen, setIsFileModalOpen] = React.useState<boolean>(false);

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (
    event: React.MouseEvent<HTMLDivElement>
  ): void => {
    event.preventDefault();
    setIsFileModalOpen(true);
  };

  return (
    <>
      <NavBarItem
        title={props.title}
        icon={props.icon}
        url={props.url}
        isMobile={props.isMobile}
        tooltip={dict.nav.tooltip.fileUpload}
        caption={props.caption}
        handleClick={handleClick}
      />
      {isFileModalOpen && (
        <FileModal
          url={props.url}
          isOpen={isFileModalOpen}
          setIsOpen={setIsFileModalOpen}
        />
      )}
    </>
  );
}

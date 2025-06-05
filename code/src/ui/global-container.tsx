"use client";

import React, { useState } from "react";
import Konami from "react-konami-code";
import { Provider } from "react-redux";

import { reduxStore } from "app/store";
import { useBackgroundImageUrl } from "hooks/useBackgroundImageUrl";
import { OptionalPage } from "io/config/optional-pages";
import { UISettings } from "types/settings";
import Trex from "utils/trex";
import ContextMenu from "./interaction/context-menu/context-menu";
import HeaderBar from "./interaction/header/headerbar";
import Footer from "./text/footer";
import { NavMenu } from "./navigation/navbar/nav-menu";

// Incoming properties for global container
interface GlobalContainerProps {
  pages: OptionalPage[];
  settings: UISettings;
  children?: React.ReactNode;
}

/**
 * Component representing a common global page container for all content.
 */
export default function GlobalContainer(props: Readonly<GlobalContainerProps>) {
  const [popup, setPopup] = useState<boolean>(false);
  const [contextMenuVisible, setContextMenuVisible] = useState<boolean>(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const backgroundImageUrl: string = useBackgroundImageUrl();

  const togglePopup = () => {
    setPopup(!popup);
  };

  // Method to handle right-click and show the context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuVisible(true);
    setContextMenuPosition({ x: e.pageX, y: e.pageY });
  };

  // Method to close the context menu when it is no longer needed
  const closeContextMenu = () => {
    setContextMenuVisible(false);
  };

  return (
    <Provider store={reduxStore}>
      <div
        id="globalContainer"
        onContextMenu={handleContextMenu}
        onClick={closeContextMenu} // Close context menu when clicking elsewhere
        style={{
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Conditionally render the ContextMenu component based on contextMenuVisible */}
        {contextMenuVisible && (
          <ContextMenu
            x={contextMenuPosition.x}
            y={contextMenuPosition.y}
            showContextMenu={contextMenuVisible}
          />
        )}

        <HeaderBar pages={props.pages} settings={props.settings} />

        <div className="flex h-screen w-full">
          <NavMenu
            pages={props.pages}
            settings={props.settings}
            isMobile={false}
          />

          <div className="mx-auto mt-4 flex  items-center justify-center p-2 sm:w-sm md:h-11/12 md:w-11/12 lg:h-11/12 lg:w-11/12 lg:p-4 xl:mt-0 xl:h-10/12 xl:w-9/12 2xl:h-11/12">
            {props.children}
          </div>
        </div>

        <Konami action={togglePopup} timeout={6000} resetDelay={1000} />
        {popup && <Trex callback={togglePopup} />}
        <Footer />
      </div>
    </Provider>
  );
}

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
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();

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

        <main className="flex h-screen w-full p-0.5 ">
          {!pathname.endsWith("map") && (
            <NavMenu
              pages={props.pages}
              settings={props.settings}
              isMobile={false}
            />
          )}
          {props.children}
        </main>

        <Konami action={togglePopup} timeout={6000} resetDelay={1000} />
        {popup && <Trex callback={togglePopup} />}
        <Footer />
      </div>
    </Provider>
  );
}

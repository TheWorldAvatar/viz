"use client";

import React, { useCallback, useState } from "react";
import Konami from "react-konami-code";
import { Provider } from "react-redux";

import { reduxStore } from "app/store";
import { useBackgroundImageUrl } from "hooks/useBackgroundImageUrl";
import { useContextMenuOpen } from "hooks/useContextMenuOpen";
import { OptionalPage } from "io/config/optional-pages";
import { usePathname } from "next/navigation";
import { UISettings } from "types/settings";
import Trex from "utils/trex";
import ContextMenu from "./interaction/context-menu/context-menu";
import HeaderBar from "./interaction/header/headerbar";
import { NavMenu } from "./navigation/navbar/nav-menu";
import Footer from "./text/footer";

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

  const openContextMenuAtPageCoords = useCallback((x: number, y: number) => {
    setContextMenuVisible(true);
    setContextMenuPosition({ x, y });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenuVisible(false);
  }, []);

  useContextMenuOpen(openContextMenuAtPageCoords);

  return (
    <Provider store={reduxStore}>
      <div className="flex h-dvh w-full flex-col overflow-hidden">
        <HeaderBar pages={props.pages} settings={props.settings} />
        <main className="flex w-full flex-1 min-h-0"
          style={{
            backgroundImage: `url(${backgroundImageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}>
          {!pathname.endsWith("map") && (
            <NavMenu
              pages={props.pages}
              settings={props.settings}
              isMobile={false}
            />
          )}
          <div className="flex flex-col flex-1 min-h-0 min-w-0 bg-muted h-full box-border">
            <section className="grow overflow-y-auto">
              {props.children}
            </section>
            {!pathname.endsWith("map") && <Footer />}
          </div>
        </main>
      </div>

      <Konami action={togglePopup} timeout={6000} resetDelay={1000} />
      {popup && <Trex callback={togglePopup} />}

      {/* Conditionally render the ContextMenu component based on contextMenuVisible */}
      {contextMenuVisible && (
        <ContextMenu
          x={contextMenuPosition.x}
          y={contextMenuPosition.y}
          onClose={closeContextMenu}
        />
      )}
    </Provider>
  );
}

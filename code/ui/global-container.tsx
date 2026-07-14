"use client";

import React, { useState } from "react";
import Konami from "react-konami-code";
import { Provider } from "react-redux";

import { reduxStore } from "@/app/store";
import { usePullToRefresh } from "@/hooks/screen/usePullToRefresh";
import { useBackgroundImageUrl } from "@/hooks/useBackgroundImageUrl";
import { useContextMenu } from "@/hooks/useContextMenu";
import { useOfflineWarning } from "@/hooks/useOfflineWarning";
import { OptionalPage } from "@/io/config/optional-pages";
import { UISettings } from "@/types/settings";
import Trex from "@/utils/trex";
import { usePathname } from "next/navigation";
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
  const backgroundImageUrl: string = useBackgroundImageUrl();
  const pathname = usePathname();
  const { contextMenuVisible, x: contextMenuX, y: contextMenuY, } = useContextMenu();
  usePullToRefresh();
  useOfflineWarning();

  const togglePopup = () => {
    setPopup(!popup);
  };

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
            <section className="flex-1 min-h-0 overflow-y-auto">
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
          x={contextMenuX}
          y={contextMenuY}
        />
      )}
    </Provider>
  );
}

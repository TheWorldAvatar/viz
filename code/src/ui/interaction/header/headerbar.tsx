"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";

import { useDictionary } from "hooks/useDictionary";
import { OptionalPage } from "io/config/optional-pages";
import { Routes } from "io/config/routes";
import { useEffect, useMemo } from "react";
import { addItem, selectItem } from "state/context-menu-slice";
import { UISettings } from "types/settings";
import IconComponent from "ui/graphic/icon/icon";
import KeycloakUserButton from "ui/interaction/auth/keycloak-user-button";
import { ContextItemDefinition } from "ui/interaction/context-menu/context-item";
import { NavMenu } from "ui/navigation/navbar/nav-menu";
import { usePathname } from "next/navigation";

interface HeaderBarProps {
  pages: OptionalPage[];
  settings: UISettings;
}

/**
 * Represents the top level header bar displaying the various logos and account icon.
 */
export default function HeaderBar(props: Readonly<HeaderBarProps>) {
  const dict = useDictionary();
  const pathname = usePathname();

  const keycloakEnabled = process.env.KEYCLOAK === "true";
  const contextDict = dict.context;
  const headerItem: ContextItemDefinition = useMemo(() => {
    return {
      name: contextDict.navBar.title,
      description: contextDict.navBar.tooltip,
      id: "navbar",
      toggled: true,
    };
  }, []);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(addItem(headerItem));
  }, []);

  // Visibility state of header bar
  const headerBarState = useSelector(selectItem(headerItem.id));

  // Do not show if state exists and is disabled
  if (headerBarState?.toggled != null && !headerBarState.toggled) {
    return null;
  }
  // Backwards compatibility for header bar logo
  if (props.settings.branding.navbarLogo) {
    props.settings.branding.navbar = props.settings?.branding?.navbarLogo;
  }
  return (
    <div
      id="headerbar"
      className="bg-muted border-b-border z-[999] flex h-[6dvh] min-h-[6dvh] items-center justify-between overflow-hidden border-b "
    >
      {/* Render header bar logo if set */}
      {props.settings?.branding?.navbar?.length > 0 && (
        // Handle the case where header bar is a list
        <div className="flex h-14 items-center justify-center gap-2">
          {Array.isArray(props.settings?.branding?.navbar) ? (
            props.settings?.branding?.navbar.map((logo) => (
              <Link key={logo} href={Routes.HOME}>
                <IconComponent
                  icon={logo}
                  classes="h-8 md:h-10 lg:h-10 2xl:h-12 w-auto ml-2 md:ml-8"
                />
              </Link>
            ))
          ) : (
            // Handle the case where header bar is a string
            <Link href={Routes.HOME}>
              <IconComponent
                icon={props.settings?.branding?.navbar}
                classes="h-8 md:h-10 lg:h-10 2xl:h-12 ml-4 w-auto"
              />
            </Link>
          )}
        </div>
      )}

      {/* Render each component as required */}
      <div className="flex items-center justify-center">
        <div className={`flex ${pathname.endsWith("map") ? "" : "xl:hidden"} `}>
          <NavMenu
            pages={props.pages}
            settings={props.settings}
            isMobile={true}
          />
        </div>

        {keycloakEnabled && <KeycloakUserButton />}
      </div>
    </div>
  );
}

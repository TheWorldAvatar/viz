"use client";


import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";

import { useDictionary } from "hooks/useDictionary";
import { Routes } from "io/config/routes";
import { useEffect, useMemo } from "react";
import { addItem, selectItem } from "state/context-menu-slice";
import { UISettings } from "types/settings";
import IconComponent from "ui/graphic/icon/icon";
import KeycloakUserButton from "ui/interaction/auth/keycloak-user-button";
import { ContextItemDefinition } from "ui/interaction/context-menu/context-item";

// Type definition for navbar properties
interface NavbarProps {
  settings: UISettings;
}

/**
 * Represents the top level navigation bar, that loads a number of
 * custom navbar components.
 */
export default function Navbar(props: Readonly<NavbarProps>) {
  const dict = useDictionary();

  const keycloakEnabled = process.env.KEYCLOAK === "true";
  const contextDict = dict.context;
  const navbarItem: ContextItemDefinition = useMemo(() => {
    return {
      name: contextDict.navBar.title,
      description: contextDict.navBar.tooltip,
      id: "navbar",
      toggled: true,
    };
  }, []);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(addItem(navbarItem));
  }, []);

  // Visibility state of navigation bar
  const navbarState = useSelector(selectItem(navbarItem.id));

  // Do not show if state exists and is disabled
  if (navbarState?.toggled != null && !navbarState.toggled) {
    return null;
  }
  // Backwards compatibility for navbar logo
  if (props.settings.branding.navbarLogo) {
    props.settings.branding.navbar = props.settings?.branding?.navbarLogo;
  }
  return (
    <div
      id="navbar"
      className="bg-muted border-b-border z-[999] flex h-16 min-h-16 items-center justify-between overflow-hidden border-b"
    >
      {/* Render navbar logo if set */}
      {props.settings?.branding?.navbar?.length > 0 && (
        // Handle the case where navbar is a list
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
            // Handle the case where navbar is a string
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
        {keycloakEnabled && <KeycloakUserButton />}
      </div>
    </div>
  );
}

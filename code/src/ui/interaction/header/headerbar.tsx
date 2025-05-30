"use client";

import styles from "./navbar.module.css";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";

import { useDictionary } from "hooks/useDictionary";
import { Routes } from "io/config/routes";
import { useEffect, useMemo } from "react";
import { addItem, selectItem } from "state/context-menu-slice";
import { UISettings } from "types/settings";
import IconComponent from "ui/graphic/icon/icon";
import KeycloakUserButton from "ui/interaction/auth/keycloak-user-button";
import { PermissionScheme } from "types/auth";
import { usePermissionScheme } from "hooks/auth/usePermissionScheme";
import { ContextItemDefinition } from "ui/interaction/context-menu/context-item";
import PopoverActionButton from "../action/popover/popover-button";
import { MobileMenuItem } from "ui/navigation/navbar/mobile-menu-item";
import { Assets } from "io/config/assets";

interface HeaderBarProps {
  settings: UISettings;
}

/**
 * Represents the top level header bar displaying the various logos and account icon.
 */
export default function HeaderBar(props: Readonly<HeaderBarProps>) {
  const dict = useDictionary();

  const permissionScheme: PermissionScheme = usePermissionScheme();

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
      className="bg-muted border-b-border z-[999] flex h-16 min-h-16 items-center justify-between overflow-hidden border-b"
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
        <div className="flex xl:hidden">
          <PopoverActionButton
            icon={"menu"}
            styling={{ text: styles.text }}
            isHoverableDisabled={true}
            isTransparent={true}
            placement="bottom-end"
            className={styles.hamburgerMenuButton}
          >
            <div className="flex flex-col justify-start gap-4 p-2 ">
              {props.settings?.modules?.landing && (
                <MobileMenuItem
                  title="Home"
                  icon={Assets.INFO}
                  url={Routes.HOME}
                />
              )}
              {props.settings?.modules?.map && (
                <MobileMenuItem
                  title="Map"
                  icon={Assets.MAP}
                  url={Routes.MAP}
                />
              )}
              {props.settings?.modules?.dashboard && (
                <MobileMenuItem
                  title="Dashboard"
                  icon={Assets.DASHBOARD}
                  url={Routes.DASHBOARD}
                />
              )}
              {props.settings?.modules?.help && (
                <MobileMenuItem
                  title="Help Centre"
                  icon={Assets.HELP}
                  url={Routes.HELP}
                />
              )}
              {props.settings?.modules?.registry && (
                <MobileMenuItem
                  title="Registry"
                  icon={Assets.REGISTRY}
                  url={`${Routes.REGISTRY_PENDING}/${props.settings?.resources?.registry?.data}`}
                />
              )}
              {props.settings.links?.map((externalLink, index) => {
                if (
                  ![
                    Routes.MAP,
                    Routes.DASHBOARD,
                    Routes.HELP,
                    Routes.REGISTRY,
                  ].includes(externalLink.url) &&
                  // When authentication is disabled OR no permission is set for this button in the UI-Settings, all users can view and access these buttons
                  // IF there is a permission set with authentication enabled, check if the user has the specified permission
                  (!keycloakEnabled ||
                    !externalLink?.permission ||
                    permissionScheme?.hasPermissions[externalLink.permission])
                ) {
                  return (
                    <MobileMenuItem
                      key={externalLink.title + index}
                      title={externalLink.title}
                      icon={externalLink.icon}
                      url={externalLink.url}
                      type={externalLink.type}
                    />
                  );
                }
              })}
            </div>
          </PopoverActionButton>
        </div>

        {keycloakEnabled && <KeycloakUserButton />}
      </div>
    </div>
  );
}

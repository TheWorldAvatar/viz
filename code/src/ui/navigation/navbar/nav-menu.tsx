"use client";

import React, { useMemo } from "react";

import { usePermissionScheme } from "hooks/auth/usePermissionScheme";
import { Assets } from "io/config/assets";
import { Modules, Routes } from "io/config/routes";
import { PermissionScheme } from "types/auth";
import { NavBarItemSettings, UISettings } from "types/settings";
import { NavBarItem } from "./navbar-item";
import { NavBarUploadItem } from "./navbar-upload-item";
import { OptionalPage } from "io/config/optional-pages";
import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import { parseStringsForUrls, parseWordsForLabels } from "utils/client-utils";


export interface NavMenuProps {
  settings: UISettings;
  isMobile: boolean;
  pages?: OptionalPage[];
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * A menu item containing navigation options.
 *
 * @param {UISettings} settings Settings declared in the user configuration Title.
 * @param {boolean} isMobile Indicates if the menu should be in mobile mode.
 * @param {OptionalPage[]} pages Additional pages to be redirected.
 * @param setIsOpen Optional dispatch function to dismiss the menu in mobile mode.
 */
export function NavMenu(
  props: Readonly<NavMenuProps>
): React.ReactElement {
  const ASSET_PREFIX = process.env.ASSET_PREFIX ?? "";
  const keycloakEnabled = process.env.KEYCLOAK === "true";
  const dict: Dictionary = useDictionary();
  const permissionScheme: PermissionScheme = usePermissionScheme();

  // Retrieve links
  const dashboardLinkProps: NavBarItemSettings = props.settings.links?.find(
    (link) => link.url === Modules.DASHBOARD
  );
  const helpLinkProps: NavBarItemSettings = props.settings.links?.find(
    (link) => link.url === Modules.HELP
  );
  const mapLinkProps: NavBarItemSettings = props.settings.links?.find(
    (link) => link.url === Modules.MAP
  );
  const registryLinkProps: NavBarItemSettings = props.settings.links?.find(
    (link) => link.url === Modules.REGISTRY
  );
  const registryUrl: string = useMemo(() => {
    // Defaults to pending registry with no route or scheme is disabled
    let url: string = `${Routes.REGISTRY_PENDING}/${props.settings.resources?.registry?.data}`;
    if (permissionScheme?.registryPageLink) {
      url = permissionScheme?.registryPageLink;
      // Only update the permission route if they are pending or active
      if (url === Routes.REGISTRY_PENDING || url === Routes.REGISTRY_ACTIVE) {
        url = `${url}/${props.settings.resources?.registry?.data}`;
      }
    }
    return url;
  }, [permissionScheme]);

  return (
    <div className={`${props.isMobile ? "flex gap-4 p-2" : " bg-muted border-r-border hidden w-3xs items-center gap-6 overflow-x-scroll overflow-y-auto border-r pb-20 lg:w-xs xl:flex 2xl:w-xs"}
         flex-col justify-start`}>
      {props.pages?.filter((page) => page.slug !== "landing" && page.slug !== "help")
        .map((page) => (
          <NavBarItem
            key={page.title}
            title={page.title}
            icon={page.thumbnail ?? Assets.INFO}
            url={`${ASSET_PREFIX}/${page.slug}`}
            isMobile={false}
            caption={page.description}
          />
        ))}
      {props.settings?.modules?.landing && (
        <NavBarItem
          title={dict.nav.title.home}
          icon={Assets.INFO}
          url={Routes.HOME}
          isMobile={props.isMobile}
          setIsOpen={props.setIsOpen}
        />
      )}
      {props.settings?.modules?.map && (
        <NavBarItem
          title={mapLinkProps?.title ?? dict.nav.title.map}
          icon={mapLinkProps?.icon ?? Assets.MAP}
          url={Routes.MAP}
          isMobile={props.isMobile}
          setIsOpen={props.setIsOpen}
          caption={mapLinkProps?.caption ?? dict.nav.caption.map}
        />
      )}
      {props.settings?.modules?.dashboard && (
        <NavBarItem
          title={dashboardLinkProps?.title ?? dict.nav.title.dashboard}
          icon={dashboardLinkProps?.icon ?? Assets.DASHBOARD}
          url={Routes.DASHBOARD}
          isMobile={false}
          setIsOpen={props.setIsOpen}
          caption={
            dashboardLinkProps?.caption ?? dict.nav.caption.dashboard
          }
        />
      )}
      {props.settings?.modules?.help && (
        <NavBarItem
          title={helpLinkProps?.title ?? dict.nav.title.help}
          icon={helpLinkProps?.icon ?? Assets.HELP}
          url={Routes.HELP}
          isMobile={props.isMobile}
          setIsOpen={props.setIsOpen}
          caption={helpLinkProps?.caption ?? dict.nav.caption.help}
        />
      )}

      {props.settings.modules.registry &&
        props.settings.resources?.registry?.data && (
          <NavBarItem
            title={registryLinkProps?.title ?? dict.nav.title.registry}
            icon={registryLinkProps?.icon ?? Assets.REGISTRY}
            url={registryUrl}
            isMobile={props.isMobile}
            caption={
              registryLinkProps?.caption ?? dict.nav.caption.registry
            }
            setIsOpen={props.setIsOpen}
          />
        )}

      {props.settings.modules.registry &&
        props.settings.resources?.registry?.paths?.map((path, index) => (
          <NavBarItem
            key={path + index}
            title={parseWordsForLabels(path)}
            icon={Assets.REGISTRY}
            url={`${Routes.REGISTRY_GENERAL}/${parseStringsForUrls(path)}`}
            isMobile={props.isMobile}
            caption={dict.nav.caption.generalReg.replace(
              "{replace}",
              parseWordsForLabels(path).toLowerCase()
            )}
            setIsOpen={props.setIsOpen}
          />
        ))}

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
            externalLink.type === "file" ? <NavBarUploadItem
              key={externalLink.title + index}
              title={externalLink.title}
              icon={externalLink.icon}
              url={externalLink.url}
              isMobile={props.isMobile}
              caption={externalLink.caption}
            /> : <NavBarItem
              key={externalLink.title + index}
              title={externalLink.title}
              icon={externalLink.icon}
              url={externalLink.url}
              isMobile={props.isMobile}
              setIsOpen={props.setIsOpen}
              caption={externalLink.caption}
            />
          );
        }
      })}
    </div>
  );
}

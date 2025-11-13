"use client";

import React, { useRef, useState } from "react";

import { Icon } from "@mui/material";
import { usePermissionScheme } from "hooks/auth/usePermissionScheme";
import { useDictionary } from "hooks/useDictionary";
import { OptionalPage } from "io/config/optional-pages";
import { Modules, Routes } from "io/config/routes";
import { PermissionScheme } from "types/auth";
import { Dictionary } from "types/dictionary";
import { NavBarItemSettings, UISettings } from "types/settings";
import PopoverActionButton from "ui/interaction/action/popover/popover-button";
import FileModal from "ui/interaction/modal/file/file-modal";
import { parseStringsForUrls, parseWordsForLabels } from "utils/client-utils";
import { NavBarItem, NavBarItemType } from "./navbar-item";

export interface NavMenuProps {
  pages: OptionalPage[];
  settings: UISettings;
  isMobile: boolean;
  setContentWidthClass?: React.Dispatch<React.SetStateAction<string>>;
}

interface NavMenuContentsProps extends NavMenuProps {
  setFileUploadEndpoint: React.Dispatch<React.SetStateAction<string>>;
  setFileModalType: React.Dispatch<React.SetStateAction<NavBarItemType>>;
  setIsFileUploadModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * A menu displaying the navigation options.
 *
 * @param {OptionalPage[]} pages Additional pages to be redirected.
 * @param {UISettings} settings Settings declared in the user configuration Title.
 * @param {boolean} isMobile Indicates if the menu should be in mobile mode.
 */
export function NavMenu(props: Readonly<NavMenuProps>): React.ReactElement {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [fileUploadEndpoint, setFileUploadEndpoint] = useState<string>("");
  const [fileModalType, setFileModalType] = useState<NavBarItemType>("default");
  const [isFileModalOpen, setIsFileModalOpen] = useState<boolean>(false);

  if (props.isMobile) {
    return (
      <div className="flex mr-1.5">
        <PopoverActionButton
          variant="ghost"
          leftIcon="menu"
          size="icon"
          isOpen={isMenuOpen}
          setIsOpen={setIsMenuOpen}
          placement="bottom-end"
          className="mr-4 w-12 h-12 "
        >
          <NavMenuContents
            {...props}
            setFileUploadEndpoint={setFileUploadEndpoint}
            setFileModalType={setFileModalType}
            setIsFileUploadModalOpen={setIsFileModalOpen}
            setIsMenuOpen={setIsMenuOpen}
          />
        </PopoverActionButton>
        {isFileModalOpen && (
          <FileModal
            url={fileUploadEndpoint}
            type={fileModalType}
            isOpen={isFileModalOpen}
            setIsOpen={setIsFileModalOpen}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <NavMenuContents
        {...props}
        setFileUploadEndpoint={setFileUploadEndpoint}
        setFileModalType={setFileModalType}
        setIsFileUploadModalOpen={setIsFileModalOpen}
      />
      {isFileModalOpen && (
        <FileModal
          url={fileUploadEndpoint}
          type={fileModalType}
          isOpen={isFileModalOpen}
          setIsOpen={setIsFileModalOpen}
        />
      )}
    </>
  );
}
/**
 * The contents for the navigation menu.
 *
 * @param {OptionalPage[]} pages Additional pages to be redirected.
 * @param {UISettings} settings Settings declared in the user configuration Title.
 * @param {boolean} isMobile Indicates if the menu should be in mobile mode.
 * @param setIsOpen Optional dispatch function to dismiss the menu in mobile mode.
 */
function NavMenuContents(
  props: Readonly<NavMenuContentsProps>
): React.ReactElement {
  const ASSET_PREFIX = process.env.ASSET_PREFIX ?? "";
  const keycloakEnabled = process.env.KEYCLOAK === "true";
  const dict: Dictionary = useDictionary();
  const permissionScheme: PermissionScheme = usePermissionScheme();
  const [isMenuExpanded, setIsMenuExpanded] = useState<boolean>(true);
  const [navMenuWidthClass, setNavMenuWidthClass] = useState<string>(
    "w-[16vw] xl:w-[18vw] 2xl:w-[16vw]"
  );
  const navMenuRef = useRef<HTMLDivElement>(null);

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

  const billingLinkProps: NavBarItemSettings = props.settings.links?.find(
    (link) => link.url === Modules.BILLING
  );

  function createHandleFileClick(
    url: string,
    type: NavBarItemType
  ): React.MouseEventHandler<HTMLDivElement> {
    return (event: React.MouseEvent<HTMLDivElement>): void => {
      event.preventDefault();
      props.setFileUploadEndpoint(url);
      props.setIsFileUploadModalOpen(true);
      props.setFileModalType(type);
      props.setIsMenuOpen?.(false);
    };
  }

  const handleMenuToggle = () => {
    if (isMenuExpanded) {
      setNavMenuWidthClass("w-[6vw]");
      props.setContentWidthClass("w-[calc(100vw-6vw)]");
    } else {
      setNavMenuWidthClass("w-[16vw] xl:w-[18vw] 2xl:w-[16vw]");
      props.setContentWidthClass(
        "w-[calc(100vw-16vw)] xl:w-[calc(100vw-18vw)] 2xl:w-[calc(100vw-16vw)]"
      );
    }

    setIsMenuExpanded(!isMenuExpanded);
  };

  return (
    <div
      ref={navMenuRef}
      className={`${props.isMobile
        ? "flex gap-4 p-2 w-full"
        : "bg-muted border-r-border hidden items-center gap-6 overflow-x-hidden overflow-y-auto border-r pb-20"
        }
      ${navMenuWidthClass}
      xl:flex flex-col ${isMenuExpanded ? "items-stretch" : "items-center"
        }  transition-all duration-200 ease-in-out `}
    >
      {!props.isMobile && (
        <button
          className={`flex cursor-pointer mt-4  p-4  transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-zinc-700 ${isMenuExpanded
            ? "mr-2 self-end rounded-md -mb-8 "
            : " justify-center items-center rounded-full -mb-4"
            }`}
          onClick={handleMenuToggle}
        >
          <Icon className="material-symbols-outlined">
            {isMenuExpanded ? "keyboard_tab_rtl" : "keyboard_tab"}
          </Icon>
        </button>
      )}
      {props.settings?.modules?.landing && (
        <NavBarItem
          title={dict.nav.title.home}
          icon="home"
          url={Routes.HOME}
          isMobile={props.isMobile}
          setIsOpen={props.setIsMenuOpen}
          isMenuExpanded={isMenuExpanded}
        />
      )}

      {props.pages
        ?.filter((page) => page.slug !== "landing" && page.slug !== "help")
        .map((page) => (
          <NavBarItem
            key={page.title}
            title={page.title}
            icon={page.thumbnail ?? "info"}
            url={`${ASSET_PREFIX}/${page.slug}`}
            isMobile={props.isMobile}
            caption={isMenuExpanded ? page.description : undefined}
            isMenuExpanded={isMenuExpanded}
            setIsOpen={props.setIsMenuOpen}
          />
        ))}

      {props.settings?.modules?.map && (
        <NavBarItem
          title={mapLinkProps?.title ?? dict.nav.title.map}
          icon={mapLinkProps?.icon ?? "map"}
          url={Routes.MAP}
          isMobile={props.isMobile}
          setIsOpen={props.setIsMenuOpen}
          caption={
            isMenuExpanded
              ? mapLinkProps?.caption ?? dict.nav.caption.map
              : undefined
          }
          isMenuExpanded={isMenuExpanded}
        />
      )}
      {props.settings?.modules?.dashboard && (
        <NavBarItem
          title={dashboardLinkProps?.title ?? dict.nav.title.dashboard}
          icon={dashboardLinkProps?.icon ?? "dashboard"}
          url={Routes.DASHBOARD}
          isMobile={props.isMobile}
          setIsOpen={props.setIsMenuOpen}
          caption={
            isMenuExpanded
              ? dashboardLinkProps?.caption ?? dict.nav.caption.dashboard
              : undefined
          }
          isMenuExpanded={isMenuExpanded}
        />
      )}
      {props.settings?.modules?.billing && (
        <NavBarItem
          title={billingLinkProps?.title ?? dict.nav.title.billing}
          icon="receipt_long"
          url={Routes.BILLING_BILLING_ACCOUNTS}
          isMobile={props.isMobile}
          setIsOpen={props.setIsMenuOpen}
          caption={
            isMenuExpanded
              ? billingLinkProps?.caption ?? dict.nav.caption.billing
              : undefined
          }
          isMenuExpanded={isMenuExpanded}
        />
      )}
      {props.settings?.modules?.help && (
        <NavBarItem
          title={helpLinkProps?.title ?? dict.nav.title.help}
          icon={helpLinkProps?.icon ?? "help"}
          url={Routes.HELP}
          isMobile={props.isMobile}
          setIsOpen={props.setIsMenuOpen}
          caption={
            isMenuExpanded
              ? helpLinkProps?.caption ?? dict.nav.caption.help
              : undefined
          }
          isMenuExpanded={isMenuExpanded}
        />
      )}

      {props.settings.modules.registry &&
        props.settings.resources?.registry?.data &&
        (!keycloakEnabled ||
          permissionScheme?.hasPermissions.registry ||
          permissionScheme?.hasPermissions.pendingRegistry) && (
          <NavBarItem
            title={registryLinkProps?.title ?? dict.nav.title.registry}
            icon={registryLinkProps?.icon ?? "table_chart"}
            url={
              !keycloakEnabled ||
                permissionScheme?.hasPermissions.pendingRegistry
                ? `${Routes.REGISTRY_GENERAL}/${props.settings.resources?.registry?.data}`
                : Routes.REGISTRY_TASK_OUTSTANDING
            }
            isMobile={props.isMobile}
            caption={
              isMenuExpanded
                ? registryLinkProps?.caption ?? dict.nav.caption.registry
                : undefined
            }
            setIsOpen={props.setIsMenuOpen}
            isMenuExpanded={isMenuExpanded}
          />
        )}

      {props.settings.modules.registry &&
        props.settings.resources?.registry?.paths?.map((path, index) => (
          <NavBarItem
            key={path.type + index}
            title={parseWordsForLabels(path.type)}
            icon={path.icon ?? registryLinkProps?.icon ?? "table_chart"}
            url={`${Routes.REGISTRY_GENERAL}/${parseStringsForUrls(path.type)}`}
            isMobile={props.isMobile}
            caption={
              isMenuExpanded
                ? dict.nav.caption.generalReg.replace(
                  "{replace}",
                  parseWordsForLabels(path.type).toLowerCase()
                )
                : undefined
            }
            setIsOpen={props.setIsMenuOpen}
            isMenuExpanded={isMenuExpanded}
          />
        ))}

      {props.settings.links?.map((externalLink, index) => {
        if (
          ![
            Modules.DASHBOARD,
            Modules.HELP,
            Modules.MAP,
            Modules.REGISTRY,
          ].includes(externalLink.url) &&
          // When authentication is disabled OR no permission is set for this button in the UI-Settings, all users can view and access these buttons
          // IF there is a permission set with authentication enabled, check if the user has the specified permission
          (!keycloakEnabled ||
            !externalLink?.permission ||
            permissionScheme?.hasPermissions[externalLink.permission])
        ) {
          return (
            <NavBarItem
              key={externalLink.title + index}
              title={externalLink.title}
              icon={externalLink.icon}
              url={externalLink.url}
              isMobile={props.isMobile}
              tooltip={
                externalLink.type === "file"
                  ? dict.nav.tooltip.fileUpload
                  : undefined
              }
              caption={isMenuExpanded ? externalLink.caption : undefined}
              setIsOpen={props.setIsMenuOpen}
              handleClick={
                !externalLink.type || externalLink.type === "default"
                  ? undefined
                  : createHandleFileClick(externalLink.url, externalLink.type)
              }
              isMenuExpanded={isMenuExpanded}
            />
          );
        }
      })}
    </div>
  );
}

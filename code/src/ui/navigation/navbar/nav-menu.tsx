"use client";

import React, { useRef, useState } from "react";

import { usePermissionGuard } from "hooks/auth/usePermissionGuard";
import { useDictionary } from "hooks/useDictionary";
import { OptionalPage } from "io/config/optional-pages";
import { Modules, Routes } from "io/config/routes";
import { Dictionary } from "types/dictionary";
import { NavBarItemSettings, UISettings } from "types/settings";
import PopoverActionButton from "ui/interaction/action/popover/popover-button";
import FileModal from "ui/interaction/modal/file/file-modal";
import { parseStringsForUrls, parseWordsForLabels } from "utils/client-utils";
import { NavBarItem, NavBarItemType } from "./navbar-item";
import Button from "ui/interaction/button";


export interface NavMenuProps {
  pages: OptionalPage[];
  settings: UISettings;
  isMobile: boolean;
}

interface NavMenuContentsProps extends NavMenuProps {
  setFileUploadEndpoint: React.Dispatch<React.SetStateAction<string>>;
  setFileModalType: React.Dispatch<React.SetStateAction<NavBarItemType>>;
  setIsFileUploadModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMenuExpanded?: boolean;
  setIsMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  handleMenuToggle?: () => void;
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

  const [isMenuExpanded, setIsMenuExpanded] = useState<boolean>(true);
  const [nonMobileNavMenuWidth, setNonMobileNavMenuWidth] = useState<string>("w-1/5");

  if (props.isMobile) {
    return (
      <nav className="flex mr-1.5 lg:hidden">
        <PopoverActionButton
          variant="ghost"
          leftIcon="menu"
          size="icon"
          isOpen={isMenuOpen}
          setIsOpen={setIsMenuOpen}
          placement="bottom-end"
          className="mr-4 h-12 "
        >
          <NavMenuContents
            {...props}
            isMenuExpanded={isMenuExpanded}
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
      </nav>
    );
  }

  const handleMenuToggle = () => {
    if (isMenuExpanded) {
      setNonMobileNavMenuWidth("w-1/20 md:w-1/15");
    } else {
      setNonMobileNavMenuWidth("w-1/5");
    }

    setIsMenuExpanded(!isMenuExpanded);
  };

  return (
    <div className={`${nonMobileNavMenuWidth} overflow-y-auto bg-muted border-r-border border-r hidden lg:block transition-all duration-200 ease-in-out`}>
      <NavMenuContents
        {...props}
        isMenuExpanded={isMenuExpanded}
        setFileUploadEndpoint={setFileUploadEndpoint}
        setFileModalType={setFileModalType}
        setIsFileUploadModalOpen={setIsFileModalOpen}
        setIsMenuOpen={setIsMenuOpen}
        handleMenuToggle={handleMenuToggle}
      />
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
  const dict: Dictionary = useDictionary();
  const isPermitted = usePermissionGuard();
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

  return (
    <nav
      ref={navMenuRef}
      className={`${props.isMobile
        ? "flex gap-4 p-2 w-full"
        : "items-center gap-4 overflow-x-hidden px-0 xl:px-4 pb-4 shrink-0"
        }
      xl:flex flex-col ${props.isMenuExpanded ? "items-stretch" : "items-center"
        }`}
    >
      {!props.isMobile && (
        <Button
          variant="ghost"
          size="icon"
          leftIcon={props.isMenuExpanded ? "keyboard_tab_rtl" : "keyboard_tab"}
          className={`!flex mt-4 p-7 
            ${props.isMenuExpanded
              ? "ml-auto rounded-md"
              : "items-center !rounded-full"
            }`}
          onClick={props.handleMenuToggle}
        />
      )}
      {props.settings?.modules?.landing && (

        <NavBarItem
          title={dict.nav.title.home}
          icon="home"
          url={Routes.HOME}
          isMobile={props.isMobile}
          setIsOpen={props.setIsMenuOpen}
          isMenuExpanded={props.isMenuExpanded}
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
            caption={props.isMenuExpanded ? page.description : undefined}
            isMenuExpanded={props.isMenuExpanded}
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
            props.isMenuExpanded
              ? mapLinkProps?.caption ?? dict.nav.caption.map
              : undefined
          }
          isMenuExpanded={props.isMenuExpanded}
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
            props.isMenuExpanded
              ? dashboardLinkProps?.caption ?? dict.nav.caption.dashboard
              : undefined
          }
          isMenuExpanded={props.isMenuExpanded}
        />
      )}
      {props.settings?.modules?.billing && isPermitted("invoice") && (
        <NavBarItem
          title={billingLinkProps?.title ?? dict.nav.title.billing}
          icon="receipt_long"
          url={Routes.BILLING_ACCOUNTS}
          isMobile={props.isMobile}
          setIsOpen={props.setIsMenuOpen}
          caption={
            props.isMenuExpanded
              ? billingLinkProps?.caption ?? dict.nav.caption.billing
              : undefined
          }
          isMenuExpanded={props.isMenuExpanded}
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
            props.isMenuExpanded
              ? helpLinkProps?.caption ?? dict.nav.caption.help
              : undefined
          }
          isMenuExpanded={props.isMenuExpanded}
        />
      )}

      {props.settings.modules.registry &&
        props.settings.resources?.registry?.data && (
          <NavBarItem
            title={registryLinkProps?.title ?? dict.nav.title.registry}
            icon={registryLinkProps?.icon ?? "table_chart"}
            url={
              isPermitted("registryFullAccess")
                ? `${Routes.REGISTRY_GENERAL}/${props.settings.resources?.registry?.data}`
                : Routes.REGISTRY_TASK_OUTSTANDING
            }
            isMobile={props.isMobile}
            caption={
              props.isMenuExpanded
                ? registryLinkProps?.caption ?? dict.nav.caption.registry
                : undefined
            }
            setIsOpen={props.setIsMenuOpen}
            isMenuExpanded={props.isMenuExpanded}
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
              props.isMenuExpanded
                ? dict.nav.caption.generalReg.replace(
                  "{replace}",
                  parseWordsForLabels(path.type).toLowerCase()
                )
                : undefined
            }
            setIsOpen={props.setIsMenuOpen}
            isMenuExpanded={props.isMenuExpanded}
          />
        ))}

      {props.settings.links?.map((externalLink, index) => {
        if (
          !Object.values(Modules).includes(externalLink.url) &&
          // When authentication is disabled OR no permission is set for this button in the UI-Settings, all users can view and access these buttons
          // IF there is a permission set with authentication enabled, check if the user has the specified permission
          (!externalLink?.permission ||
            isPermitted(externalLink.permission))
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
              caption={props.isMenuExpanded ? externalLink.caption : undefined}
              setIsOpen={props.setIsMenuOpen}
              handleClick={
                !externalLink.type || externalLink.type === "default"
                  ? undefined
                  : createHandleFileClick(externalLink.url, externalLink.type)
              }
              isMenuExpanded={props.isMenuExpanded}
            />
          );
        }
      })}
    </nav>
  );
}

"use client";
/**
 * Optional landing page.
 */

import "github-markdown-css/github-markdown.css";
import styles from "./landing.module.css";

import markdownit from "markdown-it";
import { useMemo } from "react";

import { usePermissionScheme } from "hooks/auth/usePermissionScheme";
import { Assets } from "io/config/assets";
import { OptionalPage } from "io/config/optional-pages";
import { Modules, Routes } from "io/config/routes";
import { PermissionScheme } from "types/auth";
import { Dictionary } from "types/dictionary";
import { NavBarItemSettings, UISettings } from "types/settings";
import { NavBarUploadItem } from "ui/navigation/navbar/navbar-upload-item";
import { parseStringsForUrls, parseWordsForLabels } from "utils/client-utils";
import { NavBarItem } from "../navigation/navbar/navbar-item";

// Utilities to render markdown into HTML
const markdowner = markdownit({
  html: true,
  typographer: true,
  breaks: true,
  linkify: true,
});

interface LandingPageProps {
  dict: Dictionary;
  settings: UISettings;
  pages: OptionalPage[];
}

/**
 * Represents a standard landing page for the TWA platform. Can optionally
 * contain dynamically created links to other static pages (e.g. acknowledgements,
 * glossaries, licensing etc.).
 *
 * @returns JSX for landing page.
 */
export default function LandingPage(props: Readonly<LandingPageProps>) {
  const ASSET_PREFIX = process.env.ASSET_PREFIX ?? "";
  const keycloakEnabled = process.env.KEYCLOAK === "true";
  // CSS class names
  const introClasses = ["markdown-body", styles.introInner].join(" ");
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
    <div className="flex h-screen w-full">
      {/* This is the navigation on the left */}
      <div className="bg-muted  border-r-border hidden w-3xs flex-col items-center justify-start gap-6 overflow-x-scroll overflow-y-auto border-r pb-20 lg:w-xs xl:flex 2xl:w-xs">
        {props.pages
          .filter((page) => page.slug !== "landing" && page.slug !== "help")
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

        {props.settings.modules.map && (
          <NavBarItem
            title={mapLinkProps?.title ?? props.dict.nav.title.map}
            icon={mapLinkProps?.icon ?? Assets.MAP}
            url={Routes.MAP}
            isMobile={false}
            caption={mapLinkProps?.caption ?? props.dict.nav.caption.map}
          />
        )}
        {props.settings.modules.dashboard && (
          <NavBarItem
            title={dashboardLinkProps?.title ?? props.dict.nav.title.dashboard}
            icon={dashboardLinkProps?.icon ?? Assets.DASHBOARD}
            url={Routes.DASHBOARD}
            isMobile={false}
            caption={
              dashboardLinkProps?.caption ?? props.dict.nav.caption.dashboard
            }
          />
        )}
        {props.settings.modules.registry &&
          props.settings.resources?.registry?.data && (
            <NavBarItem
              title={registryLinkProps?.title ?? props.dict.nav.title.registry}
              icon={registryLinkProps?.icon ?? Assets.REGISTRY}
              url={registryUrl}
              isMobile={false}
              caption={
                registryLinkProps?.caption ?? props.dict.nav.caption.registry
              }
            />
          )}
        {props.settings.modules.registry &&
          props.settings.resources?.registry?.paths?.map((path, index) => (
            <NavBarItem
              key={path + index}
              title={parseWordsForLabels(path)}
              icon={Assets.REGISTRY}
              url={`${Routes.REGISTRY_GENERAL}/${parseStringsForUrls(path)}`}
              isMobile={false}
              caption={props.dict.nav.caption.generalReg.replace(
                "{replace}",
                parseWordsForLabels(path).toLowerCase()
              )}
            />
          ))}

        {props.settings.modules.help && (
          <NavBarItem
            title={helpLinkProps?.title ?? props.dict.nav.title.help}
            icon={helpLinkProps?.icon ?? Assets.HELP}
            url={Routes.HELP}
            isMobile={false}
            caption={helpLinkProps?.caption ?? props.dict.nav.caption.help}
          />
        )}

        {props.settings.links?.map((externalLink, index) => {
          if (
            ![
              Modules.MAP,
              Modules.DASHBOARD,
              Modules.HELP,
              Modules.REGISTRY,
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
                isMobile={false}
                caption={externalLink.caption}
              /> : <NavBarItem
                key={externalLink.title + index}
                title={externalLink.title}
                icon={externalLink.icon}
                url={externalLink.url}
                isMobile={false}
                caption={externalLink.caption}
              />
            );
          }
        })}
      </div>
      {/* This is the where the tumnnail and Project outline is */}
      <div className="mx-auto mt-4 flex h-4/5 items-center justify-center p-2 sm:w-sm md:h-11/12 md:w-11/12 lg:h-11/12 lg:w-11/12 lg:p-4 xl:mt-0 xl:h-10/12 xl:w-9/12 2xl:h-11/12">
        <div className="bg-muted border-border flex h-full flex-col rounded-xl border-1 p-5 shadow-2xl">
          <div
            className={introClasses}
            dangerouslySetInnerHTML={{
              __html: getIntroductionContent(props.pages),
            }}
          />
        </div>
      </div>
    </div>
  );
}
/**
 * Grabs introduction content from the optional page defining the landing.
 *
 * @returns Introduction HTML content.
 */
function getIntroductionContent(pages: OptionalPage[]): string {
  const filteredPages: OptionalPage[] = pages.filter(
    (page) => page.slug === "landing"
  );
  if (filteredPages.length === 0) {
    return "";
  }
  // Only one page should be returned

  return markdowner.render(filteredPages[0]?.content);
}

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
import { UISettings } from "types/settings";
import { parseStringsForUrls, parseWordsForLabels } from "utils/client-utils";
import {
  DefaultPageThumbnail,
  DefaultPageThumbnailProps,
} from "./page-thumbnail";

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
  const dashboardLinkProps: DefaultPageThumbnailProps =
    props.settings.links?.find((link) => link.url === Modules.DASHBOARD);
  const helpLinkProps: DefaultPageThumbnailProps = props.settings.links?.find(
    (link) => link.url === Modules.HELP,
  );
  const mapLinkProps: DefaultPageThumbnailProps = props.settings.links?.find(
    (link) => link.url === Modules.MAP,
  );
  const registryLinkProps: DefaultPageThumbnailProps =
    props.settings.links?.find((link) => link.url === Modules.REGISTRY);
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
    <div className="flex h-screen w-full pb-2">
      {/* This is the navigation on the left */}
      <div className="bg-muted border-r-border hidden w-3xs flex-col items-center justify-start gap-6 overflow-x-scroll overflow-y-auto border-r pb-20 lg:w-xs xl:flex 2xl:w-xs">
        {props.pages
          .filter((page) => page.slug !== "landing" && page.slug !== "help")
          .map((page) => (
            <DefaultPageThumbnail
              key={page.title}
              title={page.title}
              caption={page.description}
              icon={page.thumbnail ?? Assets.INFO}
              url={`${ASSET_PREFIX}/${page.slug}`}
            />
          ))}

        {props.settings.modules.map && (
          <DefaultPageThumbnail
            title={mapLinkProps?.title ?? props.dict.nav.title.map}
            caption={mapLinkProps?.caption ?? props.dict.nav.caption.map}
            icon={mapLinkProps?.icon ?? Assets.MAP}
            url={Routes.MAP}
          />
        )}
        {props.settings.modules.dashboard && (
          <DefaultPageThumbnail
            title={dashboardLinkProps?.title ?? props.dict.nav.title.dashboard}
            caption={
              dashboardLinkProps?.caption ?? props.dict.nav.caption.dashboard
            }
            icon={dashboardLinkProps?.icon ?? Assets.DASHBOARD}
            url={Routes.DASHBOARD}
          />
        )}
        {props.settings.modules.registry &&
          props.settings.resources?.registry?.data && (
            <DefaultPageThumbnail
              title={registryLinkProps?.title ?? props.dict.nav.title.registry}
              caption={
                registryLinkProps?.caption ?? props.dict.nav.caption.registry
              }
              icon={registryLinkProps?.icon ?? Assets.REGISTRY}
              url={registryUrl}
            />
          )}
        {props.settings.modules.registry &&
          props.settings.resources?.registry?.paths?.map((path, index) => (
            <DefaultPageThumbnail
              key={path + index}
              title={parseWordsForLabels(path)}
              caption={props.dict.nav.caption.generalReg.replace(
                "{replace}",
                parseWordsForLabels(path).toLowerCase(),
              )}
              icon={Assets.REGISTRY}
              url={`${Routes.REGISTRY_GENERAL}/${parseStringsForUrls(path)}`}
            />
          ))}

        {props.settings.modules.help && (
          <DefaultPageThumbnail
            title={helpLinkProps?.title ?? props.dict.nav.title.help}
            caption={helpLinkProps?.caption ?? props.dict.nav.caption.help}
            icon={helpLinkProps?.icon ?? Assets.HELP}
            url={Routes.HELP}
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
              <DefaultPageThumbnail
                key={externalLink.title + index}
                title={externalLink.title}
                caption={externalLink.caption}
                icon={externalLink.icon}
                url={externalLink.url}
                type={externalLink.type}
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
    (page) => page.slug === "landing",
  );
  if (filteredPages.length === 0) {
    return "";
  }
  // Only one page should be returned

  return markdowner.render(filteredPages[0]?.content);
}

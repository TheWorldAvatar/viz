/**
 * Optional landing page.
 */

import 'github-markdown-css/github-markdown.css';
import styles from './landing.module.css';

import markdownit from 'markdown-it';
import React from 'react';

import { Assets } from 'io/config/assets';
import OptionalPages, { OptionalPage } from 'io/config/optional-pages';
import { Modules, Routes } from 'io/config/routes';
import { Dictionary } from 'types/dictionary';
import { UISettings } from 'types/settings';
import LandingImage from 'ui/graphic/image/landing';
import { parseStringsForUrls, parseWordsForLabels } from 'utils/client-utils';
import { DefaultPageThumbnail, DefaultPageThumbnailProps, MarkdownPageThumbnail } from './page-thumbnail';

// Utilities to render markdown into HTML
const markdowner = markdownit({
  html: true,
  typographer: true,
  breaks: true,
  linkify: true
});

interface LandingPageProps {
  dict: Dictionary,
  settings: UISettings,
}

/**
 * Represents a standard landing page for the TWA platform. Can optionally
 * contain dynamically created links to other static pages (e.g. acknowledgements,
 * glossaries, licensing etc.).
 * 
 * @returns JSX for landing page.
 */
export default function LandingPage(props: Readonly<LandingPageProps>) {
  // CSS class names
  const introClasses = ["markdown-body", styles.introInner].join(" ");
  // Retrieve links
  const dashboardLinkProps: DefaultPageThumbnailProps = props.settings.links?.find(link => link.url === Modules.DASHBOARD);
  const helpLinkProps: DefaultPageThumbnailProps = props.settings.links?.find(link => link.url === Modules.HELP);
  const mapLinkProps: DefaultPageThumbnailProps = props.settings.links?.find(link => link.url === Modules.MAP);
  const registryLinkProps: DefaultPageThumbnailProps = props.settings.links?.find(link => link.url === Modules.REGISTRY);

  return (
    <div className={styles.container}>
      <div className={styles.introOuter}>
        <div className={styles.introMiddle}>
          <div
            className={introClasses}
            dangerouslySetInnerHTML={{ __html: getIntroductionContent() }}
          />
        </div>
      </div>

      <div className={`${styles.thumbnailContainer} hidden-scrollbar`}>
        {props.settings.branding.landing && (<LandingImage
          lightUrl={props.settings.branding?.landing}
          darkUrl={props.settings.branding?.landingDark}
        />)}
        {getThumbnails()}

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
            caption={dashboardLinkProps?.caption ?? props.dict.nav.caption.dashboard}
            icon={dashboardLinkProps?.icon ?? Assets.DASHBOARD}
            url={Routes.DASHBOARD}
          />
        )}
        {props.settings.modules.registry && props.settings.resources?.registry?.data && (
          <DefaultPageThumbnail
            title={registryLinkProps?.title ?? props.dict.nav.title.registry}
            caption={registryLinkProps?.caption ?? props.dict.nav.caption.registry}
            icon={registryLinkProps?.icon ?? Assets.REGISTRY}
            url={`${Routes.REGISTRY_PENDING}/${props.settings.resources?.registry?.data}`}
          />
        )}
        {props.settings.modules.registry && props.settings.resources?.registry?.paths?.map((path, index) => (
          <DefaultPageThumbnail
            key={path + index}
            title={parseWordsForLabels(path)}
            caption={`${props.dict.nav.caption.generalReg} ${path}`}
            icon={Assets.REGISTRY}
            url={`${Routes.REGISTRY_GENERAL}/${parseStringsForUrls(path)}`}
          />
        ))}

        <DefaultPageThumbnail
          title={helpLinkProps?.title ?? props.dict.nav.title.help}
          caption={helpLinkProps?.caption ?? props.dict.nav.caption.help}
          icon={helpLinkProps?.icon ?? Assets.HELP}
          url={Routes.HELP}
        />

        {props.settings.links?.map((externalLink, index) => {
          if (![Modules.MAP, Modules.DASHBOARD, Modules.HELP, Modules.REGISTRY].includes(externalLink.url)) {
            return <DefaultPageThumbnail
              key={externalLink.title + index}
              title={externalLink.title}
              caption={externalLink.caption}
              icon={externalLink.icon}
              url={externalLink.url}
            />
          }
        })
        }
      </div>
    </div>
  )
}

/**
 * Grabs introduction content from the optional page defining the landing.
 * 
 * @returns Introduction HTML content.
 */
function getIntroductionContent(): string {
  const page: OptionalPage = OptionalPages.getPage("landing");
  return markdowner.render(page.content);
}

/**
 * Loads linkable thumbnail components for registered
 * optional static content pages.
 * 
 * @returns Array of thumbnail components.
 */
function getThumbnails(): React.ReactElement[] {
  // Get all pages
  let pages = OptionalPages.getAllPages();

  // Filter out the object that defines the landing or help page content
  pages = pages.filter(page => page.slug !== "landing" && page.slug !== "help");

  // Create thumbnail components for each page
  const components: React.ReactElement[] = [];
  pages.forEach(page => {
    const thumbnail = (
      <MarkdownPageThumbnail
        key={page.slug}
        page={page}
      />
    );
    components.push(thumbnail);
  });

  return components;
}
import markdownIt from "markdown-it";
import { Metadata } from 'next';

import OptionalPages, { OptionalPage } from 'io/config/optional-pages';
import { Modules, PageTitles } from 'io/config/routes';
import SettingsStore from 'io/config/settings';
import { NavBarItemSettings, UISettings } from 'types/settings';
import StaticContentPage from 'ui/pages/static-content-page';

// Utilities to render markdown into HTML
const markdowner = markdownIt({
  html: true,
  typographer: true,
  breaks: true,
  linkify: true
});

/**
 * Set page metadata.
 * 
 * @returns metadata promise.
 */
export async function generateMetadata(): Promise<Metadata> {
  const uiSettings: UISettings = JSON.parse(SettingsStore.getUISettings());
  const metadata: NavBarItemSettings = uiSettings.links?.find(link => link.url === Modules.HELP);
  return {
    title: metadata?.title ?? PageTitles.HELP,
  }
}

/**
 * Renders the help page.
 */
export default function HelpPage() {
  const page: OptionalPage = OptionalPages.getPage("help");
  const markdownResult = markdowner.render(page.content);

  return (
    <StaticContentPage
      childString={markdownResult}
    />
  )
}
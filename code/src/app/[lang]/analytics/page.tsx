import styles from './analytics.module.css';

import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { Modules, PageTitles, Routes } from 'io/config/routes';
import SettingsStore from 'io/config/settings';
import { NavBarItemSettings, UISettings } from 'types/settings';


/**
 * Set page metadata.
 * 
 * @returns metadata promise.
 */
export async function generateMetadata(): Promise<Metadata> {
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const metadata: NavBarItemSettings = uiSettings.links?.find(link => link.url === Modules.DASHBOARD);
  return {
    title: metadata?.title ?? PageTitles.DASHBOARD,
  }
}

/**
 * A page displaying the dashboard.
 * 
 * @returns React component for display. 
 */
export default function DashContainer() {
  const uiSettings: UISettings = SettingsStore.getUISettings();
  if (uiSettings.resources?.dashboard?.url) {
    return (
      <div className={styles.dashContainer}>
        <iframe className={styles.dashboard} src={uiSettings.resources.dashboard.url} title="Dashboard"></iframe>
      </div>
    )
  } else {
    redirect(Routes.HOME);
  }
}
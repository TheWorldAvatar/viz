import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { Modules, PageTitles, Paths } from 'io/config/routes';
import SettingsStore from 'io/config/settings';
import { ScenarioDefinition, ScenarioDescription } from 'types/scenario';
import { NavBarItemSettings, UISettings } from 'types/settings';
import MapContainer from 'ui/map/map-container';
import { getScenarios } from 'utils/getScenarios';

export const dynamic = 'force-dynamic';

const uiSettings: UISettings = JSON.parse(SettingsStore.getDefaultSettings());
const scenarioUrl = uiSettings.resources?.scenario?.url;
const scenarioDataset = uiSettings.resources?.scenario?.data;
const scenarioResource: UISettings['resources']['scenario'] | undefined = uiSettings.resources?.scenario;
const mapModule: UISettings['modules']['map'] = uiSettings.modules.map;

/**
 * Set page metadata.
 * 
 * @returns metadata promise.
 */
export async function generateMetadata(): Promise<Metadata> {
  const metadata: NavBarItemSettings = uiSettings.links?.find(link => link.url === Modules.MAP);
  return {
    title: metadata?.title ?? PageTitles.MAP,
  }
}

/**
 * A server component that handles the explore  route (i.e. images/defaultsexplore") to display the map container and its components.
 * 
*/
export default async function MapPage() {
  if (mapModule) {
    let scenarios: ScenarioDefinition[] = [];
    if (scenarioResource) {
      try {
        const response: ScenarioDescription[] = await getScenarios(scenarioUrl); // Ensure response is typed as ScenarioDescription[]
        scenarios = response.map((scenario): ScenarioDefinition => ({
          ...scenario,
          url: scenarioUrl,
          dataset: scenarioDataset,
        }));
      } catch (error) {
        console.error(`Error populating scenarios selector`, error);
      }
    }

    SettingsStore.readMapSettings();
    await SettingsStore.readMapDataSettings();

    return (
      <MapContainer
        scenarioURL={scenarioUrl}
        scenarioDataset={scenarioDataset}
        mapSettings={SettingsStore.getMapSettings()}
        data={SettingsStore.getMapDataSettings()}
        scenarios={scenarios}
      />
    )
  } else {
    redirect(Paths.HOME);
  }
}
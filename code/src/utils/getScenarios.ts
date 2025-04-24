import { ScenarioDefinition, ScenarioDescription } from "types/scenario";

export async function getScenarios(scenarioUrl: string): Promise<ScenarioDescription[]> {
  const url: string = scenarioUrl + "/getScenarios";
  let response;
  let data: ScenarioDefinition[];
  try {
    response = await fetch(url, { cache: 'no-store', credentials: 'same-origin' });
    data = await response.json();
    console.info(`Fetching scenarios from URL specified in 'ui-settings': ${scenarioUrl}`);
    console.info(`Responded with scenarios: `, data);
  } catch (error) {
    console.error(`Failed to fetch scenarios from URL specified in 'ui-settings': ${scenarioUrl}\n`, error);
    return [];
  }
  return data;
}
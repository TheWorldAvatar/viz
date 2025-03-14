import { ScenarioDefinition } from "../types/scenario";

export async function getScenarios(): Promise<ScenarioDefinition[]> {
  // Build the absolute URL using the BASE_URL environment variable.
  // Ensure BASE_URL is defined in your environment.
  const proxyUrl = `${process.env.BASE_URL}/api/scenarios`;
  console.info(`Fetching scenarios via proxy at: ${proxyUrl}`);
  let response;
  let data: ScenarioDefinition[];
  try {
    response = await fetch(proxyUrl, { cache: 'no-store' });
    console.log('grumblin', response.text)
    data = await response.json();
    console.info('Responded with scenarios:', data);
  } catch (error) {
    console.error(`Failed to fetch scenarios via proxy at: ${proxyUrl}\n`, error);
    throw error;
  }
  return data;
}

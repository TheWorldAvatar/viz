import { ScenarioDefinition } from "../types/scenario";

export async function fetchScenarios(token?: string): Promise<ScenarioDefinition[]> {
  const targetUrl = `${process.env.SCENARIOS_URL}/getScenarios`;
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers
    });
    if (!response.ok) {
      throw new Error(`Response not OK: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch scenarios from ${targetUrl}:`, error);
    throw error;
  }
}

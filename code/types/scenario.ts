import { ScenarioDimensionsData } from "./timeseries";

export interface ScenarioDescription {
  description: string;
  id: string;
  name: string;
  type: 'Heat Event' | 'Flood Event' | 'Probabilistic Heat Event';
}

/**
 *   url?: string;
 *   dataset?: string;
 *   dimensions?: ScenarioDimensionsData;
 */
export interface ScenarioDefinition extends ScenarioDescription {
  url?: string;
  dataset?: string;
  dimensions?: ScenarioDimensionsData;
}
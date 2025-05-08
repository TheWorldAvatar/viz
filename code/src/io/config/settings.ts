/**
 * Server side code to read and cache all JSON configuration files.
 */

import fs from 'fs';
import path from 'path';

import { JsonObject } from 'types/json';
import { UISettings } from 'types/settings';

/**
 * Handles the retrieval and storage of settings from the user provided configuration files.
 * Note that JSON is stored in its serialised form so that it can be passed from Server to Client component. 
 * Further parsing occurs on the client side.
 */
export default class SettingsStore {

  // Location of all configuration files
  private static readonly UI_SETTINGS_FILE: string = path.join(process.cwd(), "public/config/ui-settings.json");
  private static readonly DATA_SETTINGS_FILE: string = path.join(process.cwd(), "public/config/data-settings.json");
  private static readonly MAP_SETTINGS_FILE: string = path.join(process.cwd(), "public/config/map-settings.json");

  // Cached settings
  private static UI_SETTINGS: string | null = null;
  private static MAP_SETTINGS: string | null = null;
  private static MAP_DATA_SETTINGS: string | null = null;

  /**
   * Retrieves default settings
   */
  public static getUISettings(): string {
    if (!this.UI_SETTINGS) {
      this.readUISettings();
    }
    return this.UI_SETTINGS;
  }

  /**
   * Retrieves default map settings
   */
  public static getMapSettings(): string {
    if (!this.MAP_SETTINGS) {
      this.readMapSettings();
    }
    return this.MAP_SETTINGS;
  }

  /**
   * Retrieves data settings for populating map.
   */
  public static getMapDataSettings(): string {
    if (!this.MAP_DATA_SETTINGS) {
      this.readMapDataSettings();
    }
    return this.MAP_DATA_SETTINGS;
  }

  /**
   * Reads the initialisation settings.
   */
  public static readUISettings(): void {
    const settings: string = this.readFile(this.UI_SETTINGS_FILE);
    const jsonifiedSettings: UISettings = JSON.parse(settings);
    if (jsonifiedSettings.modules.dashboard && jsonifiedSettings.resources?.dashboard?.url.trim() !== "") {
      console.error('modules.dashboard module set to true but resources.dashboard.url is empty');
    }
    this.UI_SETTINGS = JSON.stringify(jsonifiedSettings);
  }

  /**
   * Reads the map settings file and sets the string version to SettingsStore private field.
   */
  public static readMapSettings(): void {
    const settings: string = this.readFile(this.MAP_SETTINGS_FILE);
    this.MAP_SETTINGS = settings;
  }

  /**
 * Reads the data settings for populating the map.
 */
  public static async readMapDataSettings(): Promise<void> {
    try {
      // Retrieve datasets from data settings file
      const dataSettings: string = this.readFile(this.DATA_SETTINGS_FILE);
      const datasets: string[] = JSON.parse(dataSettings).dataSets;

      // Array of promises to fetch data from each dataset
      const dataPromises: Promise<JsonObject>[] = (datasets.map(async dataset => {
        let jsonData: JsonObject;
        // Local datasets will start with /, and must have public appended
        if (dataset.startsWith("/")) {
          jsonData = JSON.parse(this.readFile("public" + dataset));
        } else {
          // For remote datasets, fetch the json
          const res = await fetch(dataset);
          if (res.ok) {
            jsonData = await res.json();
          }
        }
        return jsonData;
      }));

      // Wait for all promises to resolve, filter out null values, and stringify the resulting array
      const data: JsonObject[] = (await Promise.all(dataPromises)).filter(Boolean);
      this.MAP_DATA_SETTINGS = JSON.stringify(data);
    } catch (error) {
      console.error("No local data files detected:", error);
    }
  }

  /**
   * Read the input file
   * 
   * @param file Config file path.
   * @throws When the configuration file is invalid or not found.
   */
  private static readFile(file: string): string {
    const contents: string = fs.readFileSync(file, "utf-8");
    return contents;
  }
}
// End of class.
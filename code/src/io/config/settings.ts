/**
 * Server side code to read and cache all JSON configuration files.
 */

import fs from 'fs';
import path from 'path';

import { JsonObject } from 'types/json';
import { MapSettings, TableColumnOrderSettings, UISettings } from 'types/settings';
import { logColours } from 'utils/logColours';

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
  private static readonly TABLE_ORDER_FILE: string = path.join(process.cwd(), "public/config/table-column-order.json");

  // Cached settings
  private static UI_SETTINGS: UISettings | null = null;
  private static MAP_SETTINGS: MapSettings | null = null;
  private static MAP_DATA_SETTINGS: string | null = null;
  private static TABLE_ORDER_SETTINGS: TableColumnOrderSettings | null = null;


  /**
   * Retrieves UI settings from `SettingsStore` class
   */
  public static getUISettings(): UISettings {
    if (!this.UI_SETTINGS) {
      this.readUISettings();
    }
    return this.UI_SETTINGS;
  }

  /**
   * Retrieves map display settings from `SettingsStore` class
  */
  public static getMapSettings(): MapSettings {
    if (!this.MAP_SETTINGS) {
      this.readMapSettings();
    }
    return this.MAP_SETTINGS;
  }

  /**
   * Retrieves map data settings from `SettingsStore` class
   */
  public static getMapDataSettings(): string {
    if (!this.MAP_DATA_SETTINGS) {
      this.readMapDataSettings();
    }
    return this.MAP_DATA_SETTINGS;
  }

  /**
   * Retrieves table column order settings from `SettingsStore` class
   */
  public static getTableColumnOrderSettings(): TableColumnOrderSettings {
    if (!this.TABLE_ORDER_SETTINGS) {
      this.readTableColumnOrderSettings();
    }
    return this.TABLE_ORDER_SETTINGS;
  }

  /**
   * Reads the initialisation settings.
   */
  public static readUISettings(): void {
    const settings: string = this.readFile(this.UI_SETTINGS_FILE);
    const jsonifiedSettings: UISettings = JSON.parse(settings);
    if (jsonifiedSettings.modules.dashboard && !jsonifiedSettings.resources?.dashboard?.url) {
      console.warn(`${logColours.Yellow}modules.dashboard${logColours.Reset} module set to true but ${logColours.Yellow}resources.dashboard.url${logColours.Reset} is empty`);
    }
    this.UI_SETTINGS = jsonifiedSettings;
  }

  /**
   * Reads the map settings file and sets the string version to SettingsStore private field
  */
  public static readMapSettings(): void {
    const settings: string = this.readFile(this.MAP_SETTINGS_FILE);
    this.MAP_SETTINGS = JSON.parse(settings);
  }

  /**
   * Reads the table order settings file and sets it to SettingsStore private field.
   */
  public static readTableColumnOrderSettings(): void {
    try {
      const settings: string = this.readFile(this.TABLE_ORDER_FILE);
      const jsonifiedSettings: TableColumnOrderSettings = JSON.parse(settings);
      this.TABLE_ORDER_SETTINGS = jsonifiedSettings;
    } catch (error) {
      // Check for File Not Found/Missing
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.warn("Table column order settings file not detected. Using default column order.");
        // Check for Invalid JSON (Parsing Error)
      } else if (error instanceof SyntaxError) {
        console.error("ERROR: Settings file found but contains invalid JSON. Using default column order.", error);
        // Other unexpected file I/O errors (e.g., permission denied)
      } else {
        console.error("An unexpected error occurred while reading settings file. Using default column order:", error);
      }
    }
  }

  public static async getRegistryURL(): Promise<string> {
    if (!this.UI_SETTINGS) {
      this.readUISettings();
    }
    return this.UI_SETTINGS.resources?.registry?.url ?? "";
  }


  /**
   * Reads the data settings for populating the map
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
    return decodeURIComponent(contents);
  }
}
// End of class.

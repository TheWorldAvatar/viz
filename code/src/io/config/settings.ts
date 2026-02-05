/**
 * Server side code to read and cache all JSON configuration files.
 */

import fs from 'fs';
import path from 'path';

import { JsonObject } from 'types/json';
import { DataSettings, MapSettings, TableColumnOrderSettings, UISettings } from 'types/settings';
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
  private static TABLE_ORDER_SETTINGS: TableColumnOrderSettings = {};


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
    if (Object.keys(this.TABLE_ORDER_SETTINGS).length === 0) {
      this.readTableColumnOrderSettings();
    }
    return this.TABLE_ORDER_SETTINGS;
  }

  /**
   * Reads the initialisation settings.
   */
  public static readUISettings(): void {
    const jsonifiedSettings: UISettings = this.readFile<UISettings>(this.UI_SETTINGS_FILE);
    if (jsonifiedSettings.modules.dashboard && !jsonifiedSettings.resources?.dashboard?.url) {
      console.warn(`${logColours.Yellow}modules.dashboard${logColours.Reset} module set to true but ${logColours.Yellow}resources.dashboard.url${logColours.Reset} is empty`);
    }
    this.UI_SETTINGS = jsonifiedSettings;
  }

  /**
   * Reads the map settings file and sets the string version to SettingsStore private field
  */
  public static readMapSettings(): void {
    this.MAP_SETTINGS = this.readFile<MapSettings>(this.MAP_SETTINGS_FILE);
  }

  /**
   * Reads the table order settings file and sets it to SettingsStore private field.
   */
  public static readTableColumnOrderSettings(): void {
    try {
      this.TABLE_ORDER_SETTINGS = this.readFile<TableColumnOrderSettings>(this.TABLE_ORDER_FILE);
    } catch (_error) {
      console.warn("Using default column order without explicit overrides...");
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
      const datasets: string[] = this.readFile<DataSettings>(this.DATA_SETTINGS_FILE).dataSets;

      // Array of promises to fetch data from each dataset
      const dataPromises: Promise<JsonObject>[] = (datasets.map(async dataset => {
        return await SettingsStore.loadLocalOrRemoteData(dataset);
      }));

      // Wait for all promises to resolve, filter out null values, and stringify the resulting array
      const data: JsonObject[] = (await Promise.all(dataPromises)).filter(Boolean);
      this.MAP_DATA_SETTINGS = JSON.stringify(data);
    } catch (error) {
      console.error("Error reading map data settings:", error);
    }
  }

  private static async loadLocalOrRemoteData(dataset: string) {
    let jsonData: JsonObject;
    // Local datasets will start with /, and must have public appended
    if (dataset.startsWith("/")) {
      jsonData = this.readFile<JsonObject>("public" + dataset);
    } else {
      // For remote datasets, fetch the json
      const res = await fetch(dataset);
      if (res.ok) {
        jsonData = await res.json();
      }
    }
    return jsonData;
  }

  /**
   * Read the input file
   * 
   * @param file Config file path.
   * @throws When the configuration file is invalid or not found.
  */
  private static readFile<T>(file: string): T | null {
    try {
      const contents: string = fs.readFileSync(file, "utf-8");
      return JSON.parse(decodeURIComponent(contents)) as T;
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error(`${logColours.Red}[ERROR]${logColours.Reset} Invalid JSON format for \`${file}\``);
        console.error(`${logColours.Red}REASON:${logColours.Reset} `, (error as Error).message);
      } else if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        console.error(`${logColours.Red}[ERROR]${logColours.Reset} File not found for \`${file}\``);
      } else {
        console.error(`${logColours.Red}[ERROR]${logColours.Reset} Failed to read file for \`${file}\``);
        console.error(`${logColours.Red}REASON:${logColours.Reset} `, (error as Error).message);
      }
      throw error;
    }
  }
}
// End of class.

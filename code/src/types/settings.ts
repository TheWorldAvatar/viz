import { NavBarItemType } from "ui/navigation/navbar/navbar-item";
import { HasPermissions } from "./auth";

/**
 * Interface of default settings for landing page.
 */
export type UISettings = {
  branding: {
    'navbarLogo': string | string[]; // Backwards compatibility but do not use this going forward
    'navbar': string | string[];
  },
  modules: {
    'landing': boolean;
    'map': boolean;
    'dashboard': boolean;
    'help': boolean;
    'registry': boolean;
  },
  links?: NavBarItemSettings[],
  resources?: {
    [key: 'scenario' | 'registry' | 'dashboard' | string]: {
      url: string;
      data?: string;
      paths?: string[];
    };
  }
}

export interface NavBarItemSettings {
  url: string;
  title: string;
  icon: string;
  type: NavBarItemType;
  caption?: string;
  permission?: keyof HasPermissions;
}

// Interface of map settings for visualisation page
export type MapSettings = {
  type: string,
  camera: CameraSettings,
  imagery: ImageryOptions,
  legend?: LegendSettings,
  icons?: IconSettings,
  hideLabels?: boolean,
}

// Icon settings object
export type IconSettings = {
  [key: string]: string
}

// Imagery options object
export type ImageryOptions = {
  default: string,
  options: ImageryOption[]
}

// Imagery option object
export type ImageryOption = {
  name: string,
  url: string,
  time?: string
}

// Camera settings object
export type CameraSettings = {
  default: string,
  positions: CameraPosition[]
}

// Camera position object
export type CameraPosition = {
  name: string,
  center: [number, number],
  zoom: number,
  bearing: number,
  pitch: number
}

// Legend settings object
export type LegendSettings = {
  [groupName: string]: LegendGroup;
}

export type LegendGroup = FillLegend[] | SymbolLegend[];

type SymbolLegend = {
  heading: string;
  content: string;
  type: "symbol";
  icon: string;
}

type FillLegend = {
  heading: string;
  content: string;
  type: "fill";
  fill: string;
}

export type MapboxCredentials = { username: string, token: string }
import { localStorageManager } from "@/state/browser-storage-manager";
import { ConditionalFormatSetting } from "@/types/table";
import { useState } from "react";

export interface ConditionalFormatPresetDescriptor {
  conditionalFormatPresets: ConditionalFormatSetting[];
  currentConditionalFormatPreset: ConditionalFormatSetting;
  updateCurrentConditionalFormatPreset: (_selected: ConditionalFormatSetting) => void;
}

/**
 * A custom hook to retrieve the active conditional formatting preset and manage all presets.
 * The active profile is stored in local storage per table, and kept in sync across tabs.
 *
 * @param {string} resource The resource for conditional format.
 * @param {ConditionalFormatSetting[]} conditionalFormatPresets Presets with conditions for the cell format.
 */
export function useConditionalFormatPresets(
  resource: string,
  conditionalFormatPresets: ConditionalFormatSetting[],
): ConditionalFormatPresetDescriptor {
  const [currentConditionalFormatPreset, setCurrentConditionalFormatPreset] = useState<ConditionalFormatSetting>(
    loadConditionalFormatPreset(resource, conditionalFormatPresets));


  const updateCurrentConditionalFormatPreset = (selected: ConditionalFormatSetting) => {
    const resourceKey: string = getResourceStorageKey(resource);
    setCurrentConditionalFormatPreset(selected);
    if (selected) {
      localStorageManager.set(resourceKey, selected.conditional_format);
    } else {
      localStorageManager.remove(resourceKey);
    }
  }
  return { conditionalFormatPresets, currentConditionalFormatPreset, updateCurrentConditionalFormatPreset };
}

function getResourceStorageKey(resource: string,): string {
  return `conditional_format_preset_active_${resource}`;
}

/**
 * Loads user specific preset if previously saved in local storage.
 *
 * @param {string} resource The resource for conditional format.
 * @param {ConditionalFormatSetting[]} conditionalFormatPresets Presets with conditions for the cell format based.
 */
function loadConditionalFormatPreset(
  resource: string,
  conditionalFormatPresets: ConditionalFormatSetting[],
): ConditionalFormatSetting {
  const storedPresetId: string | null = (localStorageManager.get(getResourceStorageKey(resource)) as string) ?? null;
  if (storedPresetId == null) return undefined;
  return conditionalFormatPresets.find(preset => preset.conditional_format == storedPresetId);
}
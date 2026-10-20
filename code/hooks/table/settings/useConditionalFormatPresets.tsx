import { localStorageManager } from "@/state/browser-storage-manager";
import { AgentResponseBody, InternalApiIdentifierMap } from "@/types/backend-agent";
import { ConditionalFormatSetting } from "@/types/table";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "@/utils/internal-api-services";
import { useEffect, useState } from "react";

export interface ConditionalFormatPresetDescriptor {
  conditionalFormatPresets: ConditionalFormatSetting[];
  currentConditionalFormatPreset: ConditionalFormatSetting;
  updateCurrentConditionalFormatPreset: (_selected: ConditionalFormatSetting) => void;
}

/**
 * A custom hook to retrieve the active conditional formatting preset and manage all presets.
 * The active profile is stored in local storage per table.
 *
 * @param {string} resource The resource for conditional format.
 */
export function useConditionalFormatPresets(
  resource: string,
): ConditionalFormatPresetDescriptor {
  const [conditionalFormatPresets, setConditionalFormatPresets] = useState<ConditionalFormatSetting[]>(undefined);
  const [currentConditionalFormatPreset, setCurrentConditionalFormatPreset] = useState<ConditionalFormatSetting>(undefined);


  const updateCurrentConditionalFormatPreset = (selected: ConditionalFormatSetting) => {
    const resourceKey: string = getResourceStorageKey(resource);
    setCurrentConditionalFormatPreset(selected);
    if (selected) {
      localStorageManager.set(resourceKey, selected.conditional_format);
    } else {
      localStorageManager.remove(resourceKey);
    }
  }

  useEffect(() => {
    const fetchConditionalFormatPresets = async (): Promise<void> => {
      let presets: ConditionalFormatSetting[];
      try {
        const response: AgentResponseBody = await queryInternalApi(
          makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.CONDITIONAL_FORMATTING, resource),
          "GET",
          undefined,
        );
        if (response.error) {
          console.error(`Failed to fetch conditional format presets:`, response.error.message);
          return;
        }
        presets = response.data.items as ConditionalFormatSetting[];
      } catch (e) {
        console.error(`Failed to fetch conditional format presets:`, e);
        return;
      }

      setConditionalFormatPresets(presets);
      setCurrentConditionalFormatPreset(loadConditionalFormatPreset(resource, presets));
    };
    fetchConditionalFormatPresets();
  }, [resource]);
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
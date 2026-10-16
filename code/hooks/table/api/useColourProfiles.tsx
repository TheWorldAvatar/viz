import { localStorageManager } from "@/state/browser-storage-manager";
import { AgentResponseBody, InternalApiIdentifierMap } from "@/types/backend-agent";
import { ColourProfile, ColourRuleMap } from "@/types/colour-profile";
import { buildColourRuleMap, getActiveColourProfileStorageKey, getTableKey } from "@/utils/colour-profile";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "@/utils/internal-api-services";
import { useCallback, useEffect, useMemo, useState } from "react";

export interface ColourProfilesDescriptor {
  profiles: ColourProfile[];
  activeProfileId: string | null;
  colourRuleMap: ColourRuleMap;
  setActiveProfileId: (id: string | null) => void;
}

/**
 * A custom hook to retrieve the colour profiles of a table and manage the active profile of this browser.
 * The active profile is stored in local storage per table, and kept in sync across tabs.
 *
 * @param {string} entityType Type of entity for rendering.
 * @param {string} lifecycleStage The current stage of a contract lifecycle to display.
 */
export function useColourProfiles(entityType: string, lifecycleStage: string): ColourProfilesDescriptor {
  const tableKey: string = getTableKey(entityType, lifecycleStage);
  const storageKey: string = getActiveColourProfileStorageKey(tableKey);
  const [profiles, setProfiles] = useState<ColourProfile[]>([]);
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(null);

  useEffect(() => {
    // Cancels the request when the table changes or unmounts, so that a late response cannot overwrite the current table's profiles
    const controller: AbortController = new AbortController();
    const fetchProfiles = async (): Promise<void> => {
      setProfiles([]);
      setActiveProfileIdState(null);
      try {
        const res: AgentResponseBody = await queryInternalApi(
          makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.COLOUR_PROFILES, tableKey),
          "GET",
          undefined,
          controller.signal,
        );
        if (res.error) {
          console.error(`Failed to retrieve colour profiles for table "${tableKey}":`, res.error.message);
          return;
        }
        const fetchedProfiles: ColourProfile[] = ((res.data?.items ?? []) as ColourProfile[]);
        const storedId: string | null = (localStorageManager.get(storageKey) as string) ?? null;
        const isStoredIdValid: boolean = !!storedId && fetchedProfiles.some((profile) => profile.id === storedId);
        // The stored profile may have been deleted by another user
        if (storedId && !isStoredIdValid) {
          localStorageManager.remove(storageKey);
        }
        setProfiles(fetchedProfiles);
        // Set the active profile to the stored selection if it still exists, or null otherwise
        setActiveProfileIdState(isStoredIdValid ? storedId : null);
      } catch (error) {
        // An aborted request is expected, and the stored selection is kept when the backend is unreachable
        if (!controller.signal.aborted) {
          console.error(`Failed to retrieve colour profiles for table "${tableKey}":`, error);
        }
      }
    };
    fetchProfiles();
    return () => controller.abort();
  }, [tableKey, storageKey]);

  // Sync the selection made in other browser tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent): void => {
      if (event.key === storageKey || event.key === null) {
        setActiveProfileIdState((localStorageManager.get(storageKey) as string) ?? null);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [storageKey]);

  const setActiveProfileId = useCallback((id: string | null): void => {
    if (id) {
      localStorageManager.set(storageKey, id);
    } else {
      localStorageManager.remove(storageKey);
    }
    setActiveProfileIdState(id);
  }, [storageKey]);

  const colourRuleMap: ColourRuleMap = useMemo(
    () => buildColourRuleMap(profiles.find((profile) => profile.id === activeProfileId)),
    [profiles, activeProfileId]
  );

  return { profiles, activeProfileId, colourRuleMap, setActiveProfileId };
}

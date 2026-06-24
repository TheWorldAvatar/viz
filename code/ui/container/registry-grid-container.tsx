"use client";

import { useDrawerNavigation } from "@/hooks/drawer/useDrawerNavigation";
import { useRegistryGrid } from "@/hooks/grid/useRegistryGrid";
import { useDictionary } from "@/hooks/useDictionary";
import { Routes } from "@/io/config/routes";
import { browserStorageManager } from "@/state/browser-storage-manager";
import { Dictionary } from "@/types/dictionary";
import { RegistryStatusMap } from "@/types/form";
import { TableColumnOption } from "@/types/settings";
import {
  getId,
  parseWordsForLabels
} from "@/utils/client-utils";
import { useEffect } from "react";
import Button from "../interaction/button";
import Card from "../interaction/card/card";

interface RegistryGridComponentProps {
  entityType: string;
  tableColumnOptions: TableColumnOption[];
}

/**
 * This component renders a registry grid for the specified entity on a mobile site.
 *
 * @param {string} entityType Type of entity for rendering.
 * @param {TableColumnOption[]} tableColumnOptions Configuration for table column options.
 */
export default function RegistryGridComponent(
  props: Readonly<RegistryGridComponentProps>
) {
  const dict: Dictionary = useDictionary();
  const { isLoading, data, resetFormSession } = useRegistryGrid(props.entityType, props.tableColumnOptions);
  const { navigateToDrawer } = useDrawerNavigation();

  useEffect(() => {
    // Trigger refresh when back navigation occurs
    const handleHistoryChange = () => {
    };
    window.addEventListener("popstate", handleHistoryChange);
    return () => {
      window.removeEventListener("popstate", handleHistoryChange);
    };
  }, []);

  return (
    <div className="bg-muted py-4 px-2 md:py-2.5 md:px-8 flex flex-col md:h-full md:min-h-0">
      <h1 className="py-1 md:py-4 text-2xl md:text-4xl font-bold">
        {parseWordsForLabels(props.entityType)}
      </h1>
      <div className="py-4 px-2 md:py-2.5 md:px-8 flex flex-col gap-5 md:h-full md:min-h-0">
        {!isLoading && data.map((instance, index) =>
          <Card
            key={index}
            data={instance}
            action={<Button
              variant="ghost"
              size="md"
              iconSize="medium"
              className="w-full justify-start"
              leftIcon="done_outline"
              label={dict.action.complete}
              onClick={() => {
                browserStorageManager.clear();
                resetFormSession();
                browserStorageManager.set(RegistryStatusMap.BILLABLE_COMPLETED, "false");
                navigateToDrawer(Routes.REGISTRY_TASK_COMPLETE, getId(instance?.event_id));
              }}
            />}
          />)}
      </div>
    </div>
  );
}

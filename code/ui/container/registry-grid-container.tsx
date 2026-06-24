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
  parseWordsForLabels
} from "@/utils/client-utils";
import { useEffect } from "react";
import Button from "../interaction/button";
import Card from "../interaction/card/card";
import StatusComponent from "../text/status/status";

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
  const { isLoading, data, resetFormSession, triggerRefresh } = useRegistryGrid(props.entityType, props.tableColumnOptions);
  const { navigateToDrawer } = useDrawerNavigation();

  useEffect(() => {
    // Trigger refresh when back navigation occurs
    const handleHistoryChange = () => {
      triggerRefresh();
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
        {!isLoading && data.map((instance, index) => {
          const { id, date, event_id, status, ...displayFields } = instance;
          return <Card
            key={index}
            data={displayFields}
            header={<>
              <h3 className="text-lg">
                {`# ${id}`}
              </h3>
              <div className="flex justify-start">
                <StatusComponent status={status} />
              </div>
              <p className="text-base pb-4">
                {date}
              </p>
            </>}
            actions={[<Button
              key={index + dict.action.complete}
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
                navigateToDrawer(Routes.REGISTRY_TASK_COMPLETE, event_id);
              }}
            />,
            <Button
              key={index + dict.action.view}
              variant="ghost"
              size="md"
              iconSize="medium"
              className="w-full justify-start"
              leftIcon="open_in_new"
              label={parseWordsForLabels(dict.action.view)}
              onClick={() => {
                browserStorageManager.clear();
                resetFormSession();
                navigateToDrawer(Routes.REGISTRY_TASK_VIEW, event_id);
              }}
            />]}
          />
        })}
      </div>
    </div>
  );
}

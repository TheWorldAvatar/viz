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
import { Icon } from "@mui/material";

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
  const { parentRef, data, virtualItems, rowVirtualizer, resetFormSession, triggerRefresh } = useRegistryGrid(props.entityType, props.tableColumnOptions);
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

  // Ensure height of container is full for virtualiser to function
  return (
    <div className="bg-muted py-4 px-2 md:py-2.5 md:px-8 flex flex-col h-full min-h-0">
      <h1 className="py-1 md:py-4 text-2xl md:text-4xl font-bold">
        {parseWordsForLabels(props.entityType)}
      </h1>
      {/** The virtualiser requires flex-1 height and overflow y in parent ref; it also requires an inner canvas container */}
      <section ref={parentRef} className="py-4 px-2 md:py-2.5 md:px-8 flex-1 overflow-y-auto min-h-0 w-full">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {data.length > 0 && virtualItems.map((virtualItem) => {
            const isLoaderRow: boolean = virtualItem.index >= data.length;
            if (isLoaderRow) {
              return;
            }
            const { id, date, event_id, status, ...displayFields } = data[virtualItem.index];
            return <Card
              key={virtualItem.key}
              ref={rowVirtualizer.measureElement}
              data={displayFields}
              virtualItem={virtualItem}
              header={<div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="min-w-0 wrap-break-word text-sm font-semibold tracking-tight">
                    {`# ${id}`}
                  </h3>
                  <div className="shrink-0">
                    <StatusComponent status={status} size="sm" />
                  </div>
                </div>
                <p className="flex items-center gap-1 text-card-foreground">
                  <Icon fontSize="small" className="material-symbols-outlined">
                    {"calendar_month"}
                  </Icon>
                  {date}
                </p>
              </div>}
              actions={[<Button
                key={virtualItem.key + dict.action.complete}
                variant="ghost"
                size="md"
                iconSize="medium"
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
                key={virtualItem.key + dict.action.view}
                variant="ghost"
                size="md"
                iconSize="medium"
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
      </section>
    </div>
  );
}

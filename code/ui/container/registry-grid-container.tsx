"use client";

import { useRegistryGrid } from "@/hooks/grid/useRegistryGrid";
import { TableColumnOption } from "@/types/settings";
import {
  parseWordsForLabels
} from "@/utils/client-utils";
import { useEffect } from "react";
import LoadingSpinner from "../graphic/loader/spinner";
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
  const { isLoading, data } = useRegistryGrid(props.entityType, props.tableColumnOptions);

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
        {isLoading ? <LoadingSpinner isSmall={false} />
          : data.map((instance, index) =>
            <Card
              key={index}
              data={instance}
            />)}
      </div>
    </div>
  );
}

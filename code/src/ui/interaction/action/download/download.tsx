"use client";

import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import { RegistryFieldValues, SparqlResponseField } from "types/form";

import Button, { ButtonProps } from "ui/interaction/button";
import { handleDownload } from "utils/client-utils";

interface DownloadButtonProps extends ButtonProps {
  instances: RegistryFieldValues[];
}

/**
 * This component renders a download button for downloading CSV content .
 *
 * @param {RegistryFieldValues[]} instances The target instances to export into csv.
 */
export function DownloadButton({
  instances,
  ...rest
}: Readonly<DownloadButtonProps>) {
  const dict: Dictionary = useDictionary();
  const exportToCSV = () => {
    if (instances.length === 0) {
      console.error("No data to export.");
      return;
    }
    // Extract unique column headers from all objects
    const headers = Array.from(new Set(instances.flatMap(Object.keys)));
    // Build CSV content
    const csvRows: string[] = [];
    csvRows.push(headers.join(",")); // Add headers

    for (const row of instances) {
      const values: string[] = headers.map(
        (header) => !Array.isArray(row[header]) ? (row[header] as SparqlResponseField)?.value : ""
      );
      csvRows.push(values.join(","));
    }
    // Transform contents into a url for download
    const blob: Blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    handleDownload(blob, "export.csv");
  };

  return (
    <Button
      leftIcon="download"
      size="icon"
      variant="outline"
      tooltipText={dict.action.export}
      className={`${rest.className}`}
      onClick={exportToCSV}
    />
  );
}

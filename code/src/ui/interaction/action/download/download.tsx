"use client";

import React from 'react';

import ActionButton from '../action';
import { RegistryFieldValues } from 'types/form';

interface DownloadButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  instances: RegistryFieldValues[];
}

/**
 * This component renders a download button for downloading CSV content .
 * 
 * @param {RegistryFieldValues[]} instances The target instances to export into csv.
 */
export function DownloadButton({ instances, ...rest }: Readonly<DownloadButtonProps>) {
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
      const values = headers.map(header => row[header]?.value ?? "");
      csvRows.push(values.join(","));
    }
    // Transform contents into a url for download
    const blob: Blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url: string = URL.createObjectURL(blob);

    // Create a temporary anchor element to activate download
    const a: HTMLAnchorElement = document.createElement("a");
    a.href = url;
    a.download = "export.csv";
    document.body.appendChild(a);
    // Trigger the download manually
    a.click();
    a.remove();
    // Cleanup: Revoke the Object URL after the download
    window.URL.revokeObjectURL(url);
  };

  return (
    <ActionButton
      icon="download"
      className={`${rest.className}`}
      label="export data"
      onClick={exportToCSV}
    />
  );
}
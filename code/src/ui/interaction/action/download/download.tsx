"use client";

import React from "react";
import ActionButton from "../action";
import { RegistryFieldValues } from "types/form";
import { DownloadOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";

interface DownloadButtonProps {
  instances: RegistryFieldValues[];
  size?: "large" | "middle" | "small";
  className?: string;
}

/**
 * Enhanced download button component using Ant Design.
 * Features a round shape, download icon, and hover tooltip.
 *
 * @param {RegistryFieldValues[]} instances The target instances to export into csv
 * @param {('large'|'middle'|'small')} size Button size (defaults to middle)
 * @param {string} className Optional additional CSS classes
 */
export function DownloadButton({
  instances,
  size = "middle",
  className,
}: Readonly<DownloadButtonProps>) {
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
      const values = headers.map((header) => {
        // Handle potential undefined values and escape commas in content
        const value = row[header]?.value ?? "";
        return typeof value === "string" && value.includes(",")
          ? `"${value}"`
          : value;
      });
      csvRows.push(values.join(","));
    }

    // Transform contents into a url for download
    const blob: Blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url: string = URL.createObjectURL(blob);

    // Create a temporary anchor element to activate download
    const a: HTMLAnchorElement = document.createElement("a");
    a.href = url;
    a.download = "export.csv";
    document.body.appendChild(a);

    // Trigger the download manually
    a.click();

    // Cleanup
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Tooltip title="Export to CSV">
      <Button
        type="primary"
        shape="round"
        icon={<DownloadOutlined />}
        size={size}
        onClick={exportToCSV}
        className={className}
      >
        Export
      </Button>
    </Tooltip>
  );
}

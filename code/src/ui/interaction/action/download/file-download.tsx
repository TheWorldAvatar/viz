"use client";

import { useState } from "react";

import Button, { ButtonProps } from "ui/interaction/button";
import { queryFileExportAPI } from "utils/internal-api-services";

interface FileDownloadButtonProps extends ButtonProps {
  id: string;
  resource: string;
  format: "csv" | "pdf";
}

/**
 * This component renders a button to download a specific file.
 *
 * @param {string} id The target ID of the resource.
 * @param {string} resource The resource type.
 * @param {"csv" | "pdf"} format The file format (csv or pdf).
 */
export function FileDownloadButton({
  id,
  resource,
  format,
  ...rest
}: Readonly<FileDownloadButtonProps>) {
  const [loading, setLoading] = useState<boolean>(false);

  const downloadFile = async () => {
    setLoading(true);
    try {
      await queryFileExportAPI(id, resource, format);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="icon"
      loading={loading}
      onClick={downloadFile}
      {...rest}
    />
  );
}

"use client";

import { useState } from "react";
import { FileResponse } from "@/types/backend-agent";

import Button, { ButtonProps } from "@/ui/interaction/button";
import { handleDownload } from "@/utils/client-utils";
import { queryFileExportAPI } from "@/utils/internal-api-services";

interface FileDownloadButtonProps extends ButtonProps {
  id: string;
  resource: string;
  format: "csv" | "pdf";
  onComplete?: () => void;
}

/**
 * This component renders a button to download a specific file.
 *
 * @param {string} id The target ID of the resource.
 * @param {string} resource The resource type.
 * @param {"csv" | "pdf"} format The file format (csv or pdf).
 * @param onComplete An optional function to run after the file download is complete.
 */
export function FileDownloadButton({
  id,
  resource,
  format,
  onComplete,
  ...rest
}: Readonly<FileDownloadButtonProps>) {
  const [loading, setLoading] = useState<boolean>(false);

  const downloadFile = async () => {
    setLoading(true);
    try {
      const fileResponse: FileResponse = await queryFileExportAPI(id, resource, format);
      if (fileResponse) {
        handleDownload(fileResponse.blob, fileResponse.file);
      }
    } finally {
      setLoading(false);
      onComplete?.();
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

"use client";

import { useState } from "react";
import { FileResponse } from "@/types/backend-agent";
import { RegistryExportSettings } from "@/types/settings";
import Button, { ButtonProps } from "@/ui/interaction/button";
import { handleDownload } from "@/utils/client-utils";
import { queryFileExportAPI } from "@/utils/internal-api-services";

interface FileDownloadButtonsProps extends ButtonProps {
  targetId: string | string[];
  exportOptions: RegistryExportSettings[];
  onComplete?: () => void;
}

/**
 * This component renders a download button for every export option provided.
 *
 * @param {string | string[]} targetId The record id(s) to export.
 * @param {RegistryExportSettings[]} exportOptions All export options declared in the UI settings.
 * @param onComplete An optional function to run after the file download is complete.
 */
export default function FileDownloadButtons({
  targetId, exportOptions, disabled, onComplete, ...rest
}: Readonly<FileDownloadButtonsProps>) {
  // The key of the export option that is currently downloading, if any
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  const downloadFile = async (exportOption: RegistryExportSettings, exportKey: string): Promise<void> => {
    setDownloadingKey(exportKey);
    try {
      const ids: string[] = Array.isArray(targetId) ? targetId : [targetId];
      const fileResponse: FileResponse = await queryFileExportAPI(exportOption.isBulk ? ids.join(",") : ids[0], exportOption.resource, exportOption.format);
      if (fileResponse) {
        handleDownload(fileResponse.blob, fileResponse.file);
      }
    } finally {
      setDownloadingKey(null);
      onComplete?.();
    }
  };

  return (
    <>
      {exportOptions.map((exportOption, index) => {
        const exportKey: string = `${exportOption.resource}-${exportOption.format}-${index}`;
        return (
          // Only the button that was clicked displays the spinner, while the remaining buttons are
          // disabled until the download completes.
          <Button
            key={exportKey}
            leftIcon="download"
            label={exportOption.caption}
            loading={downloadingKey === exportKey}
            disabled={disabled || !!downloadingKey}
            onClick={() => downloadFile(exportOption, exportKey)}
            {...rest}
          />
        );
      })}
    </>
  );
}

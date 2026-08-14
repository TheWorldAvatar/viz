"use client";

import useTableSession from "@/hooks/table/useTableSession";
import { useExportOptions } from "@/hooks/useExportOptions";
import { useState } from "react";
import { FileResponse } from "@/types/backend-agent";
import { RegistryExportSettings } from "@/types/settings";
import Button, { ButtonProps } from "@/ui/interaction/button";
import { handleDownload } from "@/utils/client-utils";
import { queryFileExportAPI } from "@/utils/internal-api-services";

interface FileDownloadButtonsProps extends ButtonProps {
  targetId: string | string[];
  onComplete?: () => void;
}

/**
 * This component renders a download button for every export option available in the current table.
 *
 * @param {string | string[]} targetId The record id(s) to export.
 * @param onComplete An optional function to run after the file download is complete.
 */
export default function FileDownloadButton({
  targetId, disabled, onComplete, ...rest
}: Readonly<FileDownloadButtonsProps>) {
  const { lifecycleStage, recordType, exports } = useTableSession();
  const isBulkSelection: boolean = Array.isArray(targetId);
  const exportOptions: RegistryExportSettings[] = useExportOptions(exports, lifecycleStage, recordType, isBulkSelection);
  // The key of the export option that is currently downloading, if any
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  const downloadFile = async (exportOption: RegistryExportSettings, exportKey: string): Promise<void> => {
    setDownloadingKey(exportKey);
    try {
      const fileResponse: FileResponse = await queryFileExportAPI(targetId, exportOption.resource, exportOption.format);
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

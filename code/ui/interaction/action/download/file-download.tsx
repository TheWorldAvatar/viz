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
  isBulkSelection: boolean;
  disabled?: boolean;
  onComplete?: () => void;
}

/**
 * This component renders a download button for every export option available in the current table.
 *
 * @param {string | string[]} targetId The record id(s) to export.
 * @param {boolean} isBulkSelection Indicates if multiple records are being exported at once.
 * @param {boolean} disabled Optional disabled state for the buttons.
 * @param onComplete An optional function to run after the file download is complete.
 */
export default function FileDownloadButton({
  targetId, isBulkSelection, disabled, onComplete, ...rest
}: Readonly<FileDownloadButtonsProps>) {
  const { lifecycleStage, recordType, exports } = useTableSession();
  const exportOptions: RegistryExportSettings[] = useExportOptions(exports, lifecycleStage, recordType, isBulkSelection);
  // Only the export option currently downloading should display a loading state
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

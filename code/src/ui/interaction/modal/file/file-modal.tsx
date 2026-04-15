"use client";

import React, { useRef, useState } from "react";
import { FieldValues, useForm, UseFormReturn } from "react-hook-form";

import { Icon } from "@mui/material";
import { useDictionary } from "hooks/useDictionary";
import { DateRange } from "react-day-picker";
import { AgentResponseBody, FileResponse } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import LoadingSpinner from "ui/graphic/loader/spinner";
import FileInputButton from "ui/interaction/action/file/file-input";
import { toast } from "ui/interaction/action/toast/toast";
import Button from "ui/interaction/button";
import DateInput from "ui/interaction/input/date-input";
import Modal from "ui/interaction/modal/modal";
import { NavBarItemType } from "ui/navigation/navbar/navbar-item";
import { extractDateDisplay, getInitialDate, handleDownload } from "utils/client-utils";
import { queryDefaultFileExportAPI, postFileUploadAPI } from "utils/internal-api-services";

interface FileModalProps {
  url: string;
  type: NavBarItemType;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * A modal component to upload files to the specified URL.
 *
 * @param {string} url The target url.
 * @param {NavBarItemType} type The modal actions to execute and show.
 * @param {boolean} isOpen Indicator if the this modal should be opened.
 * @param setIsOpen Method to close or open the modal.
 */
export default function FileModal(props: Readonly<FileModalProps>) {
  const form: UseFormReturn = useForm();
  const dict: Dictionary = useDictionary();
  const formRef: React.RefObject<HTMLFormElement> =
    useRef<HTMLFormElement>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<DateRange>(getInitialDate());

  const onFormSubmit = form.handleSubmit(async (formData: FieldValues) => {
    if (props.type === "date") {
      try {
        setIsUploading(true);
        const fileResponse: FileResponse = await queryDefaultFileExportAPI(props.url, selectedDate);
        if (fileResponse) {
          handleDownload(fileResponse.blob, fileResponse.file);
        }
      } finally {
        setIsUploading(false);
        // Closes the modal after download is triggered
        props.setIsOpen(false);
      }
    } else if (props.type === "file") {
      if (formData.files.length > 0) {
        const fileData: FormData = new FormData();
        fileData.append("file", formData.files[0]);
        try {
          setIsUploading(true);
          const respBody: AgentResponseBody = await postFileUploadAPI(props.url, fileData);
          toast(
            respBody?.data?.message || respBody?.error?.message,
            respBody?.error ? "error" : "success"
          );
          // Closes the modal after request is completed
          setTimeout(() => {
            props.setIsOpen(false);
          }, 2000);
        } catch (error) {
          console.error("There was an error uploading the file:", error);
          toast(dict.message.fileUploadError, "error");
        } finally {
          setIsUploading(false);
        }
      } else {
        toast(dict.message.noFileChosenError, "error");
      }
    }
  });

  const onSubmit: React.MouseEventHandler<HTMLButtonElement> = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return (
    <Modal
      className="!w-full !max-w-md !h-auto !min-h-0 !rounded-xl !shadow-xl !border !border-border"
      isOpen={props.isOpen}
      setIsOpen={props.setIsOpen}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {props.type === "date" ? (
              <div className="flex justify-center items-center p-2 bg-transparent border border-border text-foreground rounded-lg">
                <Icon className="material-symbols-outlined">download</Icon>
              </div>
            ) : (
              <div className="flex justify-center items-center p-2 bg-transparent border border-border  rounded-lg text-foreground">
                <Icon className="material-symbols-outlined">file_upload</Icon>
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {props.type === "date"
                  ? dict.message.exportReport
                  : dict.action.upload}
              </h2>
              <p className="text-sm text-muted-foreground">
                {props.type === "date"
                  ? dict.message.pickDateRange
                  : dict.action.file}
              </p>
            </div>
          </div>
        </div>

        <form ref={formRef} onSubmit={onFormSubmit} className="space-y-6">
          <div className="space-y-4">
            {props.type === "date" && (
              <div className="relative w-fit">
                <DateInput
                  mode="range"
                  selectedDate={selectedDate}
                  setSelectedDateRange={setSelectedDate}
                  placement="bottom"
                  disableMobileView={true}
                  ariaLabel={`${dict.message.pickDateRange} ${selectedDate ? extractDateDisplay(selectedDate, "range") : ""}`}
                />
              </div>
            )}

            {props.type === "file" && <FileInputButton form={form} />}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LoadingSpinner isSmall={true} />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={() => props.setIsOpen(false)}
                disabled={isUploading}
                variant="outline"
              >
                {dict.action.cancel}
              </Button>

              <Button
                variant="info"
                leftIcon={props.type === "date" ? "download" : "file_upload"}
                type="button"
                onClick={onSubmit}
                disabled={
                  isUploading ||
                  (props.type === "date" &&
                    (!(selectedDate as DateRange).from ||
                      !(selectedDate as DateRange).to))
                }
              >
                {props.type === "date"
                  ? dict.action.export
                  : dict.action.upload}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}

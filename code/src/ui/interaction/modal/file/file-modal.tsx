"use client";

import React, { useRef, useState } from "react";
import { FieldValues, useForm, UseFormReturn } from "react-hook-form";

import { useDictionary } from "hooks/useDictionary";
import { AgentResponseBody } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import LoadingSpinner from "ui/graphic/loader/spinner";
import FileInputButton from "ui/interaction/action/file/file-input";
import { toast } from "ui/interaction/action/toast/toast";
import Button from "ui/interaction/button";
import Modal from "ui/interaction/modal/modal";
import { NavBarItemType } from "ui/navigation/navbar/navbar-item";
import DateRangeInput from "ui/interaction/input/date-range";
import { DateRange } from "react-day-picker";
import { getInitialDate, getUTCDate } from "utils/client-utils";
import { useRouter } from "next/navigation";
import { Icon } from "@mui/material";

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
  const router = useRouter();

  const onFormSubmit = form.handleSubmit(async (formData: FieldValues) => {
    if (props.type === "date") {
      const searchParams: URLSearchParams = new URLSearchParams({
        start: Math.floor(
          getUTCDate(selectedDate.from).getTime() / 1000
        ).toString(),
        end: Math.floor(
          getUTCDate(selectedDate.to).getTime() / 1000
        ).toString(),
      });

      const response = await fetch(`${props.url}?${searchParams.toString()}`);
      if (response.ok) {
        router.push(`${props.url}?${searchParams.toString()}`);
      } else {
        const jsonBody: AgentResponseBody = await response.json();
        toast(jsonBody.error?.message, "error");
      }
    } else if (props.type === "file") {
      let response;
      if (formData.files.length > 0) {
        const fileData: FormData = new FormData();
        fileData.append("file", formData.files[0]);
        try {
          setIsUploading(true);
          response = await fetch(props.url, {
            method: "POST",
            body: fileData,
          });
          const jsonResp: AgentResponseBody = await response.json();
          toast(
            jsonResp?.data?.message || jsonResp?.error?.message,
            jsonResp?.error ? "error" : "success"
          );
          // Closes the modal only if response is successfull
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
                  ? dict.message.noDateSelected
                  : dict.action.file}
              </p>
            </div>
          </div>
        </div>

        <form ref={formRef} onSubmit={onFormSubmit} className="space-y-6">
          <div className="space-y-4">
            {props.type === "date" && (
              <div className="relative">
                <DateRangeInput
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  placement="bottom"
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
                variant="success"
                leftIcon={props.type === "date" ? "download" : "file_upload"}
                type="button"
                onClick={onSubmit}
                disabled={
                  isUploading ||
                  (props.type === "date" &&
                    (!selectedDate.from || !selectedDate.to))
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

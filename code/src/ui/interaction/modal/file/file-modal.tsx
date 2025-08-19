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

interface FileModalProps {
  url: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * A modal component to upload files to the specified URL.
 *
 * @param {string} url The target url.
 * @param {boolean} isOpen Indicator if the this modal should be opened.
 * @param setIsOpen Method to close or open the modal.
 */
export default function FileModal(props: Readonly<FileModalProps>) {
  const form: UseFormReturn = useForm();
  const dict: Dictionary = useDictionary();
  const formRef: React.RefObject<HTMLFormElement> =
    useRef<HTMLFormElement>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const onFormSubmit = form.handleSubmit(async (formData: FieldValues) => {
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
  });

  const onSubmit: React.MouseEventHandler<HTMLButtonElement> = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return (
    <Modal
      className="!w-xs md:!w-sm !h-44 flex  !rounded-2xl !shadow-2xl"
      isOpen={props.isOpen}
      setIsOpen={props.setIsOpen}
    >
      <form ref={formRef} onSubmit={onFormSubmit}>
        <section className="flex items-center flex-wrap gap-2">
          <FileInputButton form={form} />
        </section>

        <section className="flex justify-between mt-2 border-t-1 border-border">
          {isUploading && <LoadingSpinner isSmall={false} />}
          <Button
            leftIcon="keyboard_tab"
            size="icon"
            iconSize="small"
            className="mt-2"
            onClick={onSubmit}
            tooltipText={dict.action.submit}
            tooltipPosition="bottom"
          />
        </section>
      </form>
    </Modal>
  );
}

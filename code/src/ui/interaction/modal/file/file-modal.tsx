"use client";
import styles from './file.modal.module.css';

import React, { useEffect, useRef, useState } from 'react';
import { FieldValues, useForm, UseFormReturn } from 'react-hook-form';

import { useDictionary } from 'hooks/useDictionary';
import { Dictionary } from 'types/dictionary';
import LoadingSpinner from 'ui/graphic/loader/spinner';
import ClickActionButton from 'ui/interaction/action/click/click-button';
import FileInputButton from 'ui/interaction/action/file/file-input';
import Modal from 'ui/interaction/modal/modal';
import ResponseComponent from 'ui/text/response/response';
import { CustomAgentResponseBody } from 'types/backend-agent';

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
  const formRef: React.RefObject<HTMLFormElement> = useRef<HTMLFormElement>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [response, setResponse] = useState<CustomAgentResponseBody>(null);

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
        const jsonResp: CustomAgentResponseBody = await response.json();
        setResponse(jsonResp);
      } catch (error) {
        console.error("There was an error uploading the file:", error);
        setResponse({ success: false, message: dict.message.fileUploadError })
      } finally {
        setIsUploading(false);
      }
    } else {
      setResponse({ success: false, message: dict.message.noFileChosenError })
    }
  });

  // Closes the modal only if response is successfull
  useEffect(() => {
    if (response?.success) {
      setTimeout(() => {
        setResponse(null);
        props.setIsOpen(false);
      }, 2000);
    }
  }, [response]);

  const onSubmit: React.MouseEventHandler<HTMLButtonElement> = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return (
    <Modal
      isOpen={props.isOpen}
      setIsOpen={props.setIsOpen}
    >
      <form ref={formRef} onSubmit={onFormSubmit}>
        <section className={styles["section-contents"]}>
          <FileInputButton
            form={form}
          />
        </section>

        <section className={styles["section-footer"]}>
          {!formRef.current?.formState?.isSubmitting && !isUploading && response && (
            <ResponseComponent response={response} />
          )}
          {isUploading && <LoadingSpinner isSmall={false} />}
          {!response?.success && (
            <ClickActionButton
              icon={"keyboard_tab"}
              onClick={onSubmit}
              tooltipText={dict.action.submit}
              tooltipPosition="bottom-start"
            />
          )}
        </section>
      </form>
    </Modal>
  );
}
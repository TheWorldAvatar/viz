"use client";

import styles from "../action.module.css";

import { Icon } from "@mui/material";
import { useDictionary } from "hooks/useDictionary";
import { Control, FieldValues, UseFormReturn, useWatch } from 'react-hook-form';
import { Dictionary } from "types/dictionary";

interface FileInputButtonProps {
  form: UseFormReturn<FieldValues>;
}

/**
 * A clickable button to upload a file input.
 * 
 * @param {UseFormReturn<FieldValues>} form React hook form's use form hook.
 */
export default function FileInputButton(props: Readonly<FileInputButtonProps>) {
  const dict: Dictionary = useDictionary();
  const filesKey: string = "files";
  const control: Control = props.form.control;
  const currentFiles: FileList = useWatch<FieldValues>({
    control,
    name: filesKey,
  });

  return (
    <>
      <label htmlFor="file-upload" className={`${styles["button-container"]} ${styles["hover-button-container"]} ${styles["background"]}`}>
        <Icon
          className={`material-symbols-outlined ${styles["icon"]} ${styles["background-text-color"]}`}
        >file_upload</Icon>
        <p className={`${styles["text"]} ${styles["background-text-color"]}`}>{dict.action.file}</p>
        <input id="file-upload" type="file" {...props.form.register(filesKey)} />
      </label>
      <p className={`${styles["text"]}`}>{currentFiles ? currentFiles[0]?.name : dict.message.noFileChosen}</p>
    </>
  );
}

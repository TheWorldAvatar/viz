"use client";

import { Icon } from "@mui/material";
import { useDictionary } from "hooks/useDictionary";
import { Control, FieldValues, UseFormReturn, useWatch } from "react-hook-form";
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
    <div className="w-full flex flex-col  gap-2">
      <label
        htmlFor="file-upload"
        className={` cursor-pointer flex items-center justify-center w-fit py-2 px-4 rounded-lg bg-blue-50 dark:bg-background   dark:border-blue-400 border border-blue-200  shadow-xs   `}
      >
        <Icon className="material-symbols-outlined text-blue-600 dark:text-blue-400">
          attach_file
        </Icon>
        <p className="ml-2 text-blue-700 dark:text-blue-400 text-base">
          {dict.action.file}
        </p>
        <input
          id="file-upload"
          type="file"
          {...props.form.register(filesKey)}
        />
      </label>
      <p className="text-foreground text-sm md:text-base ml-2">
        {currentFiles ? currentFiles[0]?.name : dict.message.noFileChosen}
      </p>
    </div>
  );
}

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
    <div>
      <label
        htmlFor="file-upload"
        className={`cursor-pointer flex items-center w-full max-w-md py-2 px-4 rounded-lg bg-info-background border border-info-border shadow-xs`}
      >
        <Icon className="material-symbols-outlined text-info-foreground">
          attach_file
        </Icon>
        <p className="ml-2 text-info-foreground text-base truncate">
          {currentFiles ? currentFiles[0]?.name : dict.message.noFileChosen}
        </p>
        <input
          id="file-upload"
          type="file"
          {...props.form.register(filesKey)}
        />
      </label>
    </div>
  );
}

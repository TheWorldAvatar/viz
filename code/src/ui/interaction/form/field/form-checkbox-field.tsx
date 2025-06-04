import styles from "./field.module.css";

import { Controller, FieldError, UseFormReturn } from "react-hook-form";

import { FormFieldOptions } from "types/form";
import FormErrorComponent from "ui/text/error/form-error";

export interface InputFieldProps {
  field: string;
  label: string;
  form: UseFormReturn;
  options?: FormFieldOptions;
}

/**
 * This component renders a button field similar to a checkbox for a form.
 *
 * @param {string} field The name of the field.
 * @param {string} label The label of the field.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {FormFieldOptions} options Configuration options for the field.
 */
export default function FormCheckboxField(props: Readonly<InputFieldProps>) {
  const fieldId: string = props.field.toLowerCase();

  return (
    <div>
      <Controller
        name={props.field}
        control={props.form.control}
        defaultValue={props.form.getValues(fieldId)}
        render={({ field: { value, onChange } }) => (
          <button
            type="button"
            onClick={() => {
              if (!props.options.disabled) {
                onChange(!value);
              }
            }}
            className={` cursor-pointer outline-none border-1 border-gray-500 rounded-xl p-4  bg-muted text-sm text-foreground w-24  ${
              value && " bg-primary"
            } 
            ${!props.options.disabled && "hover:bg-primary/80"} 
            ${props.options.disabled && "cursor-not-allowed"}`}
          >
            {props.label}
          </button>
        )}
      />
      {/* Return error for failed validation */}
      <FormErrorComponent
        error={props.form.formState.errors[fieldId] as FieldError}
      />
    </div>
  );
}

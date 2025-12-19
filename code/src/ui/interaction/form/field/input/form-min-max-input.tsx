
import { FieldError, UseFormReturn } from "react-hook-form";

import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import { FormFieldOptions, PropertyShape } from "types/form";
import FormInputContainer from "../form-input-container";
import NumericInputField from "./numeric-input";

export interface FormInputMinMaxFieldProps {
  field: PropertyShape;
  form: UseFormReturn;
  options?: FormFieldOptions;
}

/**
 * This component renders two input fields for the minimum and maximum values for a form. Note that number inputs will be set to 2 decimal places.
 *
 * @param {PropertyShape} field The SHACL shape property for this field.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {FormFieldOptions} options Configuration options for the field.
 */
export default function FormInputMinMaxField(
  props: Readonly<FormInputMinMaxFieldProps>
) {
  const dict: Dictionary = useDictionary();
  const originalField: string = props.field.fieldId;
  const minFieldId: string = "min " + originalField;
  const maxFieldId: string = "max " + originalField;
  const inputFieldStyles: string = "text-foreground w-full h-[1.8rem] p-5 my-2 rounded-lg border border-border bg-muted text-sm";

  return (
    <FormInputContainer
      field={props.field}
      error={props.form.formState.errors[originalField] as FieldError}
      labelStyles={props.options?.labelStyle}
    >
      <div className={"flex flex-col justify-between"}>
        <div>
          <label
            className={props.options?.labelStyle.join(" ")}
            htmlFor={minFieldId}
          >
            <p className={"text-gray-600 text-sm"}>{dict.form.min}:</p>
          </label>
          <NumericInputField
            field={{
              ...props.field,
              fieldId: minFieldId,
            }}
            form={props.form}
            options={{ inputStyle: [inputFieldStyles] }}
          />
        </div>
        <div>
          <label
            className={props.options?.labelStyle.join(" ")}
            htmlFor={maxFieldId}
          >
            <p className={"text-gray-600 text-sm"}>{dict.form.max}:</p>
          </label>
          <NumericInputField
            field={{
              ...props.field,
              fieldId: maxFieldId,
            }}
            form={props.form}
            options={{ inputStyle: [inputFieldStyles] }}
          />
        </div>
      </div>
    </FormInputContainer>
  );
}

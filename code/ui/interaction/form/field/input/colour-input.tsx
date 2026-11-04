
import { Controller, UseFormReturn } from "react-hook-form";

import { useDictionary } from "@/hooks/useDictionary";
import { Dictionary } from "@/types/dictionary";
import { FormFieldOptions, FormType, PropertyShape, VALUE_KEY } from "@/types/form";
import { interpolate, parseWordsForLabels } from "@/utils/client-utils";
import { getRegisterOptions } from "../../form-utils";

export interface ColourInputFieldProps {
  formType: FormType;
  field: PropertyShape;
  form: UseFormReturn;
  options?: FormFieldOptions;
}

/**
 * This component renders a colour input field for a form.
 *
 * @param {FormType} formType The type of the form.
 * @param {PropertyShape} field The SHACL shape property for this field.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {FormFieldOptions} options Configuration options for the field.
 */
export default function ColourInputField(props: Readonly<ColourInputFieldProps>) {
  const dict: Dictionary = useDictionary();
  return (
    <div className="w-full flex items-center gap-2">
      <label>{parseWordsForLabels(props.field.name[VALUE_KEY])}</label>
      <Controller
        control={props.form.control}
        name={props.field.fieldId}
        rules={getRegisterOptions(props.field, props.formType, dict)}
        render={({ field }) => {
          return (
            <>
              <input
                id={props.field.fieldId}
                type="color"
                value={field.value || "#000000"}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                className={`h-8 w-8 ${props.options?.disabled ? "cursor-not-allowed opacity-75 focus:outline-none" : ""}`}
                disabled={props.options?.disabled}
              />
              <input
                id={props.field.fieldId}
                placeholder={props.options?.disabled ? "" : interpolate(dict.action.addItem, props.field.name[VALUE_KEY])}
                readOnly={props.options?.disabled}
                aria-label={props.field.name[VALUE_KEY]}
                type="text"
                inputMode={props.options?.disabled ? "none" : "text"}
                className={`flex-1 ${props.options?.inputStyle?.join(" ")} ${props.options?.disabled
                  ? "border border-border bg-muted cursor-not-allowed opacity-75 focus:outline-none"
                  : ""}`}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
              />
            </>
          )
        }}
      />
    </div >
  );
}
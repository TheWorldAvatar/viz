
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
  const label: string = parseWordsForLabels(props.field.name[VALUE_KEY]);

  return (
    <div role="group" aria-label={label} className="flex items-center gap-2">
      <label htmlFor={props.field.fieldId}>{label}</label>
      <Controller
        control={props.form.control}
        name={props.field.fieldId}
        rules={getRegisterOptions(props.field, props.formType, dict)}
        render={({ field }) => {
          return (
            <>
              <div className="border border-border rounded-md p-0.5 flex">
                <input
                  id={`${props.field.fieldId}-picker`}
                  type="color"
                  aria-label={interpolate(dict.action.pickColour, label)}
                  value={field.value || "#000000"}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  className={`h-8 w-8 ${props.options?.disabled ? "cursor-not-allowed opacity-75 focus:outline-none" : ""}`}
                  disabled={props.options?.disabled}
                />
              </div>
              <input
                id={props.field.fieldId}
                placeholder={props.options?.disabled ? "" : "#000000"}
                readOnly={props.options?.disabled}
                type="text"
                inputMode={props.options?.disabled ? "none" : "text"}
                maxLength={7}
                className={`w-[calc(8ch+2rem)] ${props.options?.inputStyle?.join(" ")} ${props.options?.disabled
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
    </div>
  );
}
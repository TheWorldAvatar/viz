
import { UseFormReturn } from "react-hook-form";

import { useDictionary } from "@/hooks/useDictionary";
import { Dictionary } from "@/types/dictionary";
import { FormFieldOptions, FormType, PropertyShape, VALUE_KEY } from "@/types/form";
import { interpolate } from "@/utils/client-utils";
import { getRegisterOptions } from "../../form-utils";

export interface TextInputFieldProps {
  formType: FormType;
  field: PropertyShape;
  form: UseFormReturn;
  options?: FormFieldOptions;
}

/**
 * This component renders a text input field for a form.
 *
 * @param {FormType} formType The type of the form.
 * @param {PropertyShape} field The SHACL shape property for this field.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {FormFieldOptions} options Configuration options for the field.
 */
export default function TextInputField(
  props: Readonly<TextInputFieldProps>
) {
  const dict: Dictionary = useDictionary();
  const disabledClassName: string = props.options?.disabled
    ? "border border-border bg-muted cursor-not-allowed opacity-75 focus:outline-none"
    : "";
  return (<input
    id={props.field.fieldId}
    placeholder={props.options?.disabled ? "" : interpolate(dict.action.addItem, props.field.name[VALUE_KEY])}
    readOnly={props.options?.disabled}
    aria-label={props.field.name[VALUE_KEY]}
    type="text"
    inputMode={props.options?.disabled ? "none" : "text"}
    className={`${props.options?.inputStyle?.join(" ")} ${disabledClassName}`}
    {...props.form.register(
      props.field.fieldId,
      getRegisterOptions(props.field, props.formType, dict)
    )}
  />
  );
}
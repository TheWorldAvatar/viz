import styles from './field.module.css';

import { FieldError, UseFormReturn } from 'react-hook-form';

import { FormFieldOptions, PropertyShape, VALUE_KEY } from 'types/form';
import { FORM_STATES, getRegisterOptions } from 'ui/interaction/form/form-utils';
import FormInputContainer from './form-input-container';
import NumericInputField from './input/numeric-input';

export interface InputFieldProps {
  field: PropertyShape;
  form: UseFormReturn;
  options?: FormFieldOptions;
}

/**
 * This component renders an input field for a form. Note that number inputs will be set to 2 decimal places.
 * 
 * @param {PropertyShape} field The SHACL shape property for this field. 
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {FormFieldOptions} options Configuration options for the field.
 */
export default function FormInputField(props: Readonly<InputFieldProps>) {
  const inputClassNames: string = props.options?.inputStyle?.join(" ");
  // Disabled inputs should provide only text input
  const inputMode: "none" | "text" | "numeric" | "decimal" = props.options?.disabled ? "none" :
    props.field.datatype === "string" ? "text" :
      props.field.datatype === "integer" ? "numeric" : "decimal";

  return (
    <FormInputContainer
      field={props.field}
      error={props.form.formState.errors[props.field.fieldId] as FieldError}
      labelStyles={props.options?.labelStyle}
    >
      {(props.options?.disabled || props.field?.datatype === "string") ? <input
        id={props.field.fieldId}
        type="text"
        inputMode={inputMode}
        className={`${inputClassNames} ${props.options?.disabled && (styles["input-disabled"] + " " + styles["field-disabled"])}`}
        placeholder={props.options?.disabled ? "" : `Add ${props.field.name[VALUE_KEY]} here`}
        readOnly={props.options?.disabled}
        aria-label={props.field.name[VALUE_KEY]}
        {...props.form.register(props.field.fieldId, getRegisterOptions(props.field, props.form.getValues(FORM_STATES.FORM_TYPE)))}
      /> : <NumericInputField
        field={props.field}
        form={props.form}
        options={props.options}
      />}
    </FormInputContainer>
  );
}
import styles from './field.module.css';

import { Controller, FieldError, UseFormReturn } from 'react-hook-form';

import { FormFieldOptions } from 'types/form';
import FormErrorComponent from 'ui/text/error/form-error';

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
              if (!props.options.disabled) { onChange(!value) }
            }}
            className={`${styles["form-checkbox"]} ${value && styles["form-checkbox-checked"]} 
            ${!props.options.disabled && styles["form-checkbox-hover"]} 
            ${props.options.disabled && styles["field-disabled"]}`}
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
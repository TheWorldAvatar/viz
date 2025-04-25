import fieldStyles from '../field.module.css';
import styles from './input.module.css';

import { FieldError, UseFormReturn } from 'react-hook-form';

import { useDictionary } from 'hooks/useDictionary';
import { Dictionary } from 'types/dictionary';
import { PropertyShape } from 'types/form';
import FormInputContainer from '../form-input-container';
import NumericInputField from './numeric-input';

export interface FormInputMinMaxFieldProps {
  field: PropertyShape;
  form: UseFormReturn;
  styles?: {
    label?: string[],
  };
}

/**
 * This component renders two input fields for the minimum and maximum values for a form. Note that number inputs will be set to 2 decimal places.
 * 
 * @param {PropertyShape} field The SHACL shape property for this field. 
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {string[]} styles.label Optional styles for the label element.
 */
export default function FormInputMinMaxField(props: Readonly<FormInputMinMaxFieldProps>) {
  const dict: Dictionary = useDictionary();
  const originalField: string = props.field.fieldId;
  const minFieldId: string = "min " + originalField;
  const maxFieldId: string = "max " + originalField;
  return (
    <FormInputContainer
      field={props.field}
      error={props.form.formState.errors[originalField] as FieldError}
      labelStyles={props.styles?.label}
    >
      <div className={styles["min-max-container"]}>
        <div>
          <label className={props.styles?.label.join(" ")} htmlFor={minFieldId}>
            <span className={fieldStyles["field-text"]}>{dict.form.min}:</span>
          </label>
          <NumericInputField
            field={{
              ...props.field,
              fieldId: minFieldId,
            }}
            form={props.form}
            styles={{ input: [styles["min-max-input-value"]] }}
          />
        </div>
        <div className={styles["min-max-divider"]}></div>
        <div>
          <label className={props.styles?.label.join(" ")} htmlFor={maxFieldId}>
            <span className={fieldStyles["field-text"]}>{dict.form.max}:</span>
          </label>
          <NumericInputField
            field={{
              ...props.field,
              fieldId: maxFieldId,
            }}
            form={props.form}
            styles={{ input: [styles["min-max-input-value"]] }}
          />
        </div>
      </div>
    </FormInputContainer>
  );
}
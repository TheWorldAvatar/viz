import fieldStyles from '../field.module.css';
import styles from './array.module.css';

import React, { useEffect } from 'react';
import { FieldError, useFieldArray, UseFormReturn, useWatch } from 'react-hook-form';

import { PropertyShape, VALUE_KEY } from 'types/form';
import ClickActionButton from 'ui/interaction/action/click/click-button';
import FormInputContainer from 'ui/interaction/form/field/form-input-container';
import { FORM_STATES, getRegisterOptions } from 'ui/interaction/form/form-utils';
import { parseWordsForLabels } from 'utils/client-utils';

export interface FormArrayProps {
  fieldId: string;
  fieldConfigs: PropertyShape[];
  form: UseFormReturn;
  options?: {
    disabled?: boolean;
  };
}

/**
 * This component renders an array of inputs for a form.
 * 
 * @param {string} fieldId The field ID for the array. 
 * @param {PropertyShape[]} fieldConfigs The list of SHACL shape property for this field. 
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {boolean} options.disabled Optional indicator if the field should be disabled. Defaults to false.
 */
export default function FormArray(props: Readonly<FormArrayProps>) {
  const { control } = props.form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: props.fieldId,
  });
  const fieldSize: number = fields.length - 1;
  // Retrieve the live view of the last element in the array
  const lastRow: Record<string, string> = useWatch({
    control,
    name: `${props.fieldId}.${fieldSize}`,
  });

  useEffect(() => {
    const newRow: Record<string, object> = {};
    // If a user adds an input into the last row
    // Append a new row
    let allNullOrEmpty: boolean = true;
    for (const key in lastRow) {
      if (key != "id" && (lastRow[key] && lastRow[key] != "")) {
        allNullOrEmpty = false;
        break;
      }
      newRow[key] = null;
    }
    if (!allNullOrEmpty) {
      append(newRow);
    }
  }, [lastRow])

  return (
    <div className={fieldStyles["form-field-container"]}>
      <FormInputContainer
        field={{
          ...props.fieldConfigs[0],
          name: { "@value": "" },
        }}
        error={props.form.formState.errors[props.fieldId] as FieldError}
        labelStyles={[fieldStyles["form-input-label"]]}
      >
        <ul className={styles["row-container"]}>
          <li className={styles["array-row"]}>
            {props.fieldConfigs.map((field, index) => {
              return <p key={field.name[VALUE_KEY] + index} className={styles["cell"]}>
                {parseWordsForLabels(field.name[VALUE_KEY])}
              </p>
            })}
            <span className={`${styles["cell"]}`}></span>
          </li>
          {fields.map((field, index) => {
            return (
              <li key={field.id} className={styles["array-row"]}>
                {props.fieldConfigs.map((config, secondaryIndex) => {
                  return <div key={field.id + index + secondaryIndex} className={styles["cell"]}>
                    <input
                      id={config.name[VALUE_KEY]}
                      type={props.options?.disabled || config.datatype === "string" ? "text" : "number"}
                      className={fieldStyles["form-input-value"]}
                      step={"0.01"}
                      aria-label={config.name[VALUE_KEY]}
                      placeholder={config.minCount[VALUE_KEY] == "0" ? "May be left blank" : "Please add an input"}
                      {...props.form.register(`${props.fieldId}.${index}.${config.fieldId}`, getRegisterOptions(config, props.form.getValues(FORM_STATES.FORM_TYPE)))}
                    />
                  </div>
                })}
                {index < fieldSize && <ClickActionButton
                  icon={"remove"}
                  title={""}
                  className={`${styles["cell"]} ${styles["delete-button"]} ${styles["delete-button-background"]}`}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                    event.preventDefault();
                    remove(index);
                  }}
                />}
                {index == fieldSize && <ClickActionButton
                  icon={""}
                  title={""}
                  className={`${styles["cell"]} ${styles["delete-button"]} ${styles["delete-button-background-disabled"]}`}
                />}
              </li>
            );
          })}
        </ul>
      </FormInputContainer>
    </div>
  );
}
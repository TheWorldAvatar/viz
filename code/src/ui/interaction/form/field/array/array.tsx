import styles from './array.module.css';
import fieldStyles from '../field.module.css';

import React from 'react';
import { FieldError, useFieldArray, UseFormReturn } from 'react-hook-form';

import { FormArrayItemOption, PropertyShape } from 'types/form';
import { FORM_STATES, getRegisterOptions } from 'ui/interaction/form/form-utils';
import { parseWordsForLabels } from 'utils/client-utils';
import FormInputContainer from 'ui/interaction/form/field/form-input-container';
import ClickActionButton from 'ui/interaction/action/click/click-button';

export interface FormArrayProps {
  addText: string;
  field: PropertyShape;
  form: UseFormReturn;
  arrayOptions: FormArrayItemOption[];
  newArrayRow: Record<string, number>;
  options?: {
    disabled?: boolean;
  };
}

/**
 * This component renders an array of inputs for a form.
 * 
 * @param {string} addText The text label for the add button to append a new array item. 
 * @param {PropertyShape} field The SHACL shape property for this field. 
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {FormArrayItemOption[]} arrayOptions An array of field(s) to be rendered for each array row.
 * @param {boolean} options.disabled Optional indicator if the field should be disabled. Defaults to false.
 */
export default function FormArray(props: Readonly<FormArrayProps>) {
  const { control } = props.form;
  const { fields, append, remove, } = useFieldArray({
    control,
    name: props.field.fieldId,
  });
  return (
    <div style={{ width: "100%", margin: "0 0.75rem 1vh" }}>
      <FormInputContainer
        field={props.field}
        error={props.form.formState.errors[props.field.fieldId] as FieldError}
        labelStyles={[fieldStyles["form-input-label"]]}
      > <></>
      </FormInputContainer>
      <ClickActionButton
        icon={"add"}
        title={props.addText}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          event.preventDefault();
          append(props.newArrayRow);
        }}
      />
      <ul>
        <li className={styles["array-row"]}>
          {props.arrayOptions.map((item, index) => {
            return <p key={index} className={styles["cell"]}>
              {parseWordsForLabels(item.label)}
            </p>
          })}
          <span className={`${styles["cell"]}`}></span>
        </li>
        {fields.map((field, index) => {
          return (
            <li key={field.id} className={styles["array-row"]}>
              {props.arrayOptions.map((item, secondaryIndex) => {
                return <div key={field.id + index + secondaryIndex} className={styles["cell"]}>
                  <input
                    id={item.label}
                    type="number"
                    className={fieldStyles["form-input-value"]}
                    step={"0.01"}
                    aria-label={item.label}
                    placeholder={item.placeholder ?? ""}
                    {...props.form.register(`${props.field.fieldId}.${index}.${item.fieldId}`, getRegisterOptions(props.field, props.form.getValues(FORM_STATES.FORM_TYPE)))}
                  />
                </div>
              })}
              <ClickActionButton
                icon={"remove"}
                title={""}
                className={`${styles["cell"]} ${styles["delete-button"]}`}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                  event.preventDefault();
                  remove(index);
                }}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
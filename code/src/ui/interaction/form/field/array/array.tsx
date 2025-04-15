import styles from './array.module.css';

import React, { useEffect } from 'react';
import { useFieldArray, UseFormReturn, useWatch } from 'react-hook-form';

import { useBackgroundImageUrl } from 'hooks/useBackgroundImageUrl';
import { Dictionary } from 'types/dictionary';
import { PropertyShape } from 'types/form';
import ClickActionButton from 'ui/interaction/action/click/click-button';
import { DependentFormSection } from 'ui/interaction/form/section/dependent-form-section';
import { isValidIRI } from 'utils/client-utils';
import { useDictionary } from 'utils/dictionary/DictionaryContext';
import FormFieldComponent from '../form-field';

export interface FormArrayProps {
  agentApi: string;
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
  const backgroundImageUrl: string = useBackgroundImageUrl();
  const dict: Dictionary = useDictionary();

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
      if (key != "id" && (lastRow[key] && lastRow[key] != "" && !isValidIRI(lastRow[key]))) {
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
    <ul className={styles["row-container"]}>
      {fields.map((field, index) => {
        return (
          <li key={field.id} className={styles["row"]}
            style={{
              backgroundImage: `url(${backgroundImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}>
            <span className={styles["row-header"]}>
              <p className={styles["row-text"]}>
                <span className={styles["row-marker"]}>{index + 1}</span>
                {index == fieldSize && dict.message.arrayInstruction}
              </p>
              {index < fieldSize && <ClickActionButton
                icon={"remove"}
                className={`${styles["delete-button"]} ${styles["delete-button-background"]}`}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                  event.preventDefault();
                  remove(index);
                }}
              />}
            </span>
            {props.fieldConfigs.map((config, secondaryIndex) => {
              return <div key={field.id + index + secondaryIndex} className={styles["cell"]}>
                {config.class && <DependentFormSection
                  agentApi={props.agentApi}
                  dependentProp={{
                    ...config,
                    fieldId: `${props.fieldId}.${index}.${config.fieldId}`,
                  }}
                  form={props.form}
                />}
                {!config.class && <FormFieldComponent
                  agentApi={props.agentApi}
                  field={{
                    ...config,
                    fieldId: `${props.fieldId}.${index}.${config.fieldId}`,
                  }}
                  form={props.form}
                  options={props.options}
                />}
              </div>
            })}
          </li>
        );
      })}
    </ul>
  );
}
import styles from './array.module.css';

import React, { useState } from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';

import { useBackgroundImageUrl } from 'hooks/useBackgroundImageUrl';
import { PropertyShape } from 'types/form';
import ClickActionButton from 'ui/interaction/action/click/click-button';
import { DependentFormSection } from 'ui/interaction/form/section/dependent-form-section';
import { isValidIRI } from 'utils/client-utils';
import { useDictionary } from 'hooks/useDictionary';
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
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const { control } = props.form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: props.fieldId,
  });

  const newRow: Record<string, object> = React.useMemo(() => Object.fromEntries(
    Object.entries(fields[fields.length - 1]).map(([key, value]) => [key, { value }])), []);

  return (
    <div className={styles["container"]}>
      <div className={styles["tab-container"]}>
        <ClickActionButton
          icon={"add"}
          className={`${styles["row-marker"]} ${styles["add-button-background"]}`}
          isTransparent={true}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            append(newRow);
          }}
        />
        {fields.length > 1 && <ClickActionButton
          icon={"remove"}
          className={`${styles["delete-button"]} ${styles["delete-button-background"]}`}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            remove(currentIndex);
          }}
        />}
        {Array.from({ length: fields.length }, (_, index) => (
          <button
            key={index}
            className={`${styles["row-marker"]} ${index === currentIndex ? styles["active"] : ""}`}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              setCurrentIndex(index);
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <div className={styles["row"]}>
        {props.fieldConfigs.map((config, secondaryIndex) => {
          return <div key={currentIndex + secondaryIndex} className={styles["cell"]}>
            {config.class && <DependentFormSection
              agentApi={props.agentApi}
              dependentProp={{
                ...config,
                fieldId: `${props.fieldId}.${currentIndex}.${config.fieldId}`,
              }}
              form={props.form}
            />}
            {!config.class && <FormFieldComponent
              agentApi={props.agentApi}
              field={{
                ...config,
                fieldId: `${props.fieldId}.${currentIndex}.${config.fieldId}`,
              }}
              form={props.form}
              options={props.options}
            />}
          </div>
        })}
      </div>
    </div>
  );
}
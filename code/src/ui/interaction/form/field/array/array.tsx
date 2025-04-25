import styles from './array.module.css';

import React, { useState, useEffect } from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';

import { PropertyShape } from 'types/form';
import ClickActionButton from 'ui/interaction/action/click/click-button';
import { DependentFormSection } from 'ui/interaction/form/section/dependent-form-section';
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
 * It allows users to add, remove, and navigate between multiple entries of the same form fields.
 * 
 * @param {string} fieldId The field ID for the array. 
 * @param {PropertyShape[]} fieldConfigs The list of SHACL shape property for this field. 
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {boolean} options.disabled Optional indicator if the field should be disabled. Defaults to false.
 */
export default function FormArray(props: Readonly<FormArrayProps>) {
  // Controls which form array item is currently being displayed
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const { control, setValue } = props.form;

  // This key forces re-render of the form fields when currentIndex changes
  const [renderKey, setRenderKey] = useState(0);

  const { fields, append, remove } = useFieldArray({
    control,
    name: props.fieldId,
  });

  // Force re-render when the current index changes to ensure correct field values are displayed
  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [currentIndex]);

  /**
   * Creates a new empty row with default values for each field in the configuration
   * @returns {Object} An object with empty values for each field
   */
  const createEmptyRow = () => {
    const emptyField = {};
    props.fieldConfigs.forEach(config => {
      emptyField[config.fieldId] = '';
    });
    return emptyField;
  };

  return (
    <div className={styles["container"]}>
      <div className={styles["tab-container"]}>
        <ClickActionButton
          icon={"add"}
          className={`${styles["row-marker"]} ${styles["add-button-background"]}`}
          isTransparent={true}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            append(createEmptyRow());
          }}
        />
        {fields.length > 1 && <ClickActionButton
          icon={"remove"}
          className={`${styles["delete-button"]} ${styles["delete-button-background"]}`}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            remove(currentIndex);
            // Adjust current index
            if (currentIndex >= fields.length - 1) {
              setCurrentIndex(Math.max(0, fields.length - 2));
            }
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
      <div className={styles["row"]} key={`form-fields-${renderKey}`}>
        {props.fieldConfigs.map((config, secondaryIndex) => {
          const fieldId = `${props.fieldId}.${currentIndex}.${config.fieldId}`;

          return (
            <div key={`field-${secondaryIndex}`} className={styles["cell"]}>
              {config.class && <DependentFormSection
                agentApi={props.agentApi}
                dependentProp={{
                  ...config,
                  fieldId: fieldId,
                }}
                form={props.form}
              />}
              {!config.class && <FormFieldComponent
                agentApi={props.agentApi}
                field={{
                  ...config,
                  fieldId: fieldId,
                }}
                form={props.form}
                options={props.options}
              />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
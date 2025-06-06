import styles from "./array.module.css";

import React, { useMemo, useState } from "react";
import { FieldValues, useFieldArray, UseFormReturn } from "react-hook-form";

import { useBackgroundImageUrl } from "hooks/useBackgroundImageUrl";
import { FormFieldOptions, PropertyShape } from "types/form";
import ClickActionButton from "ui/interaction/action/click/click-button";
import { DependentFormSection } from "ui/interaction/form/section/dependent-form-section";
import { genEmptyArrayRow } from "../../form-utils";
import FormFieldComponent from "../form-field";

export interface FormArrayProps {
  agentApi: string;
  fieldId: string;
  fieldConfigs: PropertyShape[];
  form: UseFormReturn;
  options?: FormFieldOptions;
}

/**
 * This component renders an array of inputs for a form.
 * It allows users to add, remove, and navigate between multiple entries of the same form fields.
 *
 * @param {string} fieldId The field ID for the array.
 * @param {PropertyShape[]} fieldConfigs The list of SHACL shape property for this field.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {FormFieldOptions} options Configuration options for the field.
 */
export default function FormArray(props: Readonly<FormArrayProps>) {
  // Controls which form array item is currently being displayed
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const { control } = props.form;
  const backgroundImageUrl: string = useBackgroundImageUrl();

  const { fields, append, remove } = useFieldArray({
    control,
    name: props.fieldId,
  });

  const emptyRow: FieldValues = useMemo(() => {
    return genEmptyArrayRow(props.fieldConfigs);
  }, [props.fieldConfigs]);

  return (
    <div className={styles["container"]}>
      <div className={styles["tab-container"]}>
        <ClickActionButton
          icon={"add"}
          className={`${styles["row-marker"]} ${styles["add-button-background"]}`}
          isTransparent={true}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            append(emptyRow);
          }}
        />
        {fields.length > 1 && (
          <ClickActionButton
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
          />
        )}
        {Array.from({ length: fields.length }, (_, index) => (
          <button
            key={index}
            className={`${styles["row-marker"]} ${
              index === currentIndex ? styles["active"] : ""
            }`}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              setCurrentIndex(index);
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <div
        className={styles["row"]}
        style={{
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {props.fieldConfigs.map((config, index) => {
          const fieldId = `${props.fieldId}.${currentIndex}.${config.fieldId}`;
          return (
            <div
              key={`field-${currentIndex}-${index}`}
              className={styles["cell"]}
            >
              {config.class && (
                <DependentFormSection
                  agentApi={props.agentApi}
                  dependentProp={{
                    ...config,
                    fieldId: fieldId,
                  }}
                  form={props.form}
                />
              )}
              {!config.class && (
                <FormFieldComponent
                  agentApi={props.agentApi}
                  field={{
                    ...config,
                    fieldId: fieldId,
                  }}
                  form={props.form}
                  options={props.options}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

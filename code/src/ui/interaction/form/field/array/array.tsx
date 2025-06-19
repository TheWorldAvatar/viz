import React, { useMemo, useState } from "react";
import { FieldValues, useFieldArray, UseFormReturn } from "react-hook-form";

import { FormFieldOptions, PropertyShape } from "types/form";
import { DependentFormSection } from "ui/interaction/form/section/dependent-form-section";
import { genEmptyArrayRow } from "../../form-utils";
import FormFieldComponent from "../form-field";
import Button from "ui/interaction/button";
import { Dictionary } from "types/dictionary";
import { useDictionary } from "hooks/useDictionary";

export interface FormArrayProps {
  fieldId: string;
  minSize: number;
  maxSize: number;
  fieldConfigs: PropertyShape[];
  form: UseFormReturn;
  options?: FormFieldOptions;
}

/**
 * This component renders an array of inputs for a form.
 * It allows users to add, remove, and navigate between multiple entries of the same form fields.
 *
 * @param {string} fieldId The field ID for the array.
 * @param {number} minSize The minimum size of the array. 
 * @param {number} maxSize The maximum size of the array. 
 * @param {PropertyShape[]} fieldConfigs The list of SHACL shape property for this field. 
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {FormFieldOptions} options Configuration options for the field.
 */
export default function FormArray(props: Readonly<FormArrayProps>) {
  // Controls which form array item is currently being displayed
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const dict: Dictionary = useDictionary();
  // Min size defaults to 1. Users can only set it as 0 or 1
  const minArraySize: number = Number.isNaN(props.minSize) || props.minSize != 0 ? 1 : props.minSize;
  const { control } = props.form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: props.fieldId,
  });

  const emptyRow: FieldValues = useMemo(() => {
    return genEmptyArrayRow(props.fieldConfigs);
  }, [props.fieldConfigs]);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col justify-start items-start gap-4 my-4">
        <div className="flex flex-row items-center justify-start gap-2">
          {!props.options?.disabled && (Number.isNaN(props.maxSize) || fields.length < props.maxSize) && <Button
            size="icon"
            leftIcon="add"
            className=""
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              append(emptyRow);
            }}
          />}
          {!props.options?.disabled && fields.length > minArraySize && (
            <Button
              leftIcon="remove"
              size="icon"
              variant="destructive"
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
        </div>

        <div className="flex flex-wrap gap-4  rounded-lg w-fit">
          {Array.from({ length: fields.length }, (_, index) => (
            <button
              key={index}
              className={`cursor-pointer h-8 w-8 flex justify-center items-center text-sm m-0 text-foreground border-1 border-foreground rounded-sm ${index === currentIndex ? "bg-primary " : ""
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
      </div>

      <div className="bg-background flex flex-col w-full p-4 rounded-lg border-1 border-border">
        {fields.length == 0 && <p className="flex ">{dict.message.arrayInstruction}</p>}
        {fields.length > 0 && props.fieldConfigs.map((config, index) => {
          const fieldId = `${props.fieldId}.${currentIndex}.${config.fieldId}`;
          return (
            <div
              key={`field-${currentIndex}-${index}`}
              className="flex-1 whitespace-nowrap "
            >
              {config.class && (
                <DependentFormSection
                  dependentProp={{
                    ...config,
                    fieldId: fieldId,
                  }}
                  form={props.form}
                />
              )}
              {!config.class && (
                <FormFieldComponent
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

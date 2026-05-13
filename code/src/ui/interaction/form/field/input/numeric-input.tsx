import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";

import useFormSession from "hooks/form/useFormSession";
import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import { FormFieldOptions, PropertyShape, VALUE_KEY } from "types/form";
import Button from "ui/interaction/button";
import {
  getRegisterOptions
} from "ui/interaction/form/form-utils";
import NumberInput, { getStepsAndScaleFactor, performIncrementDecrement } from "ui/interaction/input/number-input";

export interface NumericInputFieldProps {
  field: PropertyShape;
  form: UseFormReturn;
  options?: FormFieldOptions;
}

/**
 * This component renders a numeric input field for a form.
 *
 * @param {PropertyShape} field The SHACL shape property for this field.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {FormFieldOptions} options Configuration options for the field.
 */
export default function NumericInputField(
  props: Readonly<NumericInputFieldProps>
) {
  const dict: Dictionary = useDictionary();
  const { formType } = useFormSession();

  const inputClassNames: string = props.options?.inputStyle?.join(" ");
  const inputMode: "numeric" | "decimal" =
    props.field.datatype === "integer" ? "numeric" : "decimal";
  const steps: number = props.field.step ? Number(props.field.step[VALUE_KEY]) : undefined;
  const stepsAndScaleFactor: number[] = getStepsAndScaleFactor(inputMode, steps);

  const handleIncrement: React.MouseEventHandler<HTMLButtonElement> = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    const currentValue: number = Number(
      props.form.getValues(props.field.fieldId)
    );
    const result: number = performIncrementDecrement(
      currentValue,
      stepsAndScaleFactor[0],
      stepsAndScaleFactor[1],
      props.field.pattern?.[VALUE_KEY],
      true
    );
    // Set value
    props.form.setValue(props.field.fieldId, result);
  };

  const handleDecrement: React.MouseEventHandler<HTMLButtonElement> = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    const currentValue: number = Number(
      props.form.getValues(props.field.fieldId)
    );
    const result: number = performIncrementDecrement(
      currentValue,
      stepsAndScaleFactor[0],
      stepsAndScaleFactor[1],
      props.field.pattern?.[VALUE_KEY],
      false
    );
    // Set value
    props.form.setValue(props.field.fieldId, result);
  };

  return (
    <div className="relative inline-block w-full">
      <Controller
        name={props.field.fieldId}
        control={props.form.control}
        rules={getRegisterOptions(props.field, formType, dict)}
        render={({ field: { onChange, value } }) => {
          return <NumberInput
            id={props.field.fieldId}
            inputMode={inputMode}
            className={`${inputClassNames ?? ""} pr-20`}
            placeholder={`${dict.action.edit} ${props.field.name[VALUE_KEY]}`}
            aria-label={props.field.name[VALUE_KEY]}
            value={value}
            numberPattern={props.field.pattern?.[VALUE_KEY]}
            steps={steps}
            onInputChange={onChange}
          />
        }}
      />
      <div className="flex absolute right-1 top-1/2 -translate-y-1/2 gap-px">
        <Button
          leftIcon="add"
          size="icon"
          className="rounded-l-lg rounded-r-none"
          tooltipText={dict.action.clickIncrease}
          onClick={handleIncrement}
        />
        <Button
          leftIcon="remove"
          variant="secondary"
          size="icon"
          className="rounded-l-none rounded-r-lg"
          tooltipText={dict.action.clickDecrease}
          onClick={handleDecrement}
        />
      </div>
    </div>
  );
}
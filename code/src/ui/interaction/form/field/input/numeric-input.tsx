import React, { useMemo, useRef } from "react";
import { UseFormReturn } from "react-hook-form";

import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import { FormFieldOptions, PropertyShape, VALUE_KEY } from "types/form";
import {
  FORM_STATES,
  getRegisterOptions,
} from "ui/interaction/form/form-utils";
import Button from "ui/interaction/button";

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
  const lastKeyPressTime: React.RefObject<number> = useRef<number>(0);

  const inputClassNames: string = props.options?.inputStyle?.join(" ");
  const inputMode: "numeric" | "decimal" =
    props.field.datatype === "integer" ? "numeric" : "decimal";
  const steps: number = useMemo(() => {
    return props.field.step
      ? Number(props.field.step[VALUE_KEY])
      : props.field.datatype === "integer"
      ? 1
      : 0.01;
  }, [props.field]);
  const scaleFactor: number = useMemo(() => {
    if (props.field.datatype === "integer") {
      return 1;
    }
    const stepStr: string = steps.toString();
    if (stepStr.includes("e-")) {
      const exponentPart = stepStr.split("e-")[1];
      return Math.pow(10, parseInt(exponentPart, 10));
    } else if (stepStr.includes(".")) {
      return Math.pow(10, stepStr.split(".")[1].length);
    }
  }, [steps]);

  const handleIncrement: React.MouseEventHandler<HTMLButtonElement> = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    const currentValue: number = Number(
      props.form.getValues(props.field.fieldId)
    );
    const result: number = performIncrementDecrement(
      currentValue,
      steps,
      scaleFactor,
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
      steps,
      scaleFactor,
      props.field.pattern?.[VALUE_KEY],
      false
    );
    // Set value
    props.form.setValue(props.field.fieldId, result);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const now = Date.now();
    if (now - lastKeyPressTime.current >= 200) {
      const currentValue: number = Number(
        props.form.getValues(props.field.fieldId)
      );
      if (event.key === "ArrowUp") {
        const result: number = performIncrementDecrement(
          currentValue,
          steps,
          scaleFactor,
          props.field.pattern?.[VALUE_KEY],
          true
        );
        props.form.setValue(props.field.fieldId, result);
        lastKeyPressTime.current = now;
      } else if (event.key === "ArrowDown") {
        const result: number = performIncrementDecrement(
          currentValue,
          steps,
          scaleFactor,
          props.field.pattern?.[VALUE_KEY],
          false
        );
        props.form.setValue(props.field.fieldId, result);
        lastKeyPressTime.current = now;
      }
    }
  };

  return (
    <div className="relative inline-block w-full">
      <input
        id={props.field.fieldId}
        type="text"
        inputMode={inputMode}
        className={`${inputClassNames ?? ""} pr-20`}
        placeholder={`${dict.action.edit} ${props.field.name[VALUE_KEY]}`}
        onKeyDown={handleKeyDown}
        aria-label={props.field.name[VALUE_KEY]}
        {...props.form.register(
          props.field.fieldId,
          getRegisterOptions(
            props.field,
            props.form.getValues(FORM_STATES.FORM_TYPE)
          )
        )}
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

/**
 * Perform the increment or decrement of a value.
 *
 * @param value the current value to be incremented or decremented.
 * @param steps the number of steps to increment or decrement the value by.
 * @param scaleFactor the scale factor to use for the operation.
 * @param regexEx the regex expression.
 * @param isAddition indicates if the operation is addition (true) or subtraction (false).
 */
function performIncrementDecrement(
  value: number,
  steps: number,
  scaleFactor: number,
  regexEx: string,
  isAddition: boolean
): number {
  let result: number = computeIncrementDecrement(
    Math.round(value / steps) * steps,
    steps,
    scaleFactor,
    isAddition
  );
  // The result must match the pattern and values will continue to be decremented until they are
  if (regexEx) {
    const stepString: string = String(steps);
    const decimalPlaces: number = stepString.includes(".")
      ? stepString.split(".")[1].length
      : 0;
    const pattern: RegExp = new RegExp(regexEx);
    while (!pattern.test(result.toFixed(decimalPlaces))) {
      result = computeIncrementDecrement(
        result,
        steps,
        scaleFactor,
        isAddition
      );
    }
  }
  return result;
}

/**
 * Computes the increment or decrement of a value based on the given steps and scale factor.
 *
 * @param value the current value to be incremented or decremented.
 * @param steps the number of steps to increment or decrement the value by.
 * @param scaleFactor the scale factor to use for the operation.
 * @param isAddition indicates if the operation is addition (true) or subtraction (false).
 */
function computeIncrementDecrement(
  value: number,
  steps: number,
  scaleFactor: number,
  isAddition: boolean
): number {
  // Scale up for decimals, but integers will always have 1 as a scale factor
  const scaledCurrentValue: number = Math.round(value * scaleFactor);
  const scaledStep: number = Math.round(steps * scaleFactor);
  if (isAddition) {
    return (scaledCurrentValue + scaledStep) / scaleFactor;
  }

  return (scaledCurrentValue - scaledStep) / scaleFactor;
}

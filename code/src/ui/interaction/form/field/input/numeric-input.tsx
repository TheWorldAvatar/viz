import styles from './input.module.css';

import React, { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { useDictionary } from 'hooks/useDictionary';
import { Dictionary } from 'types/dictionary';
import { PropertyShape, VALUE_KEY } from 'types/form';
import ClickActionButton from 'ui/interaction/action/click/click-button';
import { FORM_STATES, getRegisterOptions } from 'ui/interaction/form/form-utils';

export interface NumericInputFieldProps {
  field: PropertyShape;
  form: UseFormReturn;
  styles?: {
    input?: string[],
  };
}

/**
 * This component renders a numeric input field for a form.
 * 
 * @param {PropertyShape} field The SHACL shape property for this field. 
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {string[]} styles.input Optional styles for the input element.
 */
export default function NumericInputField(props: Readonly<NumericInputFieldProps>) {
  const dict: Dictionary = useDictionary();
  const inputClassNames: string = props.styles?.input?.join(" ");
  const inputMode: "numeric" | "decimal" = props.field.datatype === "integer" ? "numeric" : "decimal";
  const steps: number = useMemo(() => {
    return props.field.step ? Number(props.field.step[VALUE_KEY]) : props.field.datatype === "integer" ? 1 : 0.01
  }, [props.field]);
  const scaleFactor: number = useMemo(() => {
    return props.field.datatype === "integer" ? 1 : Math.pow(10, (steps.toString().split('.')[1] || '').length);
  }, [steps]);

  const handleIncrement: React.MouseEventHandler<HTMLButtonElement> = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const currentValue: number = Number(props.form.getValues(props.field.fieldId));
    // Scale up for decimals, but integers will always be 1
    const scaledCurrentValue: number = Math.round(currentValue * scaleFactor);
    const scaledStep: number = Math.round(steps * scaleFactor);
    const result: number = (scaledCurrentValue + scaledStep) / scaleFactor;
    // Set value
    props.form.setValue(props.field.fieldId, result);
  };

  const handleDecrement: React.MouseEventHandler<HTMLButtonElement> = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const currentValue: number = Number(props.form.getValues(props.field.fieldId));
    // Scale up for decimals, but integers will always be 1
    const scaledCurrentValue: number = Math.round(currentValue * scaleFactor);
    const scaledStep: number = Math.round(steps * scaleFactor);
    const result: number = (scaledCurrentValue - scaledStep) / scaleFactor;
    // Set value
    props.form.setValue(props.field.fieldId, result);
  };

  return (
    <div className={styles["numeric-input-container"]}>
      <input
        id={props.field.fieldId}
        type="text"
        inputMode={inputMode}
        className={inputClassNames}
        placeholder={`${dict.action.edit} ${props.field.name[VALUE_KEY]}`}
        aria-label={props.field.name[VALUE_KEY]}
        {...props.form.register(props.field.fieldId, getRegisterOptions(props.field, props.form.getValues(FORM_STATES.FORM_TYPE)))}
      />
      <div className={styles["numeric-input-scroller-container"]}>
        <ClickActionButton
          icon="add"
          tooltipText={dict.action.clickIncrease}
          isTransparent={true}
          className={styles["numeric-input-scroller"]}
          onClick={handleIncrement}
        />
        <ClickActionButton
          icon="remove"
          tooltipText={dict.action.clickDecrease}
          isTransparent={true}
          className={styles["numeric-input-scroller"]}
          onClick={handleDecrement}
        />
      </div>
    </div>
  );
}
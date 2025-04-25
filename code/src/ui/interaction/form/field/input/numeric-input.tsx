import styles from './input.module.css';

import React from 'react';
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
  const inputMode: "none" | "text" | "numeric" | "decimal" = props.field.datatype === "integer" ? "numeric" : "decimal";

  const handleIncrement: React.MouseEventHandler<HTMLButtonElement> = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    props.form.setValue(props.field.fieldId, props.form.getValues(props.field.fieldId) + 1);
  };

  const handleDecrement: React.MouseEventHandler<HTMLButtonElement> = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    props.form.setValue(props.field.fieldId, props.form.getValues(props.field.fieldId) - 1);
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
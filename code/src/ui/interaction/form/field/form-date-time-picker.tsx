import { useEffect, useState } from "react";
import styles from "./field.module.css";

import { FieldError, UseFormReturn } from "react-hook-form";

import { FormFieldOptions, PropertyShape, VALUE_KEY } from "types/form";
import {
  FORM_STATES,
  getRegisterOptions,
} from "ui/interaction/form/form-utils";
import DateInput from "ui/interaction/input/date-input";
import { getNormalizedDate, getUTCDate } from "utils/client-utils";
import FormInputContainer from "./form-input-container";

interface FormDateTimePickerProps {
  field: PropertyShape;
  form: UseFormReturn;
  options?: FormFieldOptions;
}

/**
 * This component renders a date time picker for the form.
 *
 * @param {PropertyShape} field The form field data model.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {FormFieldOptions} options Configuration options for the field.
 */
export default function FormDateTimePicker(
  props: Readonly<FormDateTimePickerProps>
) {
  const dateType: string = "date";
  const timeType: string = "time";
  const [selectedDate, setSelectedDate] = useState<Date>(
    (() => {
      if (props.field.datatype !== dateType) return new Date();
      const formValue: string = props.form.getValues(props.field.fieldId);
      if (!formValue) return new Date();
      return new Date(formValue);
    })()
  );
  let formatLabel: string;
  // Retrieve input type based on field input
  let inputType: string;
  if (props.field.datatype === dateType) {
    inputType = dateType;
    formatLabel = "YYYY/MM/DD";
  } else if (props.field.datatype === timeType) {
    inputType = timeType;
    formatLabel = "HH:MM";
  } else {
    inputType = "datetime-local";
    formatLabel = "DD/MM/YYYY HH:MM";
  }

  // useEffect to avoid calling setValue during render
  useEffect(() => {
    if (inputType === dateType) {
      const UTCDate: Date = getUTCDate(selectedDate as Date);
      props.form.setValue(props.field.fieldId, getNormalizedDate(UTCDate));
    } else if (
      !props.form.getValues(props.field.fieldId) ||
      props.form.getValues(props.field.fieldId) === ""
    ) {
      // Retrieve current date or time depending on field required
      let currentDateTime: string = new Date().toISOString();
      if (props.field.datatype === dateType) {
        currentDateTime = currentDateTime.split("T")[0];
      } else if (props.field.datatype === timeType) {
        currentDateTime = currentDateTime.split("T")[1].split(":")[0] + ":00";
      } else {
        const splitFormat: string[] = currentDateTime.split(":");
        currentDateTime = splitFormat[0] + ":" + splitFormat[1];
      }
      props.form.setValue(props.field.fieldId, currentDateTime);
    }
  }, [props.form, props.field.fieldId, selectedDate]);

  return (
    <FormInputContainer
      field={props.field}
      error={props.form.formState.errors[props.field.fieldId] as FieldError}
      labelStyles={props.options?.labelStyle}
      formatLabel={formatLabel}
    >
      {inputType === dateType ? (
        <div
          {...props.form.register(
            props.field.fieldId,
            getRegisterOptions(
              props.field,
              props.form.getValues(FORM_STATES.FORM_TYPE)
            )
          )}
        >
          <DateInput
            mode="single"
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            placement="bottom"
            disableMobileView={true}
            disabled={props.options.disabled}
          />
        </div>
      ) : (
        <input
          id={props.field.fieldId}
          className={`${styles["dtpicker"]} ${props.options?.disabled &&
            styles["input-disabled"] + " " + styles["field-disabled"]
            }`}
          type={inputType}
          readOnly={props.options?.disabled}
          aria-label={props.field.name[VALUE_KEY]}
          {...props.form.register(
            props.field.fieldId,
            getRegisterOptions(
              props.field,
              props.form.getValues(FORM_STATES.FORM_TYPE)
            )
          )}
        />
      )}
    </FormInputContainer>
  );
}

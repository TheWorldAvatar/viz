import { useEffect, useState } from "react";
import styles from "./field.module.css";

import useFormSession from "hooks/form/useFormSession";
import { useDictionary } from "hooks/useDictionary";
import { FieldError, UseFormReturn, useWatch } from "react-hook-form";
import { FormFieldOptions, PropertyShape, VALUE_KEY } from "types/form";
import {
  getRegisterOptions
} from "ui/interaction/form/form-utils";
import DateInput from "ui/interaction/input/date-input";
import { getNormalizedDate, getUTCDate, interpolate } from "utils/client-utils";
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
  const dict = useDictionary();
  const dateType: string = "date";
  const timeType: string = "time";

  const { formType } = useFormSession();

  const watchedDateValue: string = useWatch({
    control: props.form.control,
    name: props.field.fieldId
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    (() => {
      if (props.field.datatype !== dateType) return new Date();
      const formValue: string = props.form.getValues(props.field.fieldId);
      if (!formValue) {
        return Number(props.field.minCount?.[VALUE_KEY]) === 0 ? undefined : new Date();
      }
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
  const isOptionalDateField: boolean =
    inputType === dateType && Number(props.field.minCount?.[VALUE_KEY]) === 0;

  // useEffect to avoid calling setValue during render
  useEffect(() => {
    if (inputType === dateType) {
      if (selectedDate) {
        const UTCDate: Date = getUTCDate(selectedDate);
        props.form.setValue(props.field.fieldId, getNormalizedDate(UTCDate));
      } else if (isOptionalDateField) {
        props.form.setValue(props.field.fieldId, "");
      }
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
  }, [props.form, props.field.fieldId, selectedDate, inputType, props.field.datatype, watchedDateValue, isOptionalDateField]);

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
              formType,
              dict
            )
          )}
        >
          <DateInput
            mode="single"
            ariaLabel={props.field.name[VALUE_KEY]}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            placement="bottom"
            disableMobileView={true}
            disabled={props.options.disabled}
            required={!isOptionalDateField}
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
          aria-label={interpolate(dict.action.selectItem, props.field.name[VALUE_KEY])}
          {...props.form.register(
            props.field.fieldId,
            getRegisterOptions(
              props.field,
              formType,
              dict
            )
          )}
        />
      )}
    </FormInputContainer>
  );
}

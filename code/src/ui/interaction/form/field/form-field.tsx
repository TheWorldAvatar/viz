import styles from './field.module.css';

import { UseFormReturn } from 'react-hook-form';

import { PropertyShape, SEARCH_FORM_TYPE, VALUE_KEY } from 'types/form';
import { FORM_STATES } from '../form-utils';
import FormDateTimePicker from './form-date-time-picker';
import FormInputField from './form-input';
import FormInputMinMaxField from './input/form-min-max-input';
import OntologyConceptSelector from './input/ontology-concept-selector';

interface FormFieldProps {
  agentApi?: string;
  field: PropertyShape;
  form: UseFormReturn;
  options?: {
    disabled?: boolean;
  };
}

/**
 * Renders a form field as part of the form component.
 * 
 * @param {string} agentApi The target agent endpoint for any registry related functionalities. Optional for dropdown
 * @param {PropertyShape} field The form field data model.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {boolean} options.disabled Optional indicator if the field should be disabled. Defaults to false.
 */
export default function FormFieldComponent(props: Readonly<FormFieldProps>) {
  const formType: string = props.form.getValues(FORM_STATES.FORM_TYPE);
  // Any id field in the search form should be ignored
  if (!(formType == SEARCH_FORM_TYPE && props.field.name[VALUE_KEY] == "id")) {
    if (props.field.datatype && ["string", "integer", "decimal"].includes(props.field.datatype)) {
      return (
        <div className={styles["form-field-container"]}>
          <div className={styles["form-input-container"]}>
            {/** Display input min max range only if this is the search form and a numerical value */}
            {formType == SEARCH_FORM_TYPE && ["integer", "decimal"].includes(props.field.datatype)
              ? <FormInputMinMaxField
                field={props.field}
                form={props.form}
                styles={{
                  label: [styles["form-input-label"]],
                }}
              /> :
              <FormInputField
                field={props.field}
                form={props.form}
                options={{
                  disabled: props.options?.disabled,
                }}
                styles={{
                  label: [styles["form-input-label"]],
                  input: [styles["form-input-value"]],
                }}
              />
            }
          </div>
        </div>
      );
    } else if (props.field.datatype && ["dateTime", "date", "time"].includes(props.field.datatype)) {
      return (
        <div className={styles["form-field-container"]}>
          <div className={styles["form-input-container"]}>
            <FormDateTimePicker
              field={props.field}
              form={props.form}
              styles={{
                label: [styles["form-input-label"]],
              }}
              options={props.options}
            />
          </div>
        </div>
      );
    } else if (props.field.in) {
      return (
        <div className={styles["form-field-container"]}>
          <div className={styles["form-input-container"]}>
            <OntologyConceptSelector
              agentApi={props.agentApi}
              field={props.field}
              form={props.form}
              styles={{
                label: [styles["form-input-label"]],
              }}
              options={props.options}
            />
          </div>
        </div>
      );
    }
  }
}
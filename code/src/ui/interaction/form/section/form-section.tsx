import styles from '../form.module.css';

import { UseFormReturn } from 'react-hook-form';

import { PropertyGroup, VALUE_KEY } from 'types/form';
import { parseWordsForLabels } from 'utils/client-utils';
import { renderFormField } from '../form';
import FormArray from '../field/array/array';

interface FormSectionProps {
  entityType: string;
  agentApi: string;
  group: PropertyGroup;
  form: UseFormReturn;
  options?: {
    disabled?: boolean;
  };
}
/**
 * This component renders a form section.
 * 
 * @param {string} entityType The type of entity.
 * @param {string} agentApi The target agent endpoint for any registry related functionalities.
 * @param {PropertyGroup} group Fieldset group model.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {boolean} options.disabled Optional indicator if the field should be disabled. Defaults to false.
 */
export default function FormSection(props: Readonly<FormSectionProps>) {
  return (
    <fieldset className={styles["form-fieldset"]}>
      <legend className={styles["form-fieldset-label"]}>{parseWordsForLabels(props.group.label[VALUE_KEY])}</legend>
      <div className={styles["form-fieldset-contents"]}>
        {props.group.property.map((field, index) =>
          renderFormField(props.entityType, props.agentApi, field, props.form, index))}
        {props.group.multipleProperty.length > 0 && <FormArray
          fieldId={props.group.label[VALUE_KEY]}
          fieldConfigs={props.group.multipleProperty}
          form={props.form}
          options={props.options}
        />}
      </div>
    </fieldset>);
}
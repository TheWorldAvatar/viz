
import styles from "../form.module.css";

import { UseFormReturn } from "react-hook-form";

import { FormFieldOptions, PropertyGroup, VALUE_KEY } from "types/form";
import { parseWordsForLabels } from "utils/client-utils";
import FormArray from '../field/array/array';
import { renderFormField } from '../form';

interface FormSectionProps {
  entityType: string;
  group: PropertyGroup;
  form: UseFormReturn;
  options?: FormFieldOptions;
}
/**
 * This component renders a form section.
 *
 * @param {string} entityType The type of entity.
 * @param {PropertyGroup} group Fieldset group model.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {FormFieldOptions} options Configuration options for the field.
 */
export default function FormSection(props: Readonly<FormSectionProps>) {
  return (
    <fieldset className={styles["form-fieldset"]}>
      <legend className={styles["form-fieldset-label"]}>{parseWordsForLabels(props.group.label[VALUE_KEY])}</legend>
      <div className={styles["form-fieldset-contents"]}>
        {props.group.property.map((field, index) =>
          renderFormField(props.entityType, field, props.form, index))}
        {props.group.multipleProperty.length > 0 && <FormArray
          fieldId={props.group.label[VALUE_KEY]}
          fieldConfigs={props.group.multipleProperty}
          form={props.form}
          options={props.options}
        />}
      </div>
    </fieldset>);
}

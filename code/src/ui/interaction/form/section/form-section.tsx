import fieldStyles from "../field/field.module.css";
import styles from "../form.module.css";

import { UseFormReturn } from "react-hook-form";

import { PropertyGroup, VALUE_KEY } from "types/form";
import { parseWordsForLabels } from "utils/client-utils";
import FormFieldComponent from "../field/form-field";
import { DependentFormSection } from "./dependent-form-section";

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
      <legend className={styles["form-fieldset-label"]}>
        {parseWordsForLabels(props.group.label[VALUE_KEY])}
      </legend>
      {props.group.property.map((field, index) => {
        // If this is a hidden field, hide the field
        if (field.maxCount && parseInt(field.maxCount[VALUE_KEY]) === 0) {
          return <></>;
        }
        if (field.class) {
          return (
            <div
              key={field.name[VALUE_KEY] + index}
              className={fieldStyles["form-field-container"]}
            >
              <DependentFormSection
                agentApi={props.agentApi}
                dependentProp={field}
                form={props.form}
              />
            </div>
          );
        }
        return (
          <FormFieldComponent
            key={field.name[VALUE_KEY] + index}
            entityType={props.entityType}
            agentApi={props.agentApi}
            field={field}
            form={props.form}
            options={props.options}
          />
        );
      })}
    </fieldset>
  );
}

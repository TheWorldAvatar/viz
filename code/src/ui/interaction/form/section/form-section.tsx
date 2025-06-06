import { UseFormReturn } from "react-hook-form";

import { FormFieldOptions, PropertyGroup, VALUE_KEY } from "types/form";
import { parseWordsForLabels } from "utils/client-utils";
import FormArray from "../field/array/array";
import { renderFormField } from "../form";

interface FormSectionProps {
  entityType: string;
  agentApi: string;
  group: PropertyGroup;
  form: UseFormReturn;
  options?: FormFieldOptions;
}
/**
 * This component renders a form section.
 *
 * @param {string} entityType The type of entity.
 * @param {string} agentApi The target agent endpoint for any registry related functionalities.
 * @param {PropertyGroup} group Fieldset group model.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {FormFieldOptions} options Configuration options for the field.
 */
export default function FormSection(props: Readonly<FormSectionProps>) {
  return (
    <fieldset className="p-1 md:p-6 flex flex-col justify-center bg-background border-1 border-border rounded-lg m-4  ">
      <legend className="text-lg  font-bold ">
        {parseWordsForLabels(props.group.label[VALUE_KEY])}
      </legend>
      <div className="p-2">
        {props.group.property.map((field, index) =>
          renderFormField(
            props.entityType,
            props.agentApi,
            field,
            props.form,
            index
          )
        )}
        {props.group.multipleProperty.length > 0 && (
          <FormArray
            agentApi={props.agentApi}
            fieldId={props.group.label[VALUE_KEY]}
            fieldConfigs={props.group.multipleProperty}
            form={props.form}
            options={props.options}
          />
        )}
      </div>
    </fieldset>
  );
}

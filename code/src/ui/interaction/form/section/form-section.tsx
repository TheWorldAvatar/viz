import { UseFormReturn } from "react-hook-form";

import { FormFieldOptions, PropertyGroup, VALUE_KEY } from "types/form";
import { parseWordsForLabels } from "utils/client-utils";
import FormArray from "../field/array/array";
import { renderFormField } from "../form";

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
    <div className="p-2 md:p-6 flex flex-col justify-center mx-auto border-2 md:border-1 border-border bg-background rounded-lg my-14 md:my-8">
      <h2 className=" text-xl md:text-2xl  font-bold">
        {parseWordsForLabels(props.group.label[VALUE_KEY])}
      </h2>
      <div className="p-2 space-y-2">
        {!props.group.maxCount ||
        (props.group.maxCount &&
          parseInt(props.group.maxCount?.[VALUE_KEY]) > 1) ? (
          <FormArray
            fieldId={props.group.label[VALUE_KEY]}
            minSize={parseInt(props.group.minCount?.[VALUE_KEY])}
            maxSize={parseInt(props.group.maxCount?.[VALUE_KEY])}
            fieldConfigs={props.group.property}
            form={props.form}
            options={props.options}
          />
        ) : (
          props.group.property.map((field, index) =>
            renderFormField(props.entityType, field, props.form, index)
          )
        )}
      </div>
    </div>
  );
}

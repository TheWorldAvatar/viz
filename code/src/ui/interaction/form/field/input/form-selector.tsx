import { Controller, FieldError, UseFormReturn } from "react-hook-form";
import { useEffect } from "react";
import { GroupBase, OptionsOrGroups } from "react-select";

import {
  FormFieldOptions,
  OntologyConcept,
  PropertyShape,
  VALUE_KEY,
} from "types/form";
import SimpleSelector, {
  SelectOption,
} from "ui/interaction/dropdown/simple-selector";
import FormInputContainer from "../form-input-container";
import { getRegisterOptions } from "../../form-utils";

interface FormSelectorProps {
  selectOptions: OptionsOrGroups<SelectOption, GroupBase<SelectOption>>;
  field: PropertyShape;
  form: UseFormReturn;
  selectedOption?: OntologyConcept;
  noOptionMessage?: string;
  options?: FormFieldOptions;
}

/**
 * This component renders a dropdown selector for the form.
 *
 * @param {OptionsOrGroups<SelectOption, GroupBase<SelectOption>>} selectOptions The list of options to render.
 * @param {PropertyShape} field The field name that will be assigned to the form state.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {OntologyConcept} selectedOption Optional selected option description.
 * @param redirectOptions Optional redirect options for adding a new entity or viewing an existing entity.
 * @param {string} noOptionMessage Optional message to display when no options are available. Defaults to an empty string.
 * @param {FormFieldOptions} options Configuration options for the field.
 */
export default function FormSelector(props: Readonly<FormSelectorProps>) {
  const isAddForm: boolean = props.form.getValues("formType") === "add";
  const formType: string = props.form.getValues("formType");
  const registerOptions = getRegisterOptions(props.field, formType);

  // On mount for add forms, clear any pre-populated value injected by template default
  useEffect(() => {
    if (isAddForm) {
      // Clear any pre-populated value WITHOUT triggering validation.
      // This ensures the required message only appears after the first submit attempt.
      props.form.setValue(props.field.fieldId, undefined);
    }
  }, []);

  return (
    <FormInputContainer
      field={props.field}
      error={props.form.formState.errors[props.field.fieldId] as FieldError}
      labelStyles={props.options?.labelStyle}
      selectedOption={props.selectedOption}
    >
      <Controller
        name={props.field.fieldId}
        control={props.form.control}
        defaultValue={undefined}
        rules={registerOptions}
        render={({ field: { value, onChange } }) => {
          return (
            <SimpleSelector
              options={props.selectOptions}
              defaultVal={value as string | undefined}
              onChange={(selectedOption) => {
                onChange((selectedOption as SelectOption)?.value ?? undefined);
              }}
              isDisabled={props.options?.disabled}
              noOptionMessage={props.noOptionMessage}
              reqNotApplicableOption={props.field.minCount?.[VALUE_KEY] === "0"}
            />
          );
        }}
      />
    </FormInputContainer>
  );
}

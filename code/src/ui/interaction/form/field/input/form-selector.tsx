import { Controller, FieldError, UseFormReturn } from 'react-hook-form';
import { GroupBase, OptionsOrGroups } from 'react-select';

import { OntologyConcept, PropertyShape } from 'types/form';
import SimpleSelector, { SelectOption } from 'ui/interaction/dropdown/simple-selector';
import FormInputContainer, { FormInputContainerRedirectOptions } from '../form-input-container';

interface FormSelectorProps {
  selectOptions: OptionsOrGroups<SelectOption, GroupBase<SelectOption>>;
  field: PropertyShape;
  form: UseFormReturn;
  selectedOption?: OntologyConcept;
  redirectOptions?: FormInputContainerRedirectOptions;
  noOptionMessage?: string;
  options?: {
    disabled?: boolean;
  };
  styles?: {
    label?: string[],
  };
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
 * @param {boolean} options.disabled Optional parameter to disable the selector. Defaults to false.
 * @param {string[]} styles.label Optional styles for the label element.
 */
export default function FormSelector(props: Readonly<FormSelectorProps>) {
  return (
    <FormInputContainer
      field={props.field}
      error={props.form.formState.errors[props.field.fieldId] as FieldError}
      labelStyles={props.styles?.label}
      selectedOption={props.selectedOption}
      redirectOptions={props.redirectOptions}
    >
      <Controller
        name={props.field.fieldId}
        control={props.form.control}
        defaultValue={props.form.getValues(props.field.fieldId)}
        render={({ field: { value, onChange } }) => (
          <SimpleSelector
            options={props.selectOptions}
            defaultVal={value}
            onChange={(selectedOption) => onChange((selectedOption as SelectOption).value)}
            isDisabled={props.options?.disabled}
            noOptionMessage={props.noOptionMessage}
          />
        )}
      />
    </FormInputContainer>
  );
}
import { Controller, FieldError, UseFormReturn } from 'react-hook-form';
import Select from 'react-select';

import { Dictionary } from 'types/dictionary';
import { FormOptionType, PropertyShape } from 'types/form';
import { selectorStyles } from 'ui/css/selector-style';
import { useDictionary } from 'hooks/useDictionary';
import FormInputContainer from './form-input-container';

interface FormSelectorProps {
  field: PropertyShape;
  fieldOptions: FormOptionType[];
  form: UseFormReturn;
  options?: {
    disabled?: boolean;
  };
  redirectOptions?: {
    addUrl?: string;
    view?: React.MouseEventHandler<HTMLButtonElement>;
  };
  styles?: {
    label?: string[],
  };
}

/**
 * This component renders a dropdown selector for a dependent form section within the form.
 * 
 * @param {PropertyShape} field The field name that will be assigned to the form state.
 * @param {FormOptionType[]} fieldOptions The list of field options for the selector.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {boolean} options.disabled Optional indicator if the field should be disabled. Defaults to false.
 * @param {string[]} styles.label Optional styles for the label element.
 * @param redirectOptions Optional redirect options for adding a new entity or viewing an existing entity.
 */
export default function DependentFormSelector(props: Readonly<FormSelectorProps>) {
  const dict: Dictionary = useDictionary();
  return (
    <FormInputContainer
      field={props.field}
      error={props.form.formState.errors[props.field.fieldId] as FieldError}
      labelStyles={props.styles?.label}
      redirectOptions={props.redirectOptions}
    >
      <Controller
        name={props.field.fieldId}
        control={props.form.control}
        defaultValue={props.form.getValues(props.field.fieldId)}
        render={({ field: { value, onChange } }) => (
          <Select
            styles={selectorStyles}
            unstyled
            options={props.fieldOptions}
            value={props.fieldOptions.find(option => option.value === value)}
            onChange={(selectedOption) => onChange((selectedOption as FormOptionType).value)}
            isLoading={false}
            isMulti={false}
            isSearchable={true}
            isDisabled={props.options.disabled}
            noOptionsMessage={() => dict.message.noInstances}
          />
        )}
      />
    </FormInputContainer >
  );
}
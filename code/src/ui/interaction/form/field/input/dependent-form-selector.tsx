import { Controller, FieldError, UseFormReturn } from "react-hook-form";
import {
    FormFieldOptions,
    PropertyShape
} from "types/form";
import SearchableSimpleSelector from "ui/interaction/dropdown/searchable-simple-selector";
import {
    SelectOptionType,
} from "ui/interaction/dropdown/simple-selector";
import { FORM_STATES, getRegisterOptions } from "../../form-utils";
import FormInputContainer from "../form-input-container";

interface FormSelectorProps {
    selectOptions: SelectOptionType[];
    field: PropertyShape;
    form: UseFormReturn;
    isLoading: boolean;
    noOptionMessage?: string;
    options?: FormFieldOptions;
    onSearchChange?: (_search: string) => void;
}

/**
 * This component renders a dropdown selector for the form.
 *
 * @param {SelectOptionType[]} selectOptions The list of options to render.
 * @param {PropertyShape} field The field name that will be assigned to the form state.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {boolean} isLoading Flag to show loading state.
 * @param {string} noOptionMessage Optional message to display when no options are available. Defaults to an empty string.
 * @param {FormFieldOptions} options Configuration options for the field.
 * @param {function} onSearchChange Optional function called when the search input changes.
 */
export default function DependentFormSelector(props: Readonly<FormSelectorProps>) {
    const formType: string = props.form.getValues(FORM_STATES.FORM_TYPE);
    const registerOptions = getRegisterOptions(props.field, formType);
    return (
        <FormInputContainer
            field={props.field}
            error={props.form.formState.errors[props.field.fieldId] as FieldError}
            labelStyles={props.options?.labelStyle}
        >
            <Controller
                name={props.field.fieldId}
                control={props.form.control}
                defaultValue={props.form.getValues(props.field.fieldId)}
                rules={registerOptions}
                render={({ field: { onChange } }) => {
                    return (
                        <SearchableSimpleSelector
                            key={props.field.fieldId}
                            options={props.selectOptions}
                            initialValue={props.selectOptions.find(option => option.value == props.form.getValues(props.field.fieldId))}
                            onChange={(selectedOption: SelectOptionType) => {
                                onChange(selectedOption.value);
                            }}
                            onSearchChange={(searchValue) => {
                                props.onSearchChange?.(searchValue);
                            }}
                            isLoading={props.isLoading}
                            isDisabled={props.options?.disabled}
                            noOptionMessage={props.noOptionMessage}
                        />
                    );
                }}
            />
        </FormInputContainer>
    );
}

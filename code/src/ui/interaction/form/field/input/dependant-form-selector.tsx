import { Controller, FieldError, UseFormReturn } from "react-hook-form";
import { GroupBase, OptionsOrGroups } from "react-select";

import {
    FormFieldOptions,
    OntologyConcept,
    PropertyShape,

} from "types/form";
import {
    SelectOptionType,
} from "ui/interaction/dropdown/simple-selector";
import FormInputContainer from "../form-input-container";
import { getRegisterOptions } from "../../form-utils";
import SearchableSimpleSelector from "ui/interaction/dropdown/searchable-simple-selector";

interface FormSelectorProps {
    selectOptions: OptionsOrGroups<SelectOptionType, GroupBase<SelectOptionType>>;
    field: PropertyShape;
    form: UseFormReturn;
    selectedOption?: OntologyConcept;
    noOptionMessage?: string;
    options?: FormFieldOptions;
    isLoading?: boolean;
    onSearchChange?: (_search: string) => void;
}

/**
 * This component renders a dropdown selector for the form.
 *
 * @param {OptionsOrGroups<SelectOptionType, GroupBase<SelectOptionType>>} selectOptions The list of options to render.
 * @param {PropertyShape} field The field name that will be assigned to the form state.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {OntologyConcept} selectedOption Optional selected option description.
 * @param redirectOptions Optional redirect options for adding a new entity or viewing an existing entity.
 * @param {string} noOptionMessage Optional message to display when no options are available. Defaults to an empty string.
 * @param {FormFieldOptions} options Configuration options for the field.
 */
export default function DependantFormSelector(props: Readonly<FormSelectorProps>) {
    const formType: string = props.form.getValues("formType");
    const registerOptions = getRegisterOptions(props.field, formType);

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
                defaultValue={props.form.getValues(props.field.fieldId)}
                rules={registerOptions}
                render={({ field: { value, onChange } }) => {
                    return (
                        <SearchableSimpleSelector
                            options={props.selectOptions as SelectOptionType[]}
                            onChange={(selectedOption) => {
                                onChange((selectedOption as SelectOptionType).value);
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

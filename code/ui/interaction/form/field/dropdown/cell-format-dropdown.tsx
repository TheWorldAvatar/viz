import { useDictionary } from "@/hooks/useDictionary";
import { Dictionary } from "@/types/dictionary";
import { FormFieldOptions, PropertyShape, VALUE_KEY } from "@/types/form";
import SimpleSelector, { SelectOptionType } from "@/ui/interaction/dropdown/simple-selector";
import { interpolate, parseWordsForLabels } from "@/utils/client-utils";
import { Controller, UseFormReturn } from "react-hook-form";

interface CellFormatDropdownFieldProps {
    field: PropertyShape;
    form: UseFormReturn;
    dropdownOptions: SelectOptionType[];
    options?: FormFieldOptions;

}
/**
 * This component renders a dropdown for cell format fields.
 *
 * @param {PropertyShape} field The field's SHACL restrictions.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {SelectOptionType[]} dropdownOptions Options to render in the dropdown.
 * @param {FormFieldOptions} options Configuration options for the field.
 */
export function CellFormatDropdownField(
    props: Readonly<CellFormatDropdownFieldProps>
) {
    const fieldName: string = props.field?.fieldId;
    const label: string = props.field.name[VALUE_KEY];
    const dict: Dictionary = useDictionary();

    return <div className="flex flex-col gap-2 w-full">
        <label>{parseWordsForLabels(label)}</label>
        <Controller
            name={fieldName}
            control={props.form.control}
            defaultValue={""}
            render={({ field: { onChange, value } }) => {
                return <SimpleSelector
                    options={props.dropdownOptions}
                    defaultVal={value}
                    onChange={(option) => {
                        onChange((option as SelectOptionType).value);
                    }}
                    ariaLabel={interpolate(dict.action.selectItem, label)}
                    hasLimits={true}
                    reqNotApplicableOption={false}
                    noOptionMessage={dict.message.noOptions}
                    isDisabled={props.options.disabled}
                />
            }}
        />
    </div>
}
import { useDictionary } from "@/hooks/useDictionary";
import { Dictionary } from "@/types/dictionary";
import { PropertyShape, VALUE_KEY } from "@/types/form";
import SimpleSelector, { SelectOptionType } from "@/ui/interaction/dropdown/simple-selector";
import { interpolate } from "@/utils/client-utils";
import { Controller, UseFormReturn } from "react-hook-form";

interface CellFormatDropdownFieldProps {
    field: PropertyShape;
    form: UseFormReturn;
    options: SelectOptionType[];
}
/**
 * This component renders a dropdown for cell format fields.
 *
 * @param {PropertyShape} field The field's SHACL restrictions.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {SelectOptionType[]} options Options to render in the dropdown.
 */
export function CellFormatDropdownField(
    props: Readonly<CellFormatDropdownFieldProps>
) {
    const fieldName: string = props.field?.fieldId;
    const label: string = props.field.name[VALUE_KEY];
    const dict: Dictionary = useDictionary();

    return <div className="w-full">
        <Controller
            name={fieldName}
            control={props.form.control}
            defaultValue={""}
            render={({ field: { onChange, value } }) => {
                return <SimpleSelector
                    options={props.options}
                    defaultVal={value}
                    onChange={(option) => {
                        onChange((option as SelectOptionType).value);
                    }}
                    ariaLabel={interpolate(dict.action.selectItem, label)}
                    hasLimits={true}
                    reqNotApplicableOption={false}
                    noOptionMessage={dict.message.noOptions}
                />
            }}
        />
    </div>
}
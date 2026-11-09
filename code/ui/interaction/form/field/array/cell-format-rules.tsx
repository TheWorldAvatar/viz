import React, { useMemo } from "react";
import { FieldValues, useFieldArray, UseFieldArrayRemove, UseFormReturn } from "react-hook-form";

import { useDictionary } from "@/hooks/useDictionary";
import { browserStorageManager } from "@/state/browser-storage-manager";
import { Dictionary } from "@/types/dictionary";
import { FormFieldOptions, FormTypeMap, PropertyShape, VALUE_KEY } from "@/types/form";
import { ConditionalFormatFieldOperatorMap } from "@/types/table";
import { translateLifecycleFields } from "@/ui/graphic/table/registry/registry-table-utils";
import Button from "@/ui/interaction/button";
import { interpolate, parseWordsForLabels } from "@/utils/client-utils";
import { COL_CELL_FORMAT_KEY } from "@/utils/constants";
import { Plus, Trash } from "lucide-react";
import { genEmptyArrayRow } from "../../form-utils";
import { CellFormatDropdownField } from "../dropdown/cell-format-dropdown";
import ColourInputField from "../input/colour-input";
import TextInputField from "../input/text-input";

export interface FormCellFormatRulesArrayProps {
  fieldId: string;
  fieldConfigs: PropertyShape[];
  form: UseFormReturn;
  options?: FormFieldOptions;
}

interface CellFormatRuleProps {
  fieldId: string;
  index: string;
  fields: PropertyShape[];
  form: UseFormReturn;
  remove: UseFieldArrayRemove;
  options?: FormFieldOptions;
}

/**
 * This component renders the cell format rule array for a form.
 *
 * @param {string} fieldId The field ID for the array.
 * @param {PropertyShape[]} fieldConfigs The list of SHACL shape property for this field.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {FormFieldOptions} options Configuration options for the field.
 */
export default function FormCellFormatRulesArray(props: Readonly<FormCellFormatRulesArrayProps>) {
  const dict: Dictionary = useDictionary();
  const { control } = props.form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: props.fieldId,
  });

  const emptyRow: FieldValues = useMemo(() => {
    return genEmptyArrayRow(props.fieldConfigs);
  }, [props.fieldConfigs]);

  return (
    <>
      <div className="flex flex-col gap-8 w-full rounded-lg">
        {fields?.map((_field, index) => <FormCellFormatRule
          key={index}
          fieldId={props.fieldId}
          index={String(index)}
          fields={props.fieldConfigs}
          form={props.form}
          options={props.options}
          remove={fields.length > 1 ? remove : null}
        />
        )}
      </div>
      {!props.options.disabled && <Button
        variant="outline"
        className="w-full py-6"
        leftIcon={Plus}
        label={interpolate(dict.action.addItem, props.fieldId)}
        tooltipText={interpolate(dict.action.addItem, props.fieldId)}
        aria-label={interpolate(dict.action.addItem, props.fieldId)}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          event.preventDefault();
          append(emptyRow);
        }}
      />}
    </>
  );
}

function FormCellFormatRule(props: CellFormatRuleProps) {
  const dict: Dictionary = useDictionary();
  const valueField: PropertyShape = getNestedFieldConfig(props, "value");
  return <aside className="flex flex-col gap-4 p-3 rounded-lg border border-border">
    <div className="ml-auto">
      {props.remove && <Button
        variant="destructive"
        size="icon"
        leftIcon={Trash}
        aria-label={interpolate(dict.action.removeItem, props.fieldId)}
        tooltipText={interpolate(dict.action.removeItem, props.fieldId)}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          event.preventDefault();
          props.remove(parseInt(props.index));
        }}
      />}
    </div>
    <div className="flex flex-col md:flex-row gap-6">
      <CellFormatDropdownField
        field={getNestedFieldConfig(props, "field")}
        form={props.form}
        dropdownOptions={(JSON.parse(browserStorageManager.get(COL_CELL_FORMAT_KEY)) as string[]).map((field) => ({
          label: parseWordsForLabels(field == "lastmodified" || field == "scheduleType"
            ? translateLifecycleFields(field, dict.title) : field),
          value: field,
          disabled: false,
        }))}
        options={props.options}
      />
      <CellFormatDropdownField
        field={getNestedFieldConfig(props, "operator")}
        form={props.form}
        dropdownOptions={Object.values(
          ConditionalFormatFieldOperatorMap
        ).map((value) => ({
          label: dict.title[value],
          value: value,
          disabled: false,
        }))}
        options={props.options}
      />
      <div className="flex flex-col gap-2 w-full">
        <label htmlFor={valueField.fieldId}>{parseWordsForLabels(valueField.name[VALUE_KEY])}</label>
        <TextInputField
          formType={FormTypeMap.ADD}
          field={valueField}
          form={props.form}
          options={{
            ...props.options,
            inputStyle: ["w-full h-[2.75rem] max-w-none py-2 px-4 rounded-lg border border-border bg-muted text-foreground focus-visible:outline-[2px] focus-visible:outline-focus"],
          }}
        />
      </div>
    </div>
    <div className="flex flex-col md:flex-row gap-6">
      <ColourInputField
        formType={FormTypeMap.ADD}
        field={getNestedFieldConfig(props, "background")}
        form={props.form}
        options={{
          ...props.options,
          inputStyle: ["h-[2.75rem] max-w-none py-2 px-4 rounded-lg border border-border bg-muted text-foreground focus-visible:outline-[2px] focus-visible:outline-focus"],
        }}
      />
      <ColourInputField
        formType={FormTypeMap.ADD}
        field={getNestedFieldConfig(props, "text")}
        form={props.form}
        options={{
          ...props.options,
          inputStyle: ["h-[2.75rem] max-w-none py-2 px-4 rounded-lg border border-border bg-muted text-foreground focus-visible:outline-[2px] focus-visible:outline-focus"],
        }}
      />
    </div>
  </aside>
}

function getNestedFieldConfig(props: CellFormatRuleProps, fieldName: string) {
  const field: PropertyShape = props.fields?.find(f => f.name[VALUE_KEY] === fieldName);
  if (!field) return null;
  return {
    ...field,
    fieldId: `${props.fieldId}.${props.index}.${field.fieldId}`,
  };
};
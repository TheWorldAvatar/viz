import fieldStyles from "../field/field.module.css";

import { Control, Controller, FieldError, FieldValues, UseFormReturn, useWatch } from "react-hook-form";

import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import {
  BillingEntityTypes,
  FormTypeMap,
  ID_KEY,
  PropertyShape,
  VALUE_KEY
} from "types/form";
import LoadingSpinner from "ui/graphic/loader/spinner";
import {
  getId,
  parseStringsForUrls
} from "utils/client-utils";
import { FORM_STATES, getRegisterOptions } from "../form-utils";

import { useDependentField } from "hooks/form/api/useDependentField";
import { useFormQuickView } from "hooks/form/useFormQuickView";
import FormQuickViewBody from "ui/interaction/accordion/form-quick-view-body";
import FormQuickViewHeader from "ui/interaction/accordion/form-quick-view-header";
import AsyncSearchableSimpleSelector from "ui/interaction/dropdown/async-searchable-simple-selector";
import { SelectOptionType } from "ui/interaction/dropdown/simple-selector";
import FormInputContainer from "../field/form-input-container";

interface DependentFormSectionProps {
  dependentProp: PropertyShape;
  form: UseFormReturn;
  billingStore?: BillingEntityTypes;
  isArray?: boolean;
}

/**
 * This component renders a form section that has dependencies on related entities.
 *
 * @param {PropertyShape} dependentProp The dependent property's SHACL restrictions.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {BillingEntityTypes} billingStore Optionally stores the type of account and pricing.
 * @param {boolean} isArray Whether the field is an array.
 */
export function DependentFormSection(
  props: Readonly<DependentFormSectionProps>
) {
  const dict: Dictionary = useDictionary();

  const fieldName: string = props.dependentProp?.fieldId;
  const label: string = props.dependentProp.name[VALUE_KEY];
  const queryEntityType: string = parseStringsForUrls(label); // Ensure that all spaces are replaced with _

  const formType: string = props.form.getValues(FORM_STATES.FORM_TYPE);

  const control: Control = props.form.control;
  const currentOption: string = useWatch<FieldValues>({
    control,
    name: fieldName,
  });

  const { selectedOption, currentParentOption, getFieldOptions } = useDependentField(props.dependentProp, props.form, props.isArray);
  const {
    id,
    selectedEntityId,
    quickViewGroups,
    isQuickViewLoading,
    isQuickViewOpen,
    setIsQuickViewOpen,
  } = useFormQuickView(currentOption, queryEntityType);

  return (
    <div className="rounded-lg my-4">
      <div className="flex flex-col w-full gap-2">
        <FormInputContainer
          field={props.dependentProp}
          error={props.form.formState.errors[fieldName] as FieldError}
          labelStyles={["flex flex-row items-center",
            fieldStyles["form-input-label"],
          ]}
        >
          <Controller
            name={fieldName}
            control={props.form.control}
            defaultValue={selectedOption}
            rules={getRegisterOptions(props.dependentProp, formType)}
            render={({ field: { onChange } }) => {
              return (
                <AsyncSearchableSimpleSelector
                  key={`${fieldName}-${currentParentOption}`}
                  options={getFieldOptions}
                  initialValue={selectedOption}
                  onChange={(option: SelectOptionType) => {
                    onChange(option.value);
                  }}
                  isDisabled={formType == FormTypeMap.VIEW ||
                    formType == FormTypeMap.DELETE ||
                    // Disable if parent field has no value
                    (props.dependentProp.dependentOn?.[ID_KEY] != undefined && currentParentOption == undefined)}
                  noOptionMessage={dict.message.noInstances}
                />
              );
            }}
          />
        </FormInputContainer>
        {formType != FormTypeMap.SEARCH && <FormQuickViewHeader
          id={id}
          title={dict.title.quickView}
          selectedEntityId={selectedEntityId}
          entityType={queryEntityType}
          formType={formType}
          isFormView={formType == FormTypeMap.VIEW}
          isOpen={isQuickViewOpen}
          setIsOpen={setIsQuickViewOpen}
          accountId={props.billingStore && getId(props.form.getValues(props.billingStore.accountField))}
          accountType={props.billingStore?.account}
          pricingType={props.billingStore?.pricing}
        />}
        {currentOption &&
          isQuickViewOpen &&
          (isQuickViewLoading ? (
            <div className="flex justify-center p-4">
              <LoadingSpinner isSmall={true} />
            </div>
          ) : (
            <FormQuickViewBody id={id} quickViewGroups={quickViewGroups} />
          ))}
      </div>
    </div>
  );
}

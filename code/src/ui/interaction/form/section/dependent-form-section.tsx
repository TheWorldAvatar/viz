import fieldStyles from "../field/field.module.css";

import { useEffect, useRef, useState } from "react";
import { Control, FieldValues, UseFormReturn, useWatch } from "react-hook-form";

import { useDictionary } from "hooks/useDictionary";
import { AgentResponseBody, InternalApiIdentifierMap } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import {
  BillingEntityTypes,
  FormTypeMap,
  ID_KEY,
  OntologyConcept,
  PropertyShape,
  SparqlResponseField,
  VALUE_KEY
} from "types/form";
import LoadingSpinner from "ui/graphic/loader/spinner";
import { SelectOptionType } from "ui/interaction/dropdown/simple-selector";
import {
  getAfterDelimiter,
  getId,
  parseStringsForUrls
} from "utils/client-utils";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";
import { findMatchingDropdownOptionValue, FORM_STATES, genDefaultSelectOption } from "../form-utils";

import { useFormQuickView } from "hooks/form/useFormQuickView";
import { useDebounce } from "hooks/useDebounce";
import useRefresh from "hooks/useRefresh";
import FormQuickViewBody from "ui/interaction/accordion/form-quick-view-body";
import FormQuickViewHeader from "ui/interaction/accordion/form-quick-view-header";
import DependentFormSelector from "../field/input/dependent-form-selector";

interface DependentFormSectionProps {
  dependentProp: PropertyShape;
  form: UseFormReturn;
  billingStore?: BillingEntityTypes;
}

/**
 * This component renders a form section that has dependencies on related entities.
 *
 * @param {PropertyShape} dependentProp The dependent property's SHACL restrictions.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {BillingEntityTypes} billingStore Optionally stores the type of account and pricing.
 */
export function DependentFormSection(
  props: Readonly<DependentFormSectionProps>
) {
  const dict: Dictionary = useDictionary();

  const isSectionOptional: boolean = props.dependentProp.minCount?.[VALUE_KEY] === "0";
  const label: string = props.dependentProp.name[VALUE_KEY];
  const queryEntityType: string = parseStringsForUrls(label); // Ensure that all spaces are replaced with _
  const formType: string = props.form.getValues(FORM_STATES.FORM_TYPE);
  const control: Control = props.form.control;
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [selectElements, setSelectElements] = useState<SelectOptionType[]>([]);
  const parentField: string = props.dependentProp.dependentOn?.[ID_KEY] ?? "";
  const [search, setSearch] = useState<string>("");
  const debouncedSearch: string = useDebounce<string>(search, 500);
  const { refreshFlag, triggerRefresh } = useRefresh(100);
  const previousParentOption = useRef<string | null>(null);

  const currentParentOption: string = useWatch<FieldValues>({
    control,
    name: parentField,
  });
  const currentOption: string = useWatch<FieldValues>({
    control,
    name: props.dependentProp.fieldId,
  });

  const {
    id,
    selectedEntityId,
    quickViewGroups,
    isQuickViewLoading,
    isQuickViewOpen,
    setIsQuickViewOpen,
  } = useFormQuickView(currentOption, queryEntityType);

  // Reset dependent field when parent changes (but not on initial load)
  useEffect(() => {
    if (
      parentField !== "" &&
      previousParentOption.current !== null &&
      previousParentOption.current !== currentParentOption
    ) {
      // Parent changed - reset the dependent field to null
      props.form.setValue(props.dependentProp.fieldId, "");
      setSearch("");
      // Trigger a refresh for field when parent field has changed
      triggerRefresh();
    }
    previousParentOption.current = currentParentOption;
  }, [currentParentOption, parentField, props.dependentProp.fieldId, props.form]);

  // A hook that fetches the list of dependent entities for the dropdown selector
  // If parent options are available, the list will be refetched on parent option change
  useEffect(() => {
    // Declare an async function to retrieve the list of dependent entities for the dropdown selector
    const getDependencies = async (
      entityType: string,
      field: PropertyShape,
      form: UseFormReturn
    ) => {
      setIsFetching(true);
      let entities: SelectOptionType[] = [];
      // If there is supposed to be a parent element, retrieve the data associated with the selected parent option
      if (field.dependentOn) {
        if (currentParentOption) {
          const responseEntity: AgentResponseBody = await queryInternalApi(
            makeInternalRegistryAPIwithParams(
              InternalApiIdentifierMap.INSTANCES,
              field.dependentOn.label,
              "false",
              getAfterDelimiter(currentParentOption, "/"),
              entityType,
              null,
              null,
              null,
              null,
              null,
              debouncedSearch ?? null
            )
          );
          entities = responseEntity.data?.items as SelectOptionType[] ?? [];
        };
        // If there is no valid parent option, there should be no entity
      } else if (
        (formType === FormTypeMap.VIEW || formType === FormTypeMap.DELETE) &&
        field.defaultValue
      ) {
        // Retrieve only one entity to reduce query times as users cannot edit anything in view or delete mode
        // Note that the default value can be a null if the field is optional
        const responseEntity: AgentResponseBody = await queryInternalApi(
          makeInternalRegistryAPIwithParams(
            InternalApiIdentifierMap.INSTANCES,
            entityType,
            "false",
            getAfterDelimiter(
              Array.isArray(field.defaultValue)
                ? field.defaultValue?.[0].value
                : field.defaultValue?.value,
              "/"
            )
          )
        );
        const results: Record<string, SparqlResponseField>[] = responseEntity.data?.items as Record<string, SparqlResponseField>[];
        entities = results?.length > 0 ? [{
          label: results[0].name.value,
          value: results[0].iri.value
        }] : [];
      } else {
        // If there is a search term, use it; otherwise, fetch initial results
        const responseEntity: AgentResponseBody = await queryInternalApi(
          makeInternalRegistryAPIwithParams(
            InternalApiIdentifierMap.INSTANCES,
            entityType,
            "false",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            debouncedSearch ?? null
          )
        );
        entities = (responseEntity.data?.items as SelectOptionType[]) ?? [];
      }

      const naOption: SelectOptionType = { value: "", label: dict.message.na }
      // By default, id is empty if optional, else its undefined
      const fieldValue = props.form.getValues(field.fieldId);
      let defaultId: string = fieldValue == "" ?
        isSectionOptional ? naOption.value : undefined :
        fieldValue;

      // Only update the id if there are any entities
      if (entities.length > 0) {
        let matchingExistingOptionValue: string = null;
        // Find best matching value if there is an existing or default value;
        // Existing value must take precedence
        if (fieldValue && fieldValue.length > 0) {
          matchingExistingOptionValue = findMatchingDropdownOptionValue(fieldValue, entities);
        } else if (props.dependentProp?.defaultValue) {
          const defaults: SparqlResponseField | SparqlResponseField[] =
            props.dependentProp?.defaultValue;
          // If this is not an array or the array's first item is not null
          if (!(Array.isArray(defaults) && defaults[0] == null)) {
            const defaultField: SparqlResponseField = Array.isArray(defaults)
              ? defaults[0]
              : defaults;
            matchingExistingOptionValue = findMatchingDropdownOptionValue(defaultField?.value, entities);
          }
        }

        // Check if a pre-existing or default option exists in the first 21 options
        // If not, retrieve and append the existing option to the list
        if (matchingExistingOptionValue == null) {
          const responseEntity: AgentResponseBody = await queryInternalApi(
            makeInternalRegistryAPIwithParams(
              InternalApiIdentifierMap.INSTANCES,
              entityType,
              "false",
              getAfterDelimiter(defaultId, "/")
            )
          );
          // Only append the existing option if it exists
          const results: Record<string, SparqlResponseField>[] = responseEntity.data?.items as Record<string, SparqlResponseField>[];
          if (results?.length > 0) {
            entities.push({
              label: results[0].name.value,
              value: results[0].iri.value
            });
          }
          // If it does exist, update default ID to the matching option value
        } else {
          defaultId = matchingExistingOptionValue;
        }
      }

      const defaultSearchOption: OntologyConcept = genDefaultSelectOption(dict);
      // Search form should always target default value
      if (formType === FormTypeMap.SEARCH) {
        defaultId = defaultSearchOption.type.value;
      }
      // Set the form value to the default value if available, else, default to the first option
      form.setValue(field.fieldId, defaultId);

      // Sort the fields by the labels
      entities.sort((a, b) => {
        return a.label.localeCompare(b.label);
      });
      // Add the default search option only if this is the search form
      if (formType === FormTypeMap.SEARCH) {
        // Default option should only use empty string "" as the value
        entities.unshift({
          label: defaultSearchOption.label.value,
          value: defaultSearchOption.type.value,
        });
        // Add the NA option at the start if this section can be optional
      } else if (isSectionOptional) {
        entities.unshift(naOption);
      }
      // Update select options
      setSelectElements(entities);
      // Rerender the form selector component to select existing values
      // DO NOT rerender if user only wishes to search
      if (debouncedSearch == "") {
        triggerRefresh();
      }
      setIsFetching(false);
    };

    if (parentField !== "" || currentParentOption !== null) {
      getDependencies(queryEntityType, props.dependentProp, props.form);
    }
  }, [currentParentOption, debouncedSearch]);

  return (
    <div className="rounded-lg my-4">
      <div className="flex flex-col w-full gap-2">
        <DependentFormSelector
          selectOptions={selectElements}
          field={props.dependentProp}
          form={props.form}
          noOptionMessage={dict.message.noInstances}
          options={{
            disabled:
              formType == FormTypeMap.VIEW ||
              formType == FormTypeMap.DELETE ||
              currentParentOption === "",
            labelStyle: ["flex flex-row items-center",
              fieldStyles["form-input-label"],
            ],
          }}
          isLoading={isFetching}
          refresh={refreshFlag}
          onSearchChange={setSearch}
        />
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

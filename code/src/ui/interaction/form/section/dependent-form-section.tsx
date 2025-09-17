import fieldStyles from "../field/field.module.css";

import { useEffect, useState } from "react";
import { Control, FieldValues, UseFormReturn, useWatch } from "react-hook-form";

import { useDictionary } from "hooks/useDictionary";
import { AgentResponseBody } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import {
  defaultSearchOption,
  ID_KEY,
  PropertyShape,
  RegistryFieldValues,
  SparqlResponseField,
  VALUE_KEY,
} from "types/form";
import LoadingSpinner from "ui/graphic/loader/spinner";
import { SelectOption } from "ui/interaction/dropdown/simple-selector";
import {
  extractResponseField,
  getAfterDelimiter,
  parseStringsForUrls,
} from "utils/client-utils";
import { makeInternalRegistryAPIwithParams } from "utils/internal-api-services";
import FormSelector from "../field/input/form-selector";
import { findMatchingDropdownOptionValue, FORM_STATES } from "../form-utils";

import { useFormQuickView } from "hooks/form/useFormQuickView";
import FormQuickViewBody from "ui/interaction/accordion/form-quick-view-body";
import FormQuickViewHeader from "ui/interaction/accordion/form-quick-view-header";

interface DependentFormSectionProps {
  dependentProp: PropertyShape;
  form: UseFormReturn;
}

/**
 * This component renders a form section that has dependencies on related entities.
 *
 * @param {PropertyShape} dependentProp The dependent property's SHACL restrictions.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 */
export function DependentFormSection(
  props: Readonly<DependentFormSectionProps>
) {
  const dict: Dictionary = useDictionary();


  const label: string = props.dependentProp.name[VALUE_KEY];
  const queryEntityType: string = parseStringsForUrls(label); // Ensure that all spaces are replaced with _
  const formType: string = props.form.getValues(FORM_STATES.FORM_TYPE);
  const control: Control = props.form.control;
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [selectElements, setSelectElements] = useState<SelectOption[]>([]);
  const parentField: string = props.dependentProp.dependentOn?.[ID_KEY] ?? "";

  const currentParentOption: string = useWatch<FieldValues>({
    control,
    name: parentField,
  });
  const currentOption: string = useWatch<FieldValues>({
    control,
    name: props.dependentProp.fieldId,
  });

  const { id, selectedEntityId, quickViewGroups, isQuickViewLoading, isQuickViewOpen, setIsQuickViewOpen } = useFormQuickView(currentOption, queryEntityType);

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
      let entities: RegistryFieldValues[] = [];
      // If there is supposed to be a parent element, retrieve the data associated with the selected parent option
      if (field.dependentOn) {
        if (currentParentOption) {
          entities = await fetch(
            makeInternalRegistryAPIwithParams(
              "instances",
              field.dependentOn.label,
              "false",
              getAfterDelimiter(currentParentOption, "/"),
              entityType
            ),
            { cache: "no-store", credentials: "same-origin" }
          ).then(async (res) => {
            const responseEntity: AgentResponseBody = await res.json();
            return (responseEntity.data?.items as RegistryFieldValues[]) ?? [];
          });
        }
        // If there is no valid parent option, there should be no entity
      } else if (
        (formType === "view" || formType === "delete") &&
        field.defaultValue
      ) {
        // Retrieve only one entity to reduce query times as users cannot edit anything in view or delete mode
        // Note that the default value can be a null if the field is optional
        entities = await fetch(
          makeInternalRegistryAPIwithParams(
            "instances",
            entityType,
            "false",
            getAfterDelimiter(
              Array.isArray(field.defaultValue)
                ? field.defaultValue?.[0].value
                : field.defaultValue?.value,
              "/"
            )
          ),
          { cache: "no-store", credentials: "same-origin" }
        ).then(async (response) => {
          const responseEntity: AgentResponseBody = await response.json();
          return (responseEntity.data?.items as RegistryFieldValues[]) ?? [];
        });
      } else {
        entities = await fetch(
          makeInternalRegistryAPIwithParams("instances", entityType),
          { cache: "no-store", credentials: "same-origin" }
        ).then(async (res) => {
          const responseEntity: AgentResponseBody = await res.json();
          return (responseEntity.data?.items as RegistryFieldValues[]) ?? [];
        });
      }

      // By default, id is empty
      let defaultId: string = "";
      // Only update the id if there are any entities
      if (entities.length > 0) {
        if (props.dependentProp?.minCount?.[VALUE_KEY] != "0") {
          // Set the id to the first possible option when this is not optional
          // Optional fields should default to empty string
          defaultId = extractResponseField(entities[0], FORM_STATES.IRI)?.value;
        }
        const fieldValue = props.form.getValues(field.fieldId);
        // Find best matching value if there is an existing or default value;
        // Existing value must take precedence
        if (fieldValue && fieldValue.length > 0) {
          const defaultValueId: string = getAfterDelimiter(fieldValue, "/");
          const result: string = findMatchingDropdownOptionValue(
            defaultValueId,
            entities
          );
          if (result != null) {
            defaultId = result;
          }
        } else if (props.dependentProp?.defaultValue) {
          const defaults: SparqlResponseField | SparqlResponseField[] =
            props.dependentProp?.defaultValue;
          // If this is not an array or the array's first item is not null
          if (!(Array.isArray(defaults) && defaults[0] == null)) {
            const defaultField: SparqlResponseField = Array.isArray(defaults)
              ? defaults[0]
              : defaults;
            const defaultValueId: string = getAfterDelimiter(
              defaultField.value,
              "/"
            );
            const result: string = findMatchingDropdownOptionValue(
              defaultValueId,
              entities
            );
            if (result != null) {
              defaultId = result;
            }
          }
        }
      }
      // Search form should always target default value
      if (props.form.getValues(FORM_STATES.FORM_TYPE) === "search") {
        defaultId = defaultSearchOption.type.value;
      }
      // Set the form value to the default value if available, else, default to the first option
      form.setValue(field.fieldId, defaultId);

      const formFields: SelectOption[] = [];

      // Retrieve and set the display field accordingly
      if (entities.length > 0) {
        const fields: string[] = Object.keys(entities[0]);
        let displayField: string;
        if (fields.includes("name")) {
          displayField = "name";
        } else if (fields.includes("street")) {
          displayField = "street";
        } else {
          displayField = Object.keys(fields).find(
            (key) => key != "id" && key != "iri"
          );
        }
        entities.forEach((entity) => {
          const formOption: SelectOption = {
            value: extractResponseField(entity, FORM_STATES.IRI)?.value,
            label: extractResponseField(entity, displayField)?.value,
          };
          formFields.push(formOption);
        });
      }
      // Sort the fields by the labels
      formFields.sort((a, b) => {
        return a.label.localeCompare(b.label);
      });
      // Add the default search option only if this is the search form
      if (props.form.getValues(FORM_STATES.FORM_TYPE) === "search") {
        // Default option should only use empty string "" as the value
        formFields.unshift({
          label: defaultSearchOption.label.value,
          value: defaultSearchOption.type.value,
        });
      }
      // Update select options
      setSelectElements(formFields);
      setIsFetching(false);
    };

    if (parentField !== "" || currentParentOption !== null) {
      getDependencies(queryEntityType, props.dependentProp, props.form);
    }
  }, [currentParentOption]);



  // The div should only be displayed if it either does not have parent elements (no dependentOn property) or
  // the parent element has been queried and selected
  if (
    !props.dependentProp.dependentOn ||
    (currentParentOption && parentField != "")
  ) {
    return (
      <div className="rounded-lg my-4">
        {isFetching && (
          <div className="mr-2">
            <LoadingSpinner isSmall={true} />
          </div>
        )}
        {!isFetching && (
          <div className="flex flex-col w-full gap-2">
            <FormSelector
              selectOptions={selectElements}
              field={props.dependentProp}
              form={props.form}
              noOptionMessage={dict.message.noInstances}
              options={{
                disabled: formType == "view" || formType == "delete",
                labelStyle: [
                  fieldStyles["form-input-label-add"],
                  fieldStyles["form-input-label"],
                ],
              }}
            />
            <FormQuickViewHeader
              id={id}
              title={dict.title.quickView}
              selectedEntityId={selectedEntityId}
              entityType={queryEntityType}
              isFormView={formType == "view"}
              isOpen={isQuickViewOpen}
              setIsOpen={setIsQuickViewOpen}
            />
            {currentOption && isQuickViewOpen && (isQuickViewLoading ?
              <div className="flex justify-center p-4">
                <LoadingSpinner isSmall={true} />
              </div>
              : <FormQuickViewBody
                id={id}
                quickViewGroups={quickViewGroups}
              />
            )}
          </div>
        )}
      </div>
    );
  }
}

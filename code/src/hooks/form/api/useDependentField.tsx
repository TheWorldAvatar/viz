import { useDictionary } from "hooks/useDictionary";
import { useEffect, useRef, useState } from "react";
import { Control, FieldValues, UseFormReturn, useWatch } from "react-hook-form";
import { browserStorageManager } from "state/browser-storage-manager";

import { AgentResponseBody, InternalApiIdentifierMap } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import { FormTypeMap, ID_KEY, OntologyConcept, PropertyShape, SparqlResponseField, VALUE_KEY } from "types/form";
import { SelectOptionType } from "ui/interaction/dropdown/simple-selector";
import { findMatchingDropdownOptionValue, FORM_STATES, genDefaultSelectOption } from "ui/interaction/form/form-utils";
import { getAfterDelimiter, parseStringsForUrls } from "utils/client-utils";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";

interface UseDependentFieldDescriptor {
    selectedOption: SelectOptionType,
    currentParentOption: string;
    getFieldOptions: (_inputValue: string) => Promise<SelectOptionType[]>;
}

/**
 * A custom hook to retrieve and support dependent field functionality.
 *
 * @param {PropertyShape} field The field's SHACL restrictions.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {boolean} isArray Whether the field is an array.
 */
export function useDependentField(
    field: PropertyShape,
    form: UseFormReturn,
    isArray: boolean,
): UseDependentFieldDescriptor {
    const dict: Dictionary = useDictionary();
    const naOption: SelectOptionType = { value: "", label: dict.message.na };

    const isSectionOptional: boolean = field.minCount?.[VALUE_KEY] === "0";
    const parentField: string = field?.dependentOn?.[ID_KEY] ?? "";
    const label: string = field.name[VALUE_KEY];
    const entityType: string = parseStringsForUrls(label);
    const control: Control = form.control;
    const formType: string = form.getValues(FORM_STATES.FORM_TYPE);

    const [selectedOption, setSelectedOption] = useState<SelectOptionType>(null);

    const previousParentOption = useRef<string | null>(null);
    const currentParentOption: string = useWatch<FieldValues>({
        control,
        name: parentField,
    });

    // An async method to retrieve the dependent entities options from the backend
    const getFieldOptions = async (inputValue: string): Promise<SelectOptionType[]> => {
        // Add a debouncer so that any parent field changes are propagated such as resetting the form; if not, old values persists
        return new Promise((resolve) => {
            setTimeout(async () => {
                const currentOption: string = form.getValues(field?.fieldId);
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
                                inputValue
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
                            inputValue,
                        )
                    );
                    entities = (responseEntity.data?.items as SelectOptionType[]) ?? [];
                }

                // By default, id is empty if optional, else its undefined
                const storedValue: string = isArray ? undefined : browserStorageManager.get(label);
                let defaultId: string = storedValue ?? currentOption == "" ?
                    isSectionOptional ? naOption.value : undefined :
                    currentOption;

                // Only update the id if there are any entities
                if (entities.length > 0) {
                    let matchingExistingOptionValue: string = null;
                    // Find best matching value if there is an existing or default value;
                    // Existing value must take precedence
                    if (storedValue || (currentOption && currentOption.length > 0)) {
                        // Always prefer stored value over current option
                        matchingExistingOptionValue = findMatchingDropdownOptionValue(storedValue ?? currentOption, entities);
                    } else if (field?.defaultValue) {
                        const defaults: SparqlResponseField | SparqlResponseField[] =
                            field?.defaultValue;
                        // If this is not an array or the array's first item is not null
                        if (!(Array.isArray(defaults) && defaults[0] == null)) {
                            const defaultField: SparqlResponseField = Array.isArray(defaults)
                                ? defaults[0]
                                : defaults;
                            matchingExistingOptionValue = findMatchingDropdownOptionValue(defaultField?.value, entities);
                        }
                    }

                    // If a pre-existing or default option match does exist in the first 21 options, update default ID to the matching option value
                    if (matchingExistingOptionValue != null) {
                        defaultId = matchingExistingOptionValue;
                        // If there is no match and no default ID, retrieve and append the existing option to the list
                    } else if (matchingExistingOptionValue == null && defaultId != undefined) {
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
                                label: results[0].name?.value,
                                value: results[0].iri?.value
                            });
                        }
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
                return resolve(entities);
            }, 100);
        });
    };
    useEffect(() => {
        // Update the current option if there is none on first render; 
        // Note that when loading saved data from session storage, parent option takes time to change 
        // and this value should be repopulated after the parent option has been selected
        const updateCurrentOption = async () => {
            const options: SelectOptionType[] = await getFieldOptions("");
            if (options?.length > 0) {
                const storedValue: string = isArray ? undefined : browserStorageManager.get(label);
                const valueChecker: string = storedValue ?? form.getValues(field?.fieldId);
                const initialOption: SelectOptionType = options.find(option => option?.value == valueChecker);
                setSelectedOption(initialOption);
            }
        };

        if (selectedOption == null) {
            updateCurrentOption();
        }
    }, [currentParentOption]);

    // Reset dependent child field when parent changes (but not on initial load)
    // Note that this should be combined with a debouncer as react hook form changes are not propagated immediately
    useEffect(() => {
        if (
            parentField !== "" &&
            !!previousParentOption.current &&
            previousParentOption.current !== currentParentOption
        ) {
            // Parent changed - reset the dependent field to null
            // Only reset if this is not the initial load (previousParentOption.current !== null)
            // This prevents clearing stored values when the form first loads
            form.setValue(field?.fieldId, undefined);
            // Reset field for arrays
            if (isArray) {
                form.setValue(field?.group["@id"], undefined);
            }
            setSelectedOption(isSectionOptional ? naOption : null);
        }
        previousParentOption.current = currentParentOption;
    }, [currentParentOption, parentField]);

    return { selectedOption, currentParentOption, getFieldOptions };
}
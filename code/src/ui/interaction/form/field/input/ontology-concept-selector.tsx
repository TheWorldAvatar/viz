import { useEffect, useMemo, useRef, useState } from "react";
import { Control, Controller, FieldError, FieldValues, UseFormReturn, useWatch } from "react-hook-form";
import { GroupBase, OptionsOrGroups } from "react-select";

import useFormSession from "hooks/form/useFormSession";
import { useDictionary } from "hooks/useDictionary";
import { browserStorageManager } from "state/browser-storage-manager";
import { AgentResponseBody, InternalApiIdentifierMap } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import {
  FormFieldOptions,
  FormTypeMap,
  ID_KEY,
  ONTOLOGY_CONCEPT_ROOT,
  OntologyConcept,
  OntologyConceptMappings,
  PropertyShape,
  VALUE_KEY,
} from "types/form";
import LoadingSpinner from "ui/graphic/loader/spinner";
import SimpleSelector, { SelectOptionType } from "ui/interaction/dropdown/simple-selector";
import {
  genDefaultSelectOption,
  getMatchingConcept,
  getRegisterOptions,
  parseConcepts
} from "ui/interaction/form/form-utils";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";
import FormInputContainer from "../form-input-container";

interface OntologyConceptSelectorProps {
  field: PropertyShape;
  form: UseFormReturn;
  options?: FormFieldOptions;
}

/**
 * This component renders a dropdown selector for the form.
 *
 * @param {PropertyShape} field The field name that will be assigned to the form state.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {FormFieldOptions} options Configuration options for the field.
 */
export default function OntologyConceptSelector(
  props: Readonly<OntologyConceptSelectorProps>
) {
  const dict: Dictionary = useDictionary();
  const control: Control = props.form.control;
  const currentOption: string = useWatch<FieldValues>({
    control,
    name: props.field.fieldId,
  });
  const { formType } = useFormSession();

  const registerOptions = getRegisterOptions(props.field, formType, dict);
  const effectRan = useRef(false);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [conceptMappings, setConceptMappings] = useState<OntologyConceptMappings>({});
  const [options, setOptions] = useState<
    OptionsOrGroups<SelectOptionType, GroupBase<SelectOptionType>>
  >([]);

  // Retrieve the matching concept from the mappings
  const selectedOption: OntologyConcept = useMemo(() => {
    return getMatchingConcept(conceptMappings, currentOption);
  }, [conceptMappings, currentOption]);

  // A hook that fetches all concepts for select input on first render
  useEffect(() => {
    // Declare an async function that retrieves all entity concepts for specific attributes
    const getEntityConcepts = async (): Promise<void> => {
      setIsFetching(true);
      try {
        // Extract all the concept types and extract all the types from the endpoint
        const conceptTypes: string[] = props.field.in.map(
          (subClass) => subClass[ID_KEY]
        );
        const conceptsArrays: OntologyConcept[][] = await Promise.all(
          conceptTypes.map(async (conceptType) => {
            const resBody: AgentResponseBody = await queryInternalApi(makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.CONCEPT, conceptType));
            if (resBody.error) {
              throw new Error(
                `Failed to fetch available types for ${conceptType}`
              );
            }
            return resBody.data?.items as OntologyConcept[];
          }
          )
        );
        const concepts: OntologyConcept[] = conceptsArrays.flat();
        if (concepts && concepts.length > 0) {
          let firstOption: string = props.form.getValues(props.field.fieldId);

          // Add the default search option only if this is the search form
          if (formType === FormTypeMap.SEARCH) {
            const defaultSearchOption: OntologyConcept = genDefaultSelectOption(dict);
            firstOption = defaultSearchOption.label.value;
            concepts.unshift(defaultSearchOption);
          }
          const sortedConceptMappings: OntologyConceptMappings = parseConcepts(
            concepts,
            firstOption
          );
          setConceptMappings(sortedConceptMappings);

          // Only auto-select default values if there's no existing value (e.g., from storage)
          const storedValue: string = browserStorageManager.get(props.field.name[VALUE_KEY]);

          // Only set a default value if there's no existing value (preserve stored values)
          if (!storedValue) {

            // First option should be set if available, else the first parent value should be prioritised
            const firstRootOption: OntologyConcept = sortedConceptMappings[ONTOLOGY_CONCEPT_ROOT][0];

            let value: string;
            // For add forms, default to default value if available, else, return undefined
            if (props.field.defaultValue) {
              value = Array.isArray(props.field.defaultValue) ? props.field.defaultValue?.[0].value : props.field.defaultValue?.value;
              // For every other form type, extract the parent option if available
            } else if (sortedConceptMappings[firstRootOption?.type.value]) {
              value = sortedConceptMappings[firstRootOption.type.value][0]?.type?.value;
              // else, default to base
            } else if (props.field.minCount?.[VALUE_KEY] == "0") {
              value = "";
            } else {
              value = firstRootOption?.type?.value;
            }
            props.form.setValue(props.field.fieldId, value);
          } else {
            props.form.setValue(props.field.fieldId, storedValue);
          }

          // Parse the mappings to generate the format for select options
          const formOptions: SelectOptionType[] = [];
          const formGroups: GroupBase<SelectOptionType>[] = [];

          sortedConceptMappings[ONTOLOGY_CONCEPT_ROOT].forEach((option) => {
            const parentKey: string = option.type.value;
            // If there are children options, return the opt group with the children options
            if (sortedConceptMappings[parentKey]) {
              const formChildrenOptions: SelectOptionType[] = [];

              sortedConceptMappings[parentKey].forEach((childOption) => {
                const formOption: SelectOptionType = {
                  value: childOption.type.value,
                  label: childOption.label.value,
                };
                formChildrenOptions.push(formOption);
              });
              const groupOption: GroupBase<SelectOptionType> = {
                label: option.label.value + " ↓",
                options: formChildrenOptions,
              };
              formGroups.push(groupOption);
            } else {
              const formOption: SelectOptionType = {
                value: option.type.value,
                label: option.label.value,
              };
              formOptions.push(formOption);
            }
          });
          setOptions([...formOptions, ...formGroups]);
        }
      } catch (error) {
        console.error("Error fetching concepts:", error);
      } finally {
        setIsFetching(false);
      }
    };

    if (!effectRan.current) {
      getEntityConcepts();
    }
    // Control flow of data fetching on first and remount to ensure only one fetch request is executed in development mode
    // Read this for more details: https://stackoverflow.com/a/74609594
    return () => {
      effectRan.current = true;
    };
  }, []);

  if (isFetching) {
    return <LoadingSpinner isSmall={true} />;
  }
  if (conceptMappings[ONTOLOGY_CONCEPT_ROOT] && options.length > 0) {
    return (
      <FormInputContainer
        field={props.field}
        error={props.form.formState.errors[props.field.fieldId] as FieldError}
        labelStyles={props.options?.labelStyle}
        selectedOption={selectedOption}
      >
        <Controller
          name={props.field.fieldId}
          control={props.form.control}
          defaultValue={props.form.getValues(props.field.fieldId)}
          rules={registerOptions}
          render={({ field: { value, onChange } }) => {
            return (
              <SimpleSelector
                options={options}
                defaultVal={value}
                onChange={(selectedOption) => {
                  onChange((selectedOption as SelectOptionType).value);
                }}
                isDisabled={props.options?.disabled}
                reqNotApplicableOption={props.field.minCount?.[VALUE_KEY] === "0"}
                ariaLabel={props.field.name[VALUE_KEY]}
              />
            );
          }}
        />
      </FormInputContainer>
    );
  }
}

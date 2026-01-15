import { useEffect, useMemo, useRef, useState } from "react";
import { Control, FieldValues, UseFormReturn, useWatch } from "react-hook-form";
import { GroupBase, OptionsOrGroups } from "react-select";

import { useDictionary } from "hooks/useDictionary";
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
} from "types/form";
import LoadingSpinner from "ui/graphic/loader/spinner";
import { SelectOptionType } from "ui/interaction/dropdown/simple-selector";
import {
  FORM_STATES,
  genDefaultSelectOption,
  getMatchingConcept,
  parseConcepts,
} from "ui/interaction/form/form-utils";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";
import OntologyFormSelector from "./ontology-form-selector";

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

  const effectRan = useRef(false);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [conceptMappings, setConceptMappings] =
    useState<OntologyConceptMappings>({});
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
          if (props.form.getValues(FORM_STATES.FORM_TYPE) === FormTypeMap.SEARCH) {
            const defaultSearchOption: OntologyConcept = genDefaultSelectOption(dict);
            firstOption = defaultSearchOption.label.value;
            concepts.unshift(defaultSearchOption);
          }
          const sortedConceptMappings: OntologyConceptMappings = parseConcepts(
            concepts,
            firstOption
          );
          setConceptMappings(sortedConceptMappings);

          // Only auto-select default values for non-add forms to force explicit user selection in add forms
          const currentFormType: string = props.form.getValues(
            FORM_STATES.FORM_TYPE
          );
          // First option should be set if available, else the first parent value should be prioritised
          const firstRootOption: OntologyConcept =
            sortedConceptMappings[ONTOLOGY_CONCEPT_ROOT][0];
          props.form.setValue(
            props.field.fieldId,
            currentFormType === FormTypeMap.ADD
              // For add forms, default to default value if available, else, return undefined
              ? Array.isArray(props.field.defaultValue) ? props.field.defaultValue?.[0].value : props.field.defaultValue?.value
              // For every other form type, extract the parent option if available, else, default to base
              : sortedConceptMappings[firstRootOption?.type.value]
                ? sortedConceptMappings[firstRootOption.type.value][0]?.type
                  ?.value
                : firstRootOption?.type?.value
          );

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
      <OntologyFormSelector
        selectOptions={options}
        field={props.field}
        form={props.form}
        selectedOption={selectedOption}
        options={props.options}
      />
    );
  }
}

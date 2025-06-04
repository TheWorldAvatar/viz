import { useEffect, useMemo, useRef, useState } from 'react';
import { Control, FieldValues, UseFormReturn, useWatch } from 'react-hook-form';
import { GroupBase, OptionsOrGroups } from 'react-select';

import { defaultSearchOption, FormFieldOptions, ID_KEY, ONTOLOGY_CONCEPT_ROOT, OntologyConcept, OntologyConceptMappings, PropertyShape, SEARCH_FORM_TYPE, VALUE_KEY } from 'types/form';
import LoadingSpinner from 'ui/graphic/loader/spinner';
import { SelectOption } from 'ui/interaction/dropdown/simple-selector';
import { FORM_STATES, getMatchingConcept, parseConcepts } from 'ui/interaction/form/form-utils';
import FormSelector from './form-selector';

interface OntologyConceptSelectorProps {
  agentApi: string;
  field: PropertyShape;
  form: UseFormReturn;
  options?: FormFieldOptions;
}

/**
 * This component renders a dropdown selector for the form.
 * 
 * @param {string} agentApi The target agent endpoint for any registry related functionalities.
 * @param {PropertyShape} field The field name that will be assigned to the form state.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {FormFieldOptions} options Configuration options for the field.
 */
export default function OntologyConceptSelector(props: Readonly<OntologyConceptSelectorProps>) {
  const control: Control = props.form.control;
  const currentOption: string = useWatch<FieldValues>({
    control,
    name: props.field.fieldId,
  });

  const effectRan = useRef(false);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [conceptMappings, setConceptMappings] = useState<OntologyConceptMappings>({});
  const [options, setOptions] = useState<OptionsOrGroups<SelectOption, GroupBase<SelectOption>>>([]);

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
        const conceptTypes: string[] = props.field.in.map(subClass => subClass[ID_KEY])
        const conceptsArrays: OntologyConcept[][] = await Promise.all(
          conceptTypes.map(conceptType => fetch(`/api/registry/available-types?uri=${encodeURIComponent(conceptType)}`)
            .then(response => {
              if (!response.ok) {
                throw new Error(`Failed to fetch available types for ${conceptType}`);
              }
              return response.json();
            })
          )
        );
        const concepts: OntologyConcept[] = conceptsArrays.flat();
        if (concepts && concepts.length > 0) {
          let firstOption: string = props.form.getValues(props.field.fieldId);
          // WIP: Set default value Singapore for any Country Field temporarily
          // Default values should not be hardcoded here but retrieved in a config instead
          if (props.field.name[VALUE_KEY].toLowerCase() === "country" && !firstOption) {
            firstOption = "Singapore";
          }
          // Add the default search option only if this is the search form
          if (props.form.getValues(FORM_STATES.FORM_TYPE) === SEARCH_FORM_TYPE) {
            firstOption = defaultSearchOption.label.value;
            concepts.unshift(defaultSearchOption);
          }
          const sortedConceptMappings: OntologyConceptMappings = parseConcepts(concepts, firstOption);
          setConceptMappings(sortedConceptMappings);
          // First option should be set if available, else the first parent value should be prioritised
          const firstRootOption: OntologyConcept = sortedConceptMappings[ONTOLOGY_CONCEPT_ROOT][0];
          props.form.setValue(props.field.fieldId,
            sortedConceptMappings[firstRootOption?.type.value] ? sortedConceptMappings[firstRootOption.type.value][0]?.type?.value
              : firstRootOption?.type?.value);

          // Parse the mappings to generate the format for select options
          const formOptions: SelectOption[] = [];
          const formGroups: GroupBase<SelectOption>[] = [];

          sortedConceptMappings[ONTOLOGY_CONCEPT_ROOT].forEach((option) => {
            const parentKey: string = option.type.value;
            // If there are children options, return the opt group with the children options
            if (sortedConceptMappings[parentKey]) {
              const formChildrenOptions: SelectOption[] = [];

              sortedConceptMappings[parentKey].forEach(childOption => {
                const formOption: SelectOption = {
                  value: childOption.type.value,
                  label: childOption.label.value,
                };
                formChildrenOptions.push(formOption);
              });
              const groupOption: GroupBase<SelectOption> = {
                label: option.label.value + " ↓",
                options: formChildrenOptions,
              };
              formGroups.push(groupOption);

            } else {
              const formOption: SelectOption = {
                value: option.type.value,
                label: option.label.value,
              };
              formOptions.push(formOption);
            }
          });
          setOptions([...formOptions, ...formGroups]);
        }
      }
      catch (error) {
        console.error("Error fetching concepts:", error);
      } finally {
        setIsFetching(false);
      }
    }

    if (!effectRan.current) {
      getEntityConcepts();
    }
    // Control flow of data fetching on first and remount to ensure only one fetch request is executed in development mode
    // Read this for more details: https://stackoverflow.com/a/74609594
    return () => { effectRan.current = true };
  }, []);

  if (isFetching) {
    return <LoadingSpinner isSmall={true} />
  }
  if (conceptMappings[ONTOLOGY_CONCEPT_ROOT] && options.length > 0) {
    return (
      <FormSelector
        selectOptions={options}
        field={props.field}
        form={props.form}
        selectedOption={selectedOption}
        options={props.options}
      />
    );
  }
}
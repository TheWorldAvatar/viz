import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Control, Controller, FieldError, FieldValues, UseFormReturn, useWatch } from 'react-hook-form';
import Select, { GroupBase, OptionsOrGroups } from 'react-select';

import { defaultSearchOption, FormOptionType, ID_KEY, ONTOLOGY_CONCEPT_ROOT, OntologyConcept, OntologyConceptMappings, PropertyShape, SEARCH_FORM_TYPE, VALUE_KEY } from 'types/form';
import { selectorStyles } from 'ui/css/selector-style';
import { FORM_STATES, getMatchingConcept, parseConcepts } from 'ui/interaction/form/form-utils';
import { getAvailableTypes } from 'utils/server-actions';
import FormInputContainer from '../form-input-container';

interface FormSelectorProps {
  agentApi: string;
  field: PropertyShape;
  form: UseFormReturn;
  setIsFetching: React.Dispatch<React.SetStateAction<boolean>>;
  styles?: {
    label?: string[],
  };
  options?: {
    disabled?: boolean;
  };
}

/**
 * This component renders a dropdown selector for the form.
 * 
 * @param {string} agentApi The target agent endpoint for any registry related functionalities.
 * @param {PropertyShape} field The field name that will be assigned to the form state.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {string[]} styles.label Optional styles for the label element.
 */
export default function FormSelector(props: Readonly<FormSelectorProps>) {
  const control: Control = props.form.control;
  const currentOption: string = useWatch<FieldValues>({
    control,
    name: props.field.fieldId,
  });

  const effectRan = useRef(false);
  const [conceptMappings, setConceptMappings] = useState<OntologyConceptMappings>({});
  const [options, setOptions] = useState<OptionsOrGroups<FormOptionType, GroupBase<FormOptionType>>>([]);
  const [flattenedOptions, setFlattenedOptions] = useState<FormOptionType[]>([]);

  // Retrieve the matching concept from the mappings
  const selectedOption: OntologyConcept = useMemo(() => {
    return getMatchingConcept(conceptMappings, currentOption);
  }, [conceptMappings, currentOption]);

  // A hook that fetches all concepts for select input on first render
  useEffect(() => {
    // Declare an async function that retrieves all entity concepts for specific attributes
    const getEntityConcepts = async (): Promise<void> => {
      props.setIsFetching(true);
      try {
        // Extract all the concept types and extract all the types from the endpoint
        const conceptTypes: string[] = props.field.in.map(subClass => subClass[ID_KEY])
        const conceptsArrays: OntologyConcept[][] = await Promise.all(
          conceptTypes.map(conceptType => getAvailableTypes(props.agentApi, encodeURIComponent(conceptType)))
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
          const formOptions: FormOptionType[] = [];
          const formGroups: GroupBase<FormOptionType>[] = [];
          const flattenedFormOptions: FormOptionType[] = [];

          sortedConceptMappings[ONTOLOGY_CONCEPT_ROOT].forEach((option) => {
            const parentKey: string = option.type.value;
            // If there are children options, return the opt group with the children options
            if (sortedConceptMappings[parentKey]) {
              const formChildrenOptions: FormOptionType[] = [];

              sortedConceptMappings[parentKey].forEach(childOption => {
                const formOption: FormOptionType = {
                  value: childOption.type.value,
                  label: childOption.label.value,
                };
                flattenedFormOptions.push(formOption);
                formChildrenOptions.push(formOption);
              });
              const groupOption: GroupBase<FormOptionType> = {
                label: option.label.value + " ↓",
                options: formChildrenOptions,
              };
              formGroups.push(groupOption);

            } else {
              const formOption: FormOptionType = {
                value: option.type.value,
                label: option.label.value,
              };
              flattenedFormOptions.push(formOption);
              formOptions.push(formOption);
            }
          });
          setOptions([...formOptions, ...formGroups]);
          setFlattenedOptions(flattenedFormOptions);
        }
      }
      catch (error) {
        console.error("Error fetching concepts:", error);
      } finally {
        props.setIsFetching(false);
      }
    }

    if (!effectRan.current) {
      getEntityConcepts();
    }
    // Control flow of data fetching on first and remount to ensure only one fetch request is executed in development mode
    // Read this for more details: https://stackoverflow.com/a/74609594
    return () => { effectRan.current = true };
  }, []);

  if (conceptMappings[ONTOLOGY_CONCEPT_ROOT] && options.length > 0) {
    return (
      <FormInputContainer
        field={props.field}
        error={props.form.formState.errors[props.field.fieldId] as FieldError}
        labelStyles={props.styles?.label}
        selectedOption={selectedOption}
      >
        <Controller
          name={props.field.fieldId}
          control={props.form.control}
          defaultValue={props.form.getValues(props.field.fieldId)}
          render={({ field: { value, onChange } }) => (
            <Select
              styles={selectorStyles}
              unstyled
              options={options}
              value={flattenedOptions.find(option => option.value === value)}
              onChange={(selectedOption) => onChange((selectedOption as FormOptionType).value)}
              isLoading={false}
              isMulti={false}
              isSearchable={true}
              isDisabled={props.options?.disabled}
            />
          )}
        />
      </FormInputContainer>
    );
  }
}
import fieldStyles from '../field/field.module.css';
import styles from '../form.module.css';

import { useCallback, useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import Select from 'react-select';

import { Routes } from 'io/config/routes';
import { FormOptionType, NodeShape, PropertyShapeOrGroup, VALUE_KEY } from 'types/form';
import { selectorStyles } from 'ui/css/selector-style';
import { parseWordsForLabels } from 'utils/client-utils';
import { renderFormField } from '../form';
import { FORM_STATES, parsePropertyShapeOrGroupList } from '../form-utils';

interface OptionBasedFormSectionProps {
  entityType: string;
  agentApi: string;
  node: NodeShape[];
  form: UseFormReturn;
}
/**
 * This component renders a form section that displays different form fields based on the selected option in a separate selector.
 * 
 * @param {string} entityType The type of entity.
 * @param {string} agentApi The target agent endpoint for any registry related functionalities.
 * @param {NodeShape[]} node A list containing the potential form field configurations available.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 */
export default function OptionBasedFormSection(props: Readonly<OptionBasedFormSectionProps>) {
  // Define the state to store the selected value
  const [selectedModel, setSelectedModel] = useState<NodeShape>(props.node[0]);
  const [selectedFields, setSelectedFields] = useState<PropertyShapeOrGroup[]>(parsePropertyShapeOrGroupList({}, props.node[0].property));

  // Declare a function to transform node shape to a form option
  const convertNodeShapeToFormOption = useCallback((nodeShape: NodeShape): FormOptionType => {
    return {
      label: parseWordsForLabels(nodeShape.label[VALUE_KEY]),
      value: nodeShape.label[VALUE_KEY],
    }
  }, []);

  const formOptions = useMemo(() => (props.node.map(nodeShape => convertNodeShapeToFormOption(nodeShape))
  ), []);
  // Handle change event for the select input
  const handleModelChange = (formOption: FormOptionType) => {
    const matchingNode: NodeShape = props.node.find(nodeShape => nodeShape.label[VALUE_KEY] === formOption.value);
    setSelectedFields(parsePropertyShapeOrGroupList({}, matchingNode.property));
    setSelectedModel(matchingNode);
  };

  return (
    <>
      <div className={styles["section-selector-container"]}>
        <label className={fieldStyles["field-text"]} htmlFor="select-input">Select the best category for your request:</label>
        <Select
          styles={selectorStyles}
          unstyled
          options={formOptions}
          value={convertNodeShapeToFormOption(selectedModel)}
          onChange={(selectedOption) => handleModelChange(selectedOption as FormOptionType)}
          isLoading={false}
          isMulti={false}
          isSearchable={true}
          isDisabled={props.form.getValues(FORM_STATES.FORM_TYPE) == Routes.REGISTRY_DELETE || props.form.getValues(FORM_STATES.FORM_TYPE) == Routes.REGISTRY}
        />
        <p className={fieldStyles["info-text"]}>
          <b className={fieldStyles["field-text"]}>Description: </b>
          {selectedModel?.comment[VALUE_KEY]}
        </p>
      </div>
      {selectedFields.map((field, index) => {
        return renderFormField(props.entityType, props.agentApi, field, props.form, index);
      })}
    </>);
}
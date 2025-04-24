import fieldStyles from '../field/field.module.css';
import styles from '../form.module.css';

import { useCallback, useMemo, useState } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import Select from 'react-select';

import { Routes } from 'io/config/routes';
import { Dictionary } from 'types/dictionary';
import { FormOptionType, NodeShape, PROPERTY_GROUP_TYPE, PropertyGroup, PropertyShape, PropertyShapeOrGroup, TYPE_KEY, VALUE_KEY } from 'types/form';
import { selectorStyles } from 'ui/css/selector-style';
import { parseWordsForLabels } from 'utils/client-utils';
import { useDictionary } from 'hooks/useDictionary';
import { renderFormField } from '../form';
import { FORM_STATES, parsePropertyShapeOrGroupList } from '../form-utils';

interface OptionBasedFormSectionProps {
  entityType: string;
  agentApi: string;
  node: NodeShape[];
  form: UseFormReturn;
}
/**
 * This component renders a branch form section that displays different form fields based on the selected branch option
 * in a separate selector.
 * 
 * @param {string} entityType The type of entity.
 * @param {string} agentApi The target agent endpoint for any registry related functionalities.
 * @param {NodeShape[]} node A list containing the potential form field configurations available.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 */
export default function BranchFormSection(props: Readonly<OptionBasedFormSectionProps>) {
  // Declare a function to get the most suitablebranch node and set default values if present
  const getBranchNode = useCallback((nodeShapes: NodeShape[]): NodeShape => {
    // Iterate to find and store any default values in these node states
    const nodeStates: FieldValues[] = [];
    nodeShapes.forEach(shape => {
      const nodeState: FieldValues = {};
      parsePropertyShapeOrGroupList(nodeState, shape.property);
      nodeStates.push(nodeState);
    });
    // Find the best matched node states with non-empty values
    let nodeWithMostNonEmpty: NodeShape = nodeShapes[0];
    let nodeStateWithMostNonEmpty: FieldValues = nodeStates[0];
    let maxNonEmptyCount: number = 0;
    nodeStates.forEach((nodeState, index) => {
      let currentNonEmptyCount: number = 0;
      for (const nodeField in nodeState) {
        if (Object.hasOwn(nodeState, nodeField)) {
          const fieldVal = nodeState[nodeField];
          // Increment the counter when it is non-empty
          // Field arrays are stored as group.index.field in react-hook-form
          if (typeof fieldVal === "string" && fieldVal.length > 0 && fieldVal != "-0.01") {
            currentNonEmptyCount++;
          }
        }
      }
      // update the best match
      if (currentNonEmptyCount > maxNonEmptyCount) {
        nodeWithMostNonEmpty = props.node[index];
        nodeStateWithMostNonEmpty = nodeState;
        maxNonEmptyCount = currentNonEmptyCount;
      }
    });
    // For setting the branch value, attempt this
    Object.keys(nodeStateWithMostNonEmpty).forEach(nodeField => {
      props.form.setValue(nodeField, nodeStateWithMostNonEmpty[nodeField]);
    });
    return nodeWithMostNonEmpty;
  }, []);

  const dict: Dictionary = useDictionary();
  // Extract the initial node shape
  const initialNodeShape: NodeShape = useMemo(() => {
    return getBranchNode(props.node);
  }, []);

  // Define the state to store the selected value
  const [selectedModel, setSelectedModel] = useState<NodeShape>(initialNodeShape);
  const [selectedFields, setSelectedFields] = useState<PropertyShapeOrGroup[]>(parsePropertyShapeOrGroupList({}, initialNodeShape.property));

  // Declare a function to transform node shape to a form option
  const convertNodeShapeToFormOption = useCallback((nodeShape: NodeShape): FormOptionType => {
    return {
      label: parseWordsForLabels(nodeShape.label[VALUE_KEY]),
      value: nodeShape.label[VALUE_KEY],
    }
  }, []);

  const formOptions = useMemo(() => (props.node.map(nodeShape => convertNodeShapeToFormOption(nodeShape))
  ), []);

  // Handle change event for the branch selection
  const handleModelChange = (formOption: FormOptionType) => {
    const matchingNode: NodeShape = props.node.find(nodeShape => nodeShape.label[VALUE_KEY] === formOption.value);
    // Before updating the current form branch, unregister all current fields
    selectedModel.property.forEach(field => {
      if (field[TYPE_KEY].includes(PROPERTY_GROUP_TYPE)) {
        const fieldset: PropertyGroup = field as PropertyGroup;
        // Unregister any group level property like array
        props.form.unregister(fieldset.label[VALUE_KEY]);
        // Unregister all fields associated with group
        fieldset.property.forEach(fieldProp => {
          const fieldId: string = `${fieldset.label[VALUE_KEY]} ${fieldProp.name[VALUE_KEY]}`;
          props.form.unregister(fieldId);
        });
      } else {
        props.form.unregister((field as PropertyShape).name[VALUE_KEY]);
      }
    });
    // update branch node fields with existing values if present
    getBranchNode([matchingNode]);
    // Update form branch
    setSelectedFields(parsePropertyShapeOrGroupList({}, matchingNode.property));
    setSelectedModel(matchingNode);
  };

  return (
    <>
      <div className={styles["section-selector-container"]}>
        <label className={fieldStyles["field-text"]} htmlFor="select-input">{dict.message.branchInstruction}:</label>
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
          <b className={fieldStyles["field-text"]}>{dict.title.description}: </b>
          {selectedModel?.comment[VALUE_KEY]}
        </p>
      </div>
      {selectedFields.map((field, index) => {
        return renderFormField(props.entityType, props.agentApi, field, props.form, index);
      })}
    </>);
}
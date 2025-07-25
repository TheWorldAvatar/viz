import { useCallback, useMemo, useState } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";

import { useDictionary } from "hooks/useDictionary";
import { Routes } from "io/config/routes";
import { Dictionary } from "types/dictionary";
import {
  NodeShape,
  PROPERTY_GROUP_TYPE,
  PropertyGroup,
  PropertyShape,
  PropertyShapeOrGroup,
  TYPE_KEY,
  VALUE_KEY,
} from "types/form";
import SimpleSelector, {
  SelectOption,
} from "ui/interaction/dropdown/simple-selector";
import { parseWordsForLabels } from "utils/client-utils";
import { renderFormField } from "../form";
import { FORM_STATES, parsePropertyShapeOrGroupList } from "../form-utils";

interface OptionBasedFormSectionProps {
  entityType: string;
  node: NodeShape[];
  form: UseFormReturn;
}
/**
 * This component renders a branch form section that displays different form fields based on the selected branch option
 * in a separate selector.
 *
 * @param {string} entityType The type of entity.
 * @param {NodeShape[]} node A list containing the potential form field configurations available.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 */
export default function BranchFormSection(
  props: Readonly<OptionBasedFormSectionProps>
) {
  // Declare a function to get the most suitablebranch node and set default values if present
  const getBranchNode = useCallback((nodeShapes: NodeShape[]): NodeShape => {
    // Iterate to find and store any default values in these node states
    const nodeStates: FieldValues[] = [];
    nodeShapes.forEach((shape) => {
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
          if (
            typeof fieldVal === "string" &&
            fieldVal.length > 0 &&
            fieldVal != "-0.01"
          ) {
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
    Object.keys(nodeStateWithMostNonEmpty).forEach((nodeField) => {
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
  const [selectedModel, setSelectedModel] =
    useState<NodeShape>(initialNodeShape);
  const [selectedFields, setSelectedFields] = useState<PropertyShapeOrGroup[]>(
    parsePropertyShapeOrGroupList({}, initialNodeShape.property)
  );

  // Declare a function to transform node shape to a form option
  const convertNodeShapeToFormOption = useCallback(
    (nodeShape: NodeShape): SelectOption => {
      return {
        label: parseWordsForLabels(nodeShape.label[VALUE_KEY]),
        value: nodeShape.label[VALUE_KEY],
      };
    },
    []
  );

  const formOptions = useMemo(
    () =>
      props.node.map((nodeShape) => convertNodeShapeToFormOption(nodeShape)),
    []
  );

  // Handle change event for the branch selection
  const handleModelChange = (formOption: SelectOption) => {
    const matchingNode: NodeShape = props.node.find(
      (nodeShape) => nodeShape.label[VALUE_KEY] === formOption.value
    );
    // Before updating the current form branch, unregister all current fields
    selectedModel.property.forEach((field) => {
      if (field[TYPE_KEY].includes(PROPERTY_GROUP_TYPE)) {
        const fieldset: PropertyGroup = field as PropertyGroup;
        // Unregister any group level property like array
        props.form.unregister(fieldset.label[VALUE_KEY]);
        // Unregister all fields associated with group
        fieldset.property.forEach((fieldProp) => {
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
      <div className="flex flex-col gap-4">
        <label className="text-md md:text-lg" htmlFor="select-input">
          {dict.message.branchInstruction}:
        </label>
        <SimpleSelector
          options={formOptions}
          defaultVal={convertNodeShapeToFormOption(selectedModel).value}
          onChange={(selectedOption) => {
            if (selectedOption && "value" in selectedOption) {
              handleModelChange(selectedOption);
            }
          }}
          isDisabled={
            props.form.getValues(FORM_STATES.FORM_TYPE) ==
              Routes.REGISTRY_DELETE ||
            props.form.getValues(FORM_STATES.FORM_TYPE) == Routes.REGISTRY
          }
        />
        <p className="text-md md:text-lg">
          <b className="text-md md:text-lg">{dict.title.description}: </b>
          {selectedModel?.comment[VALUE_KEY]}
        </p>
      </div>
      {selectedFields.map((field, index) => {
        return renderFormField(props.entityType, field, props.form, index);
      })}
    </>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";

import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import {
  BillingEntityTypes,
  NodeShape,
  PROPERTY_GROUP_TYPE,
  PropertyGroup,
  PropertyShape,
  TYPE_KEY,
  VALUE_KEY
} from "types/form";
import LoadingSpinner from "ui/graphic/loader/spinner";
import SimpleSelector, {
  SelectOptionType,
} from "ui/interaction/dropdown/simple-selector";
import { parseWordsForLabels } from "utils/client-utils";
import { renderFormField } from "../form";
import { FORM_STATES, parsePropertyShapeOrGroupList } from "../form-utils";
import { BRANCH_ADD, BRANCH_DELETE } from "utils/internal-api-services";

interface BranchFormSectionProps {
  entityType: string;
  node: NodeShape[];
  form: UseFormReturn;
  billingStore?: BillingEntityTypes;
}
/**
 * This component renders a branch form section that displays different form fields based on the selected branch option
 * in a separate selector.
 *
 * @param {string} entityType The type of entity.
 * @param {NodeShape[]} node A list containing the potential form field configurations available.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {BillingEntityTypes} billingStore Optionally stores the type of account and pricing.
 */
export default function BranchFormSection(
  props: Readonly<BranchFormSectionProps>
) {
  const dict: Dictionary = useDictionary();
  const [isSwitching, setIsSwitching] = useState<boolean>(true);
  // Define the state to store the selected value
  const [selectedModel, setSelectedModel] = useState<NodeShape>(null);

  // Declare a function to transform node shape to a form option
  const convertNodeShapeToFormOption = useCallback(
    (nodeShape: NodeShape): SelectOptionType => {
      return {
        label: parseWordsForLabels(nodeShape?.label[VALUE_KEY]),
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

  useEffect(() => {
    if (props.node.length > 0) {
      const initialNode: NodeShape = props.node[0];
      setSelectedModel(initialNode);
      setIsSwitching(false);
      const formType: string = props.form.getValues(FORM_STATES.FORM_TYPE);
      const initialBranchName: string = initialNode.label[VALUE_KEY];

      if (formType === "delete") {
        props.form.setValue(BRANCH_DELETE, initialBranchName);
      } else if (formType === "edit") {
        // Set both values - branch_add for new, branch_delete for original
        props.form.setValue(BRANCH_ADD, initialBranchName);
        props.form.setValue(BRANCH_DELETE, initialBranchName);
      } else if (formType === "add") {
        // For add forms
        props.form.setValue(BRANCH_ADD, initialBranchName);
      }
    }
  }, [props.node, props.form]);

  // Handle change event for the branch selection
  const handleModelChange = (formOption: SelectOptionType) => {
    const formType: string = props.form.getValues(FORM_STATES.FORM_TYPE);
    const newBranchName: string = formOption.value;

    if (formType === "edit") {
      //  branch_add is the new selection, branch_delete stays as original
      props.form.setValue(BRANCH_ADD, newBranchName);
      // branch_delete remains the original value (already set in useEffect)
    } else if (formType === "delete") {
      props.form.setValue(BRANCH_DELETE, newBranchName);
    } else if (formType === "add") {
      props.form.setValue(BRANCH_ADD, newBranchName);
    }

    setIsSwitching(true);
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
    // Update form branch fields and values
    const nodeState: FieldValues = {};
    parsePropertyShapeOrGroupList(nodeState, matchingNode.property);
    setSelectedModel(matchingNode);
    setTimeout(() => setIsSwitching(false), 250);
  };

  return (
    <>
      <div className="flex flex-col gap-4 mt-4">
        <label className="text-md md:text-lg" htmlFor="select-input">
          {dict.message.branchInstruction}:
        </label>
        {selectedModel && <SimpleSelector
          options={formOptions}
          defaultVal={convertNodeShapeToFormOption(selectedModel).value}
          onChange={(selectedOption) => {
            if (selectedOption && "value" in selectedOption) {
              handleModelChange(selectedOption);
            }
          }}
          isDisabled={
            props.form.getValues(FORM_STATES.FORM_TYPE) == "delete" ||
            props.form.getValues(FORM_STATES.FORM_TYPE) == "view"
          }
        />}
        <p className="text-md md:text-lg">
          <b className="text-md md:text-lg">{dict.title.description}: </b>
          {selectedModel?.comment[VALUE_KEY]}
        </p>
      </div>
      {isSwitching ? <LoadingSpinner isSmall={true} />
        : selectedModel?.property.map((field, index) => {
          return renderFormField(props.entityType, field, props.form, index, props.billingStore);
        })}
    </>
  );
}

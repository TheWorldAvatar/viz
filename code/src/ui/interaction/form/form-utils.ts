import { FieldValues, RegisterOptions, UseFormReturn } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";

import { browserStorageManager } from "state/browser-storage-manager";
import {
  BillingEntityTypes,
  FormTemplateType,
  FormType,
  FormTypeMap,
  ID_KEY,
  NodeShape,
  ONTOLOGY_CONCEPT_ROOT,
  OntologyConcept,
  OntologyConceptMappings,
  PROPERTY_GROUP_TYPE,
  PropertyGroup,
  PropertyShape,
  PropertyShapeOrGroup,
  QuickViewFields,
  QuickViewGroupings,
  SparqlResponseField,
  TYPE_KEY,
  VALUE_KEY
} from "types/form";
import { getAfterDelimiter } from "utils/client-utils";
import { SelectOptionType } from "../dropdown/simple-selector";
import { REPLACE_DICT_KEY } from "utils/constants";

export const FORM_STATES: Record<string, string> = {
  ID: "id",
  IRI: "iri",
  FORM_TYPE: "formType",
  CONTRACT: "contract",
  ORDER: "order",
  REMARKS: "remarks",
  RECURRENCE: "recurrences",
  ENTRY_DATES: "entry_date",
  SCHEDULE_ENTRY: "schedule entry",
  SCHEDULE_ENTRY_DATE: "schedule entry date",
  MON: "monday",
  TUES: "tuesday",
  WED: "wednesday",
  THURS: "thursday",
  FRI: "friday",
  SAT: "saturday",
  SUN: "sunday",
  DATE: "date",
  START_DATE: "start date",
  END_DATE: "end date",
  START_TIME_PERIOD: "search period from",
  END_TIME_PERIOD: "search period to",
  TIME_SLOT_START: "time slot start",
  TIME_SLOT_END: "time slot end",
  LATITUDE: "latitude",
  LONGITUDE: "longitude",
  FLAT_FEE: "base fee",
  UNIT_PRICE: "unit price",
  UNIT_RATE: "rate ($)",
  UNIT_LOWER_BOUND: "from (unit)",
  UNIT_UPPER_BOUND: "to (unit)",
};

export const ENTITY_STATUS: Record<string, string> = {
  ACTIVE: "Active",
  ARCHIVED: "Archived",
  PENDING: "Pending",
};

/**
 * Parses a list of property shape or group into a format compliant with the viz.
 *
 * @param {FieldValues} initialState The initial state to store any field configuration.
 * @param {PropertyShapeOrGroup} fields Target list of field configurations for parsing.
 * @param {BillingEntityTypes} billingTypes Optionally indicates the type of account and pricing.
 */
export function parsePropertyShapeOrGroupList(
  initialState: FieldValues,
  fields: PropertyShapeOrGroup[],
  billingTypes: BillingEntityTypes = { account: "", accountField: "", pricing: "", pricingField: "" },
): PropertyShapeOrGroup[] {
  return fields.map((field) => {
    // Properties as part of a group
    if (field[TYPE_KEY].includes(PROPERTY_GROUP_TYPE)) {
      const fieldset: PropertyGroup = field as PropertyGroup;
      const properties: PropertyShape[] = fieldset.property.map((fieldProp) => {
        // Iterate after filtering the property so that non-array fields are not parsed
        const updatedProp: PropertyShape = updateDependentProperty(
          fieldProp,
          fields
        );
        // When there should be multiple values for the same property ie no max count or at least more than 1 value, initialise it as an array
        if (
          !fieldset.maxCount ||
          (fieldset.maxCount && parseInt(fieldset.maxCount?.[VALUE_KEY]) > 1)
        ) {
          return initFormField(
            updatedProp,
            initialState,
            fieldset.label[VALUE_KEY],
            true,
            parseInt(fieldset.minCount?.[VALUE_KEY])
          );
        }
        // Update and set property field ids to include their group name
        // Append field id with group name as prefix
        const fieldId: string = `${fieldset.label[VALUE_KEY]} ${updatedProp.name[VALUE_KEY]}`;
        // Replace account or pricing field with the field ID so that we can still retrieve the old values
        if (billingTypes?.account?.replace("_", " ") == updatedProp.name[VALUE_KEY]) {
          billingTypes.accountField = fieldId;
        } else if (billingTypes?.pricing?.replace("_", " ") == updatedProp.name[VALUE_KEY]) {
          billingTypes.pricingField = fieldId;
        }
        return initFormField(updatedProp, initialState, fieldId);
      });
      // Update the property group with updated properties
      return {
        ...fieldset,
        property: properties,
      };
    } else {
      const fieldShape: PropertyShape = updateDependentProperty(
        field as PropertyShape,
        fields
      );
      // When there should be multiple values for the same property ie no max count or at least more than 1 value, initialise it as an array
      if (
        !fieldShape.maxCount ||
        (fieldShape.maxCount && parseInt(fieldShape.maxCount?.[VALUE_KEY]) > 1)
      ) {
        return initFormField(
          fieldShape,
          initialState,
          fieldShape.name[VALUE_KEY],
          true,
          parseInt(fieldShape.minCount?.[VALUE_KEY])
        );
      }
      // For groupless properties, their field ID will be directly set without further parsing
      return initFormField(
        fieldShape,
        initialState,
        fieldShape.name[VALUE_KEY],
      );
    }
  });
}

/**
 * Parses the branches into a format compliant with the viz as well as initialise the initial state.
 *
 * @param {FieldValues} initialState The initial state to store any field configuration.
 * @param {NodeShape[]} nodeShapes The target list of branches and their shapes.
 * @param {boolean} reqMatching Enables the matching process to find the most suitable branch.
 * @param {BillingEntityTypes} billingTypes Optionally indicates the type of account and pricing.
 */
export function parseBranches(
  initialState: FieldValues,
  nodeShapes: NodeShape[],
  reqMatching: boolean,
  billingTypes: BillingEntityTypes = { account: "", accountField: "", pricing: "", pricingField: "" },
): NodeShape[] {
  // Early termination
  if (nodeShapes.length === 0) {
    return nodeShapes;
  }
  // Iterate to find and store any default values in these node states
  const nodeStates: FieldValues[] = [];
  const results: NodeShape[] = [];
  nodeShapes.forEach((shape) => {
    const nodeState: FieldValues = {};
    const parsedShapeProperties: PropertyShapeOrGroup[] = parsePropertyShapeOrGroupList(nodeState, shape.property, billingTypes);
    nodeStates.push(nodeState);
    results.push({
      ...shape,
      property: parsedShapeProperties,
    });
  });
  // Find the best matched node states with non-empty values and null values
  let nodeWithMostNonEmpty: NodeShape = results[0];
  let nodeStateWithMostNonEmpty: FieldValues = nodeStates[0];
  if (reqMatching) {
    let maxNonEmptyCount: number = 0;
    let minNullCount: number = 0;
    nodeStates.forEach((nodeState, index) => {
      let currentNonEmptyCount: number = 0;
      let currentNullCount: number = 0;
      for (const nodeField in nodeState) {
        if (Object.hasOwn(nodeState, nodeField)) {
          const fieldVal = nodeState[nodeField];
          // If field value is undefined, increment null count
          if (!fieldVal) {
            currentNullCount++;
          }
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
      // When the current number of non-empty fields exceeds the existing maximum,
      // the best match node will be updated accordingly
      if (currentNonEmptyCount > maxNonEmptyCount) {
        nodeWithMostNonEmpty = results[index];
        nodeStateWithMostNonEmpty = nodeState;
        maxNonEmptyCount = currentNonEmptyCount;
        minNullCount = currentNullCount;
        // But when the fields are equivalent in matching fields (as branches may have the same fields), 
        // we will use what is missing based on null values to find the best match
      } else if (currentNonEmptyCount == maxNonEmptyCount && currentNullCount < minNullCount) {
        nodeWithMostNonEmpty = results[index];
        nodeStateWithMostNonEmpty = nodeState;
        minNullCount = currentNullCount;
      }
    });
  }
  for (const field in nodeStateWithMostNonEmpty) {
    initialState[field] = nodeStateWithMostNonEmpty[field];
  }
  return [nodeWithMostNonEmpty, ...results.filter(node => node != nodeWithMostNonEmpty)];
}


/**
 * Initialises a form field based on the property shape. This function will retrieve the default value
 * as well as append the field ID based on the input.
 *
 * @param {PropertyShape} field The data model for the field of interest.
 * @param {FieldValues} outputState The current state storing existing form values.
 * @param {string} fieldId The field ID that should be generated.
 * @param {boolean} isArray Optional state to initialise array fields.
 * @param {number} minSize Optional parameter to indicate the minimum array size.
 */
function initFormField(
  field: PropertyShape,
  outputState: FieldValues,
  fieldId: string,
  isArray?: boolean,
  minSize?: number
): PropertyShape {
  let parsedFieldId: string = fieldId;
  if (isArray) {
    // Update field ID, the fieldId for an array should be its group name
    parsedFieldId = `${fieldId} ${field.name[VALUE_KEY]}`;
    let currentIndex: number = 0;
    const minArraySize: number =
      Number.isNaN(minSize) || minSize != 0 ? 1 : minSize;

    // For an optional field array with no default/pre-existing value
    if (minArraySize == 0 && !field.defaultValue) {
      // If this is the first field item, initialise it as empty
      if (!outputState[fieldId]) {
        outputState[fieldId] = [];
      }
      // Terminate early
      return {
        ...field,
        fieldId: parsedFieldId,
      };
    }

    // Initialise with an empty item as there is a default value
    if (!outputState[fieldId] || outputState[fieldId].length === 0) {
      outputState[fieldId] = [{}];
    }
    // Append existing values if they exist
    if (field.defaultValue) {
      const defaultArray: SparqlResponseField[] = Array.isArray(
        field.defaultValue
      )
        ? field.defaultValue
        : [field.defaultValue];
      defaultArray.forEach((defaultValue, index) => {
        if (!outputState[fieldId][index]) {
          outputState[fieldId][index] = {};
        }
        outputState[fieldId][index][parsedFieldId] = defaultValue?.value;
        currentIndex = index; // Always update the current index following default values
      });
    } else {
      // If no existing values exist, add an initial value
      outputState[fieldId][currentIndex][parsedFieldId] = "";
    }
    currentIndex++; // increment the counter
  } else {
    let defaultVal: string = !Array.isArray(field.defaultValue)
      ? field.defaultValue?.value
      : "";
    // If no default value is available for id, value will default to the id
    if (field.name[VALUE_KEY] == "id" && !defaultVal) {
      defaultVal = outputState.id;
    }
    // For a form to assign price, there is a customer account stored that should be defaulted to
    if (outputState["formType"] == FormTypeMap.ASSIGN_PRICE && !!browserStorageManager.get(field.name[VALUE_KEY])) {
      defaultVal = browserStorageManager.get(field.name[VALUE_KEY]);
    }
    outputState[fieldId] = getDefaultVal(
      fieldId,
      defaultVal,
      outputState.formType
    );
  }
  // Update property shape with field ID property
  return {
    ...field,
    fieldId: parsedFieldId,
  };
}

/**
 * Get the default value based on the inputs. If default value is given, this will be return, otherwise,
 * it depends on the field name.
 *
 * @param {string} field The field of interest.
 * @param {string} defaultValue Default value retrieved from the backend, if any.
 * @param {string} formType The type of form.
 */
export function getDefaultVal(
  field: string,
  defaultValue: string,
  formType: FormType,
): boolean | number | string {
  if (field == FORM_STATES.ID) {
    // ID property should only be randomised for the add/search form type, and if it doesn't exists, else, use the default value
    if (formType == FormTypeMap.ADD || formType == FormTypeMap.SEARCH ||
      formType == FormTypeMap.ADD_BILL || formType == FormTypeMap.ADD_PRICE || !defaultValue) {
      return uuidv4();
    }
    // Retrieve only the ID without any prefix
    return defaultValue.split("/").pop();
  }

  if (field == FORM_STATES.RECURRENCE) {
    if (!defaultValue) {
      return null;
    }
    if (defaultValue === "P1D") {
      return 0;
    }
    if (defaultValue === "P2D") {
      return -1;
    }
    // Retrieve and parse the recurrent digit based on default value
    const match: RegExpMatchArray = /P(\d+)D/.exec(defaultValue);
    if (match) {
      return parseInt(match[1], 10) / 7; // The recurrence interval should be divided by 7
    }
  }

  if (
    [
      FORM_STATES.SUN,
      FORM_STATES.MON,
      FORM_STATES.TUES,
      FORM_STATES.WED,
      FORM_STATES.THURS,
      FORM_STATES.FRI,
      FORM_STATES.SAT,
    ].includes(field)
  ) {
    // Any day of week property should default to false for add form type, else, use the default value
    if (formType == "add" || formType == "search") {
      return false;
    }
    // Default value can be null, and should return false if null
    return !!defaultValue;
  }
  // Returns the default value if passed, or else, empty string
  return defaultValue ? defaultValue : "";
}

/**
 * Update the dependentOn field for the target property shape with the corresponding form field ID.
 *
 * @param {PropertyShape} field The data model for the field of interest.
 * @param {PropertyShapeOrGroup[]} properties A list of properties to search for the form field ID.
 */
function updateDependentProperty(
  field: PropertyShape,
  properties: PropertyShapeOrGroup[]
): PropertyShape {
  if (field.dependentOn) {
    const dependentIri: string = field.dependentOn[ID_KEY];
    let dependentFieldId: string;
    let dependentFieldName: string;
    for (const property of properties) {
      if (dependentFieldId) {
        break;
      }
      if (property[TYPE_KEY].includes(PROPERTY_GROUP_TYPE)) {
        const fieldset: PropertyGroup = property as PropertyGroup;
        const propertyLabel: string = fieldset.property.find(
          (fieldProperty: PropertyShape) =>
            dependentIri == fieldProperty[ID_KEY]
        )?.name[VALUE_KEY];
        if (propertyLabel) {
          dependentFieldId = `${fieldset.label[VALUE_KEY]} ${propertyLabel}`;
          dependentFieldName = propertyLabel;
        }
      } else {
        const fieldProperty: PropertyShape = property as PropertyShape;
        if (dependentIri == fieldProperty[ID_KEY]) {
          dependentFieldId = fieldProperty.name[VALUE_KEY];
          dependentFieldName = fieldProperty.name[VALUE_KEY];
        }
      }
    }
    return {
      ...field,
      dependentOn: {
        [ID_KEY]: dependentFieldId,
        label: dependentFieldName,
      },
    };
  } else {
    return field;
  }
}

/**
 * Generate the RegisterOptions required for react-hook-form inputs based on user requirements.
 *
 * @param {PropertyShape} field The SHACL restrictions for the specific property
 * @param {string} formType The type of form.
 */
export function getRegisterOptions(
  field: PropertyShape,
  formType: string
): RegisterOptions {
  const options: RegisterOptions = {};
  const dict: Dictionary = useDictionary();

  // The field is required if this is currently not the search form and SHACL defines them as optional
  // Also required for start and end search period
  if (
    (formType != "search" &&
      Number(field.minCount?.[VALUE_KEY]) === 1 &&
      Number(field.maxCount?.[VALUE_KEY]) === 1) ||
    field.fieldId == FORM_STATES.START_TIME_PERIOD ||
    field.fieldId == FORM_STATES.END_TIME_PERIOD
  ) {
    options.required = dict.message.required;
  }

  // For numerical values which must have least meet the min inclusive target
  if (field.minInclusive) {
    options.min = {
      value: Number(field.minInclusive[VALUE_KEY]),
      message: dict.message.minInclusive.replace(
        REPLACE_DICT_KEY,
        field.minInclusive[VALUE_KEY]
      ),
    };
  } else if (field.minExclusive) {
    options.min = {
      value: Number(field.minExclusive[VALUE_KEY]) + 0.1,
      message: dict.message.minExclusive.replace(
        REPLACE_DICT_KEY,
        field.minExclusive[VALUE_KEY]
      ),
    };
  }

  // For numerical values which must have least meet the max inclusive target
  if (field.maxInclusive) {
    options.max = {
      value: Number(field.maxInclusive[VALUE_KEY]),
      message: dict.message.maxInclusive.replace(
        REPLACE_DICT_KEY,
        field.maxInclusive[VALUE_KEY]
      ),
    };
  } else if (field.maxExclusive) {
    options.max = {
      value: Number(field.maxExclusive[VALUE_KEY]) + 0.1,
      message: dict.message.maxExclusive.replace(
        REPLACE_DICT_KEY,
        field.maxExclusive[VALUE_KEY]
      ),
    };
  }

  if (field.minLength) {
    options.minLength = {
      value: Number(field.minLength[VALUE_KEY]),
      message: dict.message.minLength.replace(
        REPLACE_DICT_KEY,
        field.minLength[VALUE_KEY]
      ),
    };
  }
  if (field.maxLength) {
    options.maxLength = {
      value: Number(field.maxLength[VALUE_KEY]),
      message: dict.message.maxLength.replace(
        REPLACE_DICT_KEY,
        field.maxLength[VALUE_KEY]
      ),
    };
  }

  // For any custom patterns
  if (field.pattern) {
    // Change message if only digits are allowed
    const msg: string =
      field.pattern[VALUE_KEY] === "^\\d+$"
        ? `${dict.message.numericalValuesOnly}`
        : `${dict.message.patternFollowed.replace(
          REPLACE_DICT_KEY,
          field.pattern[VALUE_KEY]
        )}`;
    options.pattern = {
      value: new RegExp(field.pattern[VALUE_KEY]),
      message: msg,
    };
  }

  // Validate that the input is a number for decimal and integer types
  if (field.datatype === "integer") {
    options.pattern = {
      value: /^-?\d+$/,
      message: dict.message.numericalValuesOnly,
    };
  } else if (field.datatype === "decimal") {
    options.pattern = {
      value: /^-?\d*\.?\d+$/,
      message: dict.message.numericalValuesOnly,
    };
  }

  return options;
}

/**
 * Parse the concepts into the mappings required for display.
 *
 * @param {OntologyConcept[]} concepts Array of concepts for sorting.
 * @param {string} priority The priority concept that we must find and separate.
 */
export function parseConcepts(
  concepts: OntologyConcept[],
  priority: string
): OntologyConceptMappings {
  const results: OntologyConceptMappings = {};
  // Ensure that there is a root mapping to collect all parent's information
  results[ONTOLOGY_CONCEPT_ROOT] = [];
  // For handling the priority concept
  let priorityConcept: OntologyConcept;
  // Store the parent key value
  const parentNodes: string[] = [];

  concepts.forEach((concept) => {
    // Store the priority option if found
    if (concept.label.value === priority || concept.type.value === priority) {
      priorityConcept = concept;
    }

    // If it has a parent, the concept should be appended to its parent key
    if (concept.parent) {
      const parentInstance = concept.parent.value;
      // Add a new array if the mapping does not exist
      if (!results[parentInstance]) {
        results[parentInstance] = [];
        parentNodes.push(parentInstance);
      }
      results[parentInstance].push(concept);
    } else {
      // Else if it is a parent, push it to the root mapping
      results[ONTOLOGY_CONCEPT_ROOT].push(concept);
    }
  });
  sortChildrenConcepts(results, priorityConcept);
  sortRootConcepts(results, priorityConcept, parentNodes);
  return results;
}

/**
 * Sorts the root/parents concepts.
 *
 * @param {OntologyConceptMappings} mappings Newly parsed mappings from the inputs.
 * @param {OntologyConcept} priority The priority concept that we must find and separate.
 * @param {string[]} parentNodes A list of parent nodes for sorting.
 */
function sortRootConcepts(
  mappings: OntologyConceptMappings,
  priority: OntologyConcept,
  parentNodes: string[]
): void {
  let priorityConcept: OntologyConcept;
  let parentConcepts: OntologyConcept[] = [];
  let childlessConcepts: OntologyConcept[] = [];
  // Process the concepts to map them
  mappings[ONTOLOGY_CONCEPT_ROOT].forEach((concept) => {
    // Priority may either be a child or parent concept and we should store the right concept
    if (
      priority &&
      (concept.type.value == priority.parent?.value ||
        concept.label.value == priority.parent?.value ||
        concept.label.value == priority.label?.value)
    ) {
      // If this is the priority concept, store it directly, and do not sort it out as it will be appended to the first of the array
      priorityConcept = concept;
    } else {
      // If this is a parent concept with children
      if (parentNodes.includes(concept.type.value)) {
        parentConcepts.push(concept);
      } else {
        childlessConcepts.push(concept);
      }
    }
  });
  // Sort the various concepts
  parentConcepts = parentConcepts.sort((a, b) =>
    a.label.value.localeCompare(b.label.value)
  );
  childlessConcepts = childlessConcepts.sort((a, b) =>
    a.label.value.localeCompare(b.label.value)
  );
  // The final sequence should be the prioritised concept if available, followed by childless and then parent concepts.
  mappings[ONTOLOGY_CONCEPT_ROOT] = priorityConcept
    ? [priorityConcept, ...childlessConcepts, ...parentConcepts]
    : [...childlessConcepts, ...parentConcepts];
}

/**
 * Sorts the children concepts.
 *
 * @param {OntologyConceptMappings} mappings Newly parsed mappings from the inputs.
 * @param {OntologyConcept} priority The priority concept that we must find and separate.
 */
function sortChildrenConcepts(
  mappings: OntologyConceptMappings,
  priority: OntologyConcept
): void {
  // Extract an immutable list of parents to prevent further modifications
  const parents: string[] = mappings[ONTOLOGY_CONCEPT_ROOT].map(
    (concept) => concept.type.value
  );
  Object.keys(mappings).forEach((parentKey) => {
    // Ensure that this is not the root
    if (parentKey != ONTOLOGY_CONCEPT_ROOT) {
      // If the parent object does exist, sort the children
      if (parents.includes(parentKey)) {
        // Attempt to find the match concept
        const matchedConcept: OntologyConcept = mappings[parentKey].find(
          (concept) => concept.type?.value == priority?.type?.value
        );
        // Filter out the matching concept if it is present, and sort the children out
        const sortedChildren: OntologyConcept[] = mappings[parentKey]
          .filter((concept) => concept.type?.value != priority?.type?.value)
          .sort((a, b) => a.label.value.localeCompare(b.label.value));
        // Append the matching concept to the start if it is present
        if (matchedConcept) {
          sortedChildren.unshift(matchedConcept);
        }
        // Overwrite the mappings with the sorted mappings
        mappings[parentKey] = sortedChildren;
      } else {
        // If there is no parent object, these children should be at the root instead
        mappings[parentKey].forEach((concept) =>
          mappings[ONTOLOGY_CONCEPT_ROOT].push(concept)
        );
        // Remove the key
        delete mappings[parentKey];
      }
    }
  });
}

/**
 * Retrieve the concept that matches the target value in the input mappings.
 *
 * @param {OntologyConceptMappings} mappings The mappings of option values for the dropdown.
 * @param {string} targetValue The target value for matching with in the concept's type.
 */
export function getMatchingConcept(
  mappings: OntologyConceptMappings,
  targetValue: string
): OntologyConcept {
  let match: OntologyConcept;
  Object.keys(mappings).forEach((key) => {
    const matchedConcept: OntologyConcept = mappings[key].find(
      (concept) => concept.type?.value == targetValue
    );
    if (matchedConcept) {
      match = matchedConcept;
    }
  });
  return match;
}

/**
 * Find the matching dropdown option value based on the default value.
 *
 * @param {string} defaultValue Matching value.
 * @param {RegistryFieldValues[]} entities Options to match with.
 */
export function findMatchingDropdownOptionValue(
  defaultValue: string,
  entities: SelectOptionType[]
): string {
  const matchingEntity: SelectOptionType = entities.find(
    (entity) =>
      getAfterDelimiter(
        entity.value,
        "/"
      ) === defaultValue
  );
  if (matchingEntity) {
    return matchingEntity.value;
  }
  return null;
}

/**
 * Translates the form type from the input and dictionary.
 *
 * @param {FormType} input The target input.
 * @param {Dictionary} dict The dictionary mappings.
 */
export function translateFormType(input: FormType, dict: Dictionary): string {
  switch (input) {
    case FormTypeMap.VIEW:
      return dict.action.view;
    case FormTypeMap.ADD:
    case FormTypeMap.ADD_BILL:
    case FormTypeMap.ADD_PRICE:
      return dict.action.add;
    case FormTypeMap.ADD_INVOICE:
      return dict.action.addAdjustment;
    case FormTypeMap.EDIT:
      return dict.action.edit;
    case FormTypeMap.ASSIGN_PRICE:
      return dict.action.assign;
    case FormTypeMap.DELETE:
      return dict.action.delete;
    case FormTypeMap.SEARCH:
      return dict.action.search;
    case "terminate":
      return dict.action.terminate;
    default:
      break;
  }
}

/**
 * Parses the form template into quick view groupings for easy access.
 *
 * @param {FormTemplateType} template The form template input.
 */
export function parseFormTemplateForQuickViewGroupings(
  template: FormTemplateType
): QuickViewGroupings {
  let quickViewGroups: QuickViewGroupings = { default: {} };
  template.property.map((field) => {
    // Properties as part of a group
    if (field[TYPE_KEY].includes(PROPERTY_GROUP_TYPE)) {
      const fieldset: PropertyGroup = field as PropertyGroup;
      const groupName: string = fieldset.label[VALUE_KEY];
      fieldset.property.map((fieldProp) => {
        quickViewGroups = parseQuickViewFields(
          fieldProp.name[VALUE_KEY],
          fieldProp.class?.[ID_KEY],
          groupName,
          fieldProp.defaultValue,
          quickViewGroups
        );
      });
    } else {
      const fieldShape: PropertyShape = field as PropertyShape;
      const fieldName: string = fieldShape.name[VALUE_KEY];
      if (fieldName != "id") {
        quickViewGroups = parseQuickViewFields(
          fieldName,
          fieldShape.class?.[ID_KEY],
          "default",
          fieldShape.defaultValue,
          quickViewGroups
        );
      }
    }
  });
  return quickViewGroups;
}

/**
 * Parses quick view fields based on the input parameters.
 *
 * @param {string} fieldName Name of the field.
 * @param {string} fieldClass The class of the field if available.
 * @param {string} groupName Name of the associated group. Default is default
 * @param {SparqlResponseField | SparqlResponseField[]} fieldValue Value for the field.
 * @param {QuickViewGroupings} output Stores the parsing results.
 */
function parseQuickViewFields(
  fieldName: string,
  fieldClass: string,
  groupName: string,
  fieldValue: SparqlResponseField | SparqlResponseField[],
  output: QuickViewGroupings
): QuickViewGroupings {
  if (fieldValue) {
    // Always return array of fields
    let parsedFieldValues: SparqlResponseField[] = Array.isArray(fieldValue)
      ? fieldValue
      : [fieldValue];
    if (
      fieldClass ===
      "https://spec.edmcouncil.org/fibo/ontology/FND/Places/Locations/PhysicalLocation"
    ) {
      parsedFieldValues = parsedFieldValues.map((fieldVal) => {
        return {
          ...fieldVal,
          type: "mapUri",
        };
      });
    }
    const fields: QuickViewFields = {
      // Append previous fields in the same group
      ...output[groupName],
      [fieldName]: parsedFieldValues,
    };
    output = {
      ...output,
      [groupName]: fields,
    };
  }
  return output;
}

/**
 * Creates a new empty array row with default values for each field in the configuration
 *
 * @param {PropertyShape[]} fieldConfigs A list of property shapes for the form array field
 */
export function genEmptyArrayRow(fieldConfigs: PropertyShape[]): FieldValues {
  const emptyField: FieldValues = {};
  fieldConfigs.forEach((config) => {
    emptyField[config.fieldId] = "";
  });
  return emptyField;
}

/**
 * Updates the latitude and longitude fields.
 *
 * @param {string} field The location field ID.
 * @param {string} latitude The latitude value.
 * @param {string} longitude The longitude value.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 */
export function updateLatLong(
  field: string,
  latitude: string,
  longitude: string,
  form: UseFormReturn
): void {
  form.setValue(FORM_STATES.LATITUDE, latitude);
  form.setValue(FORM_STATES.LONGITUDE, longitude);
  form.setValue(field, `POINT(${longitude} ${latitude})`);
}

/**
 * Generates the default select option from dictionary.
 *
 * @param {Dictionary} dict The dictionary mappings.
 */
export function genDefaultSelectOption(dict: Dictionary): OntologyConcept {
  return {
    type: {
      value: "",
      type: "literal",
      dataType: "http://www.w3.org/2001/XMLSchema#string",
      lang: "",
    },
    label: {
      value: dict.action.selectAll,
      type: "literal",
      dataType: "http://www.w3.org/2001/XMLSchema#string",
      lang: "",
    },
    description: {
      value: "This option allows you to select all available criteria at once.",
      type: "literal",
      dataType: "http://www.w3.org/2001/XMLSchema#string",
      lang: "",
    },
  };
}
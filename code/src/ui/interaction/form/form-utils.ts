import { FieldValues, RegisterOptions } from "react-hook-form";
import { v4 as uuidv4 } from 'uuid';

import { Paths } from "io/config/routes";
import { PropertyShape, VALUE_KEY, ONTOLOGY_CONCEPT_ROOT, OntologyConcept, OntologyConceptMappings, SEARCH_FORM_TYPE, PropertyShapeOrGroup, ID_KEY, TYPE_KEY, PROPERTY_GROUP_TYPE, PropertyGroup, SparqlResponseField } from "types/form";

export const FORM_STATES: Record<string, string> = {
  ID: "id",
  IRI: "iri",
  FORM_TYPE: "formType",
  CONTRACT: "contract",
  ORDER: "order",
  REMARKS: "remarks",
  RECURRENCE: "recurrence",
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
 */
export function parsePropertyShapeOrGroupList(initialState: FieldValues, fields: PropertyShapeOrGroup[]): PropertyShapeOrGroup[] {
  return fields.map(field => {
    // Properties as part of a group
    if (field[TYPE_KEY].includes(PROPERTY_GROUP_TYPE)) {
      const fieldset: PropertyGroup = field as PropertyGroup;
      // Initialise multiple property
      fieldset.multipleProperty = [];
      const properties: PropertyShape[] = fieldset.property.filter(propertyShape => {
        // When multiple fields for the same property is possible ie no max count or at least more than 1, 
        // the property must be initialised as an array and pushed into a separate set
        if (!propertyShape.maxCount || (propertyShape.maxCount && parseInt(propertyShape.maxCount?.[VALUE_KEY]) > 1)) {
          const updatedPropShape: PropertyShape = updateDependentProperty(propertyShape, fields);
          fieldset.multipleProperty.push(
            initFormField(updatedPropShape, initialState, fieldset.label[VALUE_KEY], true)
          );
          return false; // Filter out from the 'properties' array
        } else {
          return true; // Keep in the 'properties' array
        }
      }).map(fieldProp => {
        // Iterate after filtering the property so that non-array fields are not parsed
        const updatedProp: PropertyShape = updateDependentProperty(fieldProp, fields);
        // Update and set property field ids to include their group name
        // Append field id with group name as prefix
        const fieldId: string = `${fieldset.label[VALUE_KEY]} ${updatedProp.name[VALUE_KEY]}`;
        return initFormField(updatedProp, initialState, fieldId);
      });
      // Update the property group with updated properties
      return {
        ...fieldset,
        property: properties,
      }
    } else {
      const fieldShape: PropertyShape = updateDependentProperty(field as PropertyShape, fields);
      // For groupless properties, their field ID will be directly set without further parsing
      return initFormField(fieldShape, initialState, fieldShape.name[VALUE_KEY]);
    }
  });
}

/**
 * Initialises a form field based on the property shape. This function will retrieve the default value
 * as well as append the field ID based on the input.
 * 
 * @param {PropertyShape} field The data model for the field of interest.
 * @param {FieldValues} outputState The current state storing existing form values.
 * @param {string} fieldId The field ID that should be generated.
 * @param {boolean} isArray Optional state to initialise array fields.
 */
function initFormField(field: PropertyShape, outputState: FieldValues, fieldId: string, isArray?: boolean): PropertyShape {
  let parsedFieldId: string = fieldId;
  if (isArray) {
    // Update field ID, the fieldId for an array should be its group name
    parsedFieldId = `${fieldId} ${field.name[VALUE_KEY]}`;
    let currentIndex: number = 0;
    if (!outputState[fieldId]) {
      outputState[fieldId] = [{}];
    }
    // Append existing values if they exist
    if (field.defaultValue) {
      const defaultArray: SparqlResponseField[] = Array.isArray(field.defaultValue) ?
        field.defaultValue : [field.defaultValue];
      defaultArray.forEach((defaultValue, index) => {
        if (!outputState[fieldId][index]) {
          outputState[fieldId][index] = {};
        }
        outputState[fieldId][index][parsedFieldId] = defaultValue.value;
        currentIndex = index; // Always update the current index following default values
      });
    } else {
      // If no existing values exist, add an initial value
      outputState[fieldId][currentIndex][parsedFieldId] = "";
    }
    currentIndex++; // increment the counter
  } else {
    let defaultVal: string = !Array.isArray(field.defaultValue) ? field.defaultValue?.value : "";
    // If no default value is available for id, value will default to the id
    if (field.name[VALUE_KEY] == "id" && !defaultVal) {
      defaultVal = outputState.id;
    }
    outputState[fieldId] = getDefaultVal(fieldId, defaultVal, outputState.formType);
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
export function getDefaultVal(field: string, defaultValue: string, formType: string): boolean | number | string {
  if (field == FORM_STATES.ID) {
    // ID property should only be randomised for the add/search form type, and if it doesn't exists, else, use the default value
    if (formType == Paths.REGISTRY_ADD || formType == SEARCH_FORM_TYPE || !defaultValue) {
      return uuidv4();
    }
    // Retrieve only the ID without any prefix
    return defaultValue.split("/").pop();
  }

  if (field == FORM_STATES.RECURRENCE) {
    // Recurrence property should have a value of 1 for the add form type, else, use the default value
    if (formType == Paths.REGISTRY_ADD || formType == SEARCH_FORM_TYPE) {
      return 1;
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

  if ([FORM_STATES.SUN, FORM_STATES.MON, FORM_STATES.TUES, FORM_STATES.WED, FORM_STATES.THURS, FORM_STATES.FRI, FORM_STATES.SAT].includes(field)) {
    // Any day of week property should default to false for add form type, else, use the default value
    if (formType == Paths.REGISTRY_ADD || formType == SEARCH_FORM_TYPE) {
      return false;
    }
    // Default value can be null, and should return false if null
    return !!defaultValue;
  }

  // WIP: Set default value Singapore for any City Field temporarily
  // Default values should not be hardcoded here but retrieved in a config instead
  const defaultVal: string = field.includes("city") ? "Singapore" : "";
  // Returns the default value if passed, or else, nothing
  return defaultValue ?? defaultVal;
}


/**
 * Update the dependentOn field for the target property shape with the corresponding form field ID.
 * 
 * @param {PropertyShape} field The data model for the field of interest.
 * @param {PropertyShapeOrGroup[]} properties A list of properties to search for the form field ID.
 */
function updateDependentProperty(field: PropertyShape, properties: PropertyShapeOrGroup[]): PropertyShape {
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
        const propertyLabel: string = fieldset.property.find((fieldProperty: PropertyShape) =>
          dependentIri == fieldProperty[ID_KEY])?.name[VALUE_KEY];
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
      }
    }
  } else { return field }
}

/**
 * Generate the RegisterOptions required for react-hook-form inputs based on user requirements.
 * 
 * @param {PropertyShape} field The SHACL restrictions for the specific property
 * @param {string} formType The type of form.
 */
export function getRegisterOptions(field: PropertyShape, formType: string): RegisterOptions {
  const options: RegisterOptions = {};

  // The field is required if this is currently not the search form and SHACL defines them as optional
  // Also required for start and end search period
  if ((formType != SEARCH_FORM_TYPE && (Number(field.minCount?.[VALUE_KEY]) === 1 && Number(field.maxCount?.[VALUE_KEY]) === 1)) ||
    (field.fieldId == FORM_STATES.START_TIME_PERIOD || field.fieldId == FORM_STATES.END_TIME_PERIOD)) {
    options.required = "Required";
  }

  // For numerical values which must have least meet the min inclusive target
  if (field.minInclusive) {
    options.min = {
      value: Number(field.minInclusive[VALUE_KEY]),
      message: `Please enter a number that is ${field.minInclusive[VALUE_KEY]} or greater!`,
    };
  } else if (field.minExclusive) {
    options.min = {
      value: Number(field.minExclusive[VALUE_KEY]) + 0.1,
      message: `Please enter a number greater than ${field.minExclusive[VALUE_KEY]}!`,
    };
  }

  // For numerical values which must have least meet the max inclusive target
  if (field.maxInclusive) {
    options.max = {
      value: Number(field.maxInclusive[VALUE_KEY]),
      message: `Please enter a number that is ${field.maxInclusive[VALUE_KEY]} or smaller!`,
    };
  } else if (field.maxExclusive) {
    options.max = {
      value: Number(field.maxExclusive[VALUE_KEY]) + 0.1,
      message: `Please enter a number less than  ${field.maxExclusive[VALUE_KEY]}!`,
    };
  }

  if (field.minLength) {
    options.minLength = {
      value: Number(field.minLength[VALUE_KEY]),
      message: `Input requires at least ${field.minLength[VALUE_KEY]} letters!`,
    };
  }
  if (field.maxLength) {
    options.maxLength = {
      value: Number(field.maxLength[VALUE_KEY]),
      message: `Input has exceeded maximum length of ${field.maxLength[VALUE_KEY]} letters!`,
    };
  }

  // For any custom patterns
  if (field.pattern) {
    // Change message if only digits are allowed
    const msg: string = field.pattern[VALUE_KEY] === "^\\d+$" ? `Only numerical inputs are allowed!` :
      `This field must follow the pattern ${field.pattern[VALUE_KEY]}`;
    options.pattern = {
      value: new RegExp(field.pattern[VALUE_KEY]),
      message: msg,
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
export function parseConcepts(concepts: OntologyConcept[], priority: string): OntologyConceptMappings {
  const results: OntologyConceptMappings = {};
  // Ensure that there is a root mapping to collect all parent's information
  results[ONTOLOGY_CONCEPT_ROOT] = [];
  // For handling the priority concept
  let priorityConcept: OntologyConcept;
  // Store the parent key value
  const parentNodes: string[] = [];

  concepts.forEach(concept => {
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
function sortRootConcepts(mappings: OntologyConceptMappings, priority: OntologyConcept, parentNodes: string[]): void {
  let priorityConcept: OntologyConcept;
  let parentConcepts: OntologyConcept[] = [];
  let childlessConcepts: OntologyConcept[] = [];
  // Process the concepts to map them
  mappings[ONTOLOGY_CONCEPT_ROOT].forEach(concept => {
    // Priority may either be a child or parent concept and we should store the right concept
    if (priority && (concept.type.value == priority.parent?.value || concept.label.value == priority.parent?.value
      || concept.label.value == priority.label?.value
    )) {
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
  parentConcepts = parentConcepts.sort((a, b) => a.label.value.localeCompare(b.label.value));
  childlessConcepts = childlessConcepts.sort((a, b) => a.label.value.localeCompare(b.label.value));
  // The final sequence should be the prioritised concept if available, followed by childless and then parent concepts.
  mappings[ONTOLOGY_CONCEPT_ROOT] = priorityConcept ? [priorityConcept, ...childlessConcepts, ...parentConcepts] :
    [...childlessConcepts, ...parentConcepts];
}

/**
  * Sorts the children concepts.
  * 
  * @param {OntologyConceptMappings} mappings Newly parsed mappings from the inputs.
  * @param {OntologyConcept} priority The priority concept that we must find and separate.
  */
function sortChildrenConcepts(mappings: OntologyConceptMappings, priority: OntologyConcept): void {
  // Extract an immutable list of parents to prevent further modifications
  const parents: string[] = mappings[ONTOLOGY_CONCEPT_ROOT].map((concept) => concept.type.value);
  Object.keys(mappings).forEach(parentKey => {
    // Ensure that this is not the root
    if (parentKey != ONTOLOGY_CONCEPT_ROOT) {
      // If the parent object does exist, sort the children
      if (parents.includes(parentKey)) {
        // Attempt to find the match concept
        const matchedConcept: OntologyConcept = mappings[parentKey].find(concept => concept.type?.value == priority?.type?.value);
        // Filter out the matching concept if it is present, and sort the children out
        const sortedChildren: OntologyConcept[] = mappings[parentKey].filter(concept => concept.type?.value != priority?.type?.value)
          .sort((a, b) => a.label.value.localeCompare(b.label.value));
        // Append the matching concept to the start if it is present
        if (matchedConcept) { sortedChildren.unshift(matchedConcept); }
        // Overwrite the mappings with the sorted mappings
        mappings[parentKey] = sortedChildren;
      } else {
        // If there is no parent object, these children should be at the root instead
        mappings[parentKey].forEach(concept => mappings[ONTOLOGY_CONCEPT_ROOT].push(concept));
        // Remove the key
        delete mappings[parentKey];
      }
    }
  })
}

/**
 * Retrieve the concept that matches the target value in the input mappings.
 * 
 * @param {OntologyConceptMappings} mappings The mappings of option values for the dropdown.
 * @param {string} targetValue The target value for matching with in the concept's type.
 */
export function getMatchingConcept(mappings: OntologyConceptMappings, targetValue: string): OntologyConcept {
  let match: OntologyConcept;
  Object.keys(mappings).forEach(key => {
    const matchedConcept: OntologyConcept = mappings[key].find(concept => concept.type?.value == targetValue);
    if (matchedConcept) {
      match = matchedConcept;
    }
  });
  return match;
}
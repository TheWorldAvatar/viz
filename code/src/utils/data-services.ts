import moment from 'moment';
import { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useFetchDataQuery, useFetchDimensionsQuery } from 'state/api/fia-api';
import { getHasExistingData, setHasExistingData } from 'state/floating-panel-slice';
import { getScenarioID } from 'state/map-feature-slice';
import { Attribute, AttributeGroup } from 'types/attribute';
import { JsonArray, JsonObject } from 'types/json';
import { ScenarioDimensionsData, TIME_CLASSES, TimeSeries } from 'types/timeseries';

const rootKey: string = "meta";
const displayOrderKey: string = "display_order";
const collapseKey: string = "collapse";
const valueKey: string = "value";
const unitKey: string = "unit";
const iriKey: string = "iri";
const stackKey: string = "stack";


/**
 * A utility function for generating the Feature Info Agent endpoint for a specific feature.
 * 
 * @param {string} iri The IRI of the target feature.
 * @param {string} stack The stack endpoint associated with the target feature.
 * @param {string} scenario The current scenario ID (if any).
*/
export function generateFIAEndpoint(iri: string, stack: string, scenario: string, filterTimes: number[], dimensionSliderValue?: number[] | number): string {
  let url = `${stack}/feature-info-agent/get?iri=${encodeURIComponent(iri)}`;

  // this is only used for trajectory queries, not the actual time series data
  if (filterTimes && filterTimes.length === 2) {
    url += `&lowerbound=${filterTimes[0]}`;
    url += `&upperbound=${filterTimes[1]}`;
  }

  if (scenario && stack && iri) {
    url = `${stack}/CReDoAccessAgent/getMetadataPrivate/${scenario}?iri=${encodeURIComponent(iri)}`;
    if (dimensionSliderValue) {
      url += `&time_index=${dimensionSliderValue.toString()}`;
    }
  }
  return url;
}


export const useScenarioDimensionsService = (scenarioURL: string): { scenarioDimensions: ScenarioDimensionsData; isDimensionsFetching: boolean } => {
  const selectedScenario = useSelector(getScenarioID);
  const scenarioDimensionsEndpoint = `${scenarioURL}/getScenarioTimes/${selectedScenario}`
  const { data, isFetching } = useFetchDimensionsQuery(scenarioDimensionsEndpoint);
  const [scenarioDimensions, setScenarioDimensions] = useState<ScenarioDimensionsData>({});
  const isDimensionsFetching = isFetching;
  useEffect(() => {
    if (!isFetching) {
      // If there is any data retrieved, set that first
      if (data) {
        setScenarioDimensions(data);
      }
    }
  }, [data, isFetching]);

  return { scenarioDimensions, isDimensionsFetching };
}

/**
 * Custom hook for fetching and processing feature information from the Feature Info Agent.
 * If no data is available in the response, it defaults to the inherent feature properties, excluding the 'iri' key.
 * 
 * @param {string} endpoint The target FIA endpoint.
 * @param {string} selectedIri The selected IRI.
 * @param {object} featureProperties The selected feature's inherent properties, which is used as a fallback.
 * 
 */
export const useFeatureInfoAgentService = (endpoint: string, selectedIri: string, featureProperties: object): { attributes: AttributeGroup; timeSeries: TimeSeries[]; isFetching: boolean, isUpdating: boolean } => {
  const dispatch = useDispatch();
  const { data, isFetching } = useFetchDataQuery(endpoint);

  const [queriedData, setQueriedData] = useState(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [attributes, setAttributes] = useState<AttributeGroup>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeries[]>(null);

  const hasExistingData: boolean = useSelector(getHasExistingData);

  useEffect(() => {
    if (!isFetching) {
      // If there is any data retrieved, set that first
      if (data && Object.keys(data).length !== 0) {
        setQueriedData(data);
      } else if (featureProperties) {
        // Else default to built-in data that excludes IRI
        const builtInData = {
          meta: {
            Properties: Object.fromEntries(
              Object.entries(featureProperties).filter(([key]) => key !== 'iri')
            ),
          },
        };
        setQueriedData(builtInData);
      }
    }
  }, [data, featureProperties, isFetching, endpoint]);

  useEffect(() => {
    setIsUpdating(true);
    if (queriedData?.meta && Object.keys(queriedData.meta).length > 0) {
      let latestAttributes: AttributeGroup;
      if (hasExistingData) {
        latestAttributes = recurseUpdateAttributeGroup(attributes, selectedIri, queriedData);
        dispatch(setHasExistingData(false));
      } else {
        latestAttributes = recurseParseAttributeGroup(queriedData, rootKey);
      }
      setAttributes(latestAttributes);
    }

    if (queriedData?.time && Object.keys(queriedData.time).length > 0) {
      const timeSeriesData: TimeSeries[] = parseTimeSeries(queriedData);
      setTimeSeries(timeSeriesData);
    }

    // Add a delay of 100ms delay so that the data can be properly propagated to the component
    setTimeout(() => {
      setIsUpdating(false);
    }, 100);
  }, [queriedData]);

  return { attributes, timeSeries, isFetching, isUpdating };
};

/**
 * Recursively searches for the attribute group of interest containing the update IRI, and
 * update its contents with with the updated data returned.
 *
 * @param {AttributeGroup} currentGroup The current attribute group that will be updated.
 * @param {string} updateIri The IRI of interest.
 * @param {JsonObject} updatedData The updated data that is retrieved and should be integrated into the target.
 */
function recurseUpdateAttributeGroup(currentGroup: AttributeGroup, updateIri: string, updatedData: JsonObject): AttributeGroup {
  // When the update IRI is present, replace the contents with the updated data
  if (containsUpdateIri(currentGroup, updateIri)) {
    const revisedAttributes: AttributeGroup = recurseParseAttributeGroup(updatedData, rootKey);
    revisedAttributes.name = currentGroup.name;
    return revisedAttributes;
  } else {
    // Otherwise, recursively look for the attribute group of interest
    const revisedSubGroups: AttributeGroup[] = [];
    currentGroup.subGroups.map(subGroup => {
      // If the current group contains the subgroup of interest, the isCollapsed must be set to false
      if (containsUpdateIri(subGroup, updateIri)) {
        currentGroup.isCollapsed = false;
      }
      const revisedAttributes: AttributeGroup = recurseUpdateAttributeGroup(subGroup, updateIri, updatedData);
      revisedSubGroups.push(revisedAttributes);
    })
    currentGroup.subGroups = revisedSubGroups;
  }
  return currentGroup;
}

/**
 * Recursively parse the data returned from the Feature Info Agent into the attribute group data model.
 *
 * @param {JsonObject} data The JSON data to parse.
 * @param {string} currentNode The current node that should be parsed.
 * @returns {AttributeGroup} The attribute group data model.
 */
function recurseParseAttributeGroup(data: JsonObject, currentNode: string): AttributeGroup {
  // Initialise new empty array to store the values
  const attributes: Attribute[] = [];
  const subGroups: AttributeGroup[] = [];
  // Retrieve the current node's data object
  const currentDataObject: JsonObject = JSON.parse(JSON.stringify(data[currentNode]));
  const keys: string[] = Object.keys(currentDataObject);

  // If property is included, assign it or defaults to false
  let isCollapsed: boolean = typeof currentDataObject[collapseKey] === "boolean" ? currentDataObject[collapseKey] : false;

  // When subqueries should be executed to retrieve more information, they will only have an iri that will be stored
  let subQueryIri: string;
  let subQueryStack: string;
  if (Object.hasOwn(currentDataObject, iriKey)) {
    // The header should always be collapsed
    isCollapsed = true;
    subQueryIri = currentDataObject[iriKey] as string;
    // Subqueries can still be executed within the same stack endpoint but will be overwritten if another stack is included
    if (Object.hasOwn(currentDataObject, stackKey)) {
      subQueryStack = currentDataObject[stackKey] as string;
    }
  }

  // Display order will follow the indicated order if a display_order property is passed. Else, it will follow the random order returned by the agent.
  const filterValues: string[] = [collapseKey, valueKey, unitKey];
  const displayOrder: string[] = Array.isArray(currentDataObject[displayOrderKey]) ?
    currentDataObject[displayOrderKey].map(item => JSON.stringify(item).replaceAll("\"", "")).filter(displayOrderKey => keys.includes(displayOrderKey)) : // Convert JSON array to string array without quotes
    keys.filter(key => !filterValues.includes(key)); // Filter out these values

  // Note that the elements will be pushed according to the display order and do not require further processing according to this order
  displayOrder.map((currentVal) => {

    const currentValue: JsonObject = currentDataObject[currentVal] as JsonObject;
    // Parses the attribute for nested values and units
    // Javascript falsy checks returns true for 0. But we wish to accept 0 too
    if (Object.hasOwn(currentValue, valueKey) && (currentValue[valueKey] || currentValue[valueKey] === 0)) {
      const unit: string = currentValue[unitKey] ? currentValue[unitKey].toString() : "";
      attributes.push(parseAttribute(currentVal, currentValue[valueKey].toString(), unit))
    } else {
      if (typeof currentValue === "string" || typeof currentValue === "number") { attributes.push(parseAttribute(currentVal, currentValue)) }
      else {
        subGroups.push(recurseParseAttributeGroup(currentDataObject, currentVal));
      }
    }
  });

  const currentGroup: AttributeGroup = {
    name: currentNode,
    attributes: attributes,
    subGroups: subGroups,
    displayOrder: displayOrder,
    isCollapsed: isCollapsed,
    subQueryIri: subQueryIri,
    subQueryStack: subQueryStack,
  };
  return currentGroup;
}

const optionalUnitPattern: RegExp = /\[(.*?)\]/;
const valuePattern: RegExp = /"(\d+(?:\.\d+)?)".*/;

/**
 * Parses an attribute.
 *
 * @param {string} property The attribute name.
 * @param {string} value The attribute value.
 * @param {string} unit Optional attribute unit.
 * @returns {Attribute} The parsed attribute.
 */
function parseAttribute(property: string, value: string | number, unit?: string): Attribute {
  let parsedVal: string | number = value;
  let parsedUnit: string = unit;

  if (typeof value === "string" && value.startsWith("\"")) {
    // Extract the value pattern first from the RDF literal
    let match: RegExpExecArray | null = valuePattern.exec(value);
    if (match) { parsedVal = match[1]; }
    // Extract the optional unit pattern from the RDF literal
    match = optionalUnitPattern.exec(value);
    if (match) { parsedUnit = match[1]; }
  }

  return {
    name: property,
    value: parsedVal,
    unit: parsedUnit,
  };
}

/**
 * Parse the time series data returned into the time series group data model.
 *
 * @param {JsonObject} data The JSON data to parse.
 * @returns {TimeSeries[]} The required data model.
 */
function parseTimeSeries(data: JsonObject): TimeSeries[] {
  // Initialise new empty array to store the values
  const timeSeriesArray: TimeSeries[] = [];

  // Parse data response to comply with typescript
  const timeData: JsonArray = JSON.parse(JSON.stringify(data.time));

  timeData.forEach(ts => {
    const rawTimeArray: number[] = JSON.parse(JSON.stringify(ts.time));
    let momentArray: moment.Moment[];
    if (TIME_CLASSES.includes(ts.timeClass as string)) {
      momentArray = rawTimeArray.map(t => moment(t));
    } else {
      momentArray = [];
    }

    const tsNames: Array<string> = JSON.parse(JSON.stringify(ts.data));
    const tsValues: Array<Array<number>> = JSON.parse(JSON.stringify(ts.values));
    const tsValuesClass: Array<string> = JSON.parse(JSON.stringify(ts.valuesClass));
    const tsUnits: Array<string> = JSON.parse(JSON.stringify(ts.units));

    tsNames.forEach((name, index) => {
      timeSeriesArray.push({
        name: name,
        momentTimes: momentArray,
        times: rawTimeArray,
        values: tsValues[index],
        valuesClass: tsValuesClass[index],
        timeClass: ts.timeClass as string,
        unit: tsUnits[index]
      });
    });
  });

  return timeSeriesArray;
}

/**
 * Verifies if the group contains the update IRI.
 *
 * @param {AttributeGroup} group The target attribute group.
 * @param {string} updateIri The IRI of interest.
 */
function containsUpdateIri(group: AttributeGroup, updateIri: string): boolean {
  return group.attributes.some(attr => attr.name === "iri" && attr.value === updateIri);
}
/**
 * Utilities to be run on the client.
 */
import { Dispatch } from "redux";

import { DataParser } from "io/data/data-parser";
import { DataStore } from "io/data/data-store";
import {
  MapFeaturePayload,
  clearFeatures,
  setIri,
  setProperties,
  setStack,
} from "state/map-feature-slice";
import {
  LifecycleStage,
  RegistryFieldValues,
  SparqlResponseField,
} from "types/form";
import { JsonObject } from "types/json";
import { DateRange } from "react-day-picker";
import { Map } from "mapbox-gl";
import { DataLayer } from 'io/data/data-layer';

/**
 * Open full screen mode.
 */

export function openFullscreen() {
  const elem = document?.documentElement;
  if (elem?.requestFullscreen) {
    elem.requestFullscreen();
  }
}

/**
 * Close fullscreen mode.
 */
export function closeFullscreen() {
  if (document?.exitFullscreen) {
    document.exitFullscreen();
  }
}

/**
 * Parses the contents of the data.json file into class instances for setting the map.
 *
 * @param dataSettings Map data settings.
 * @param mapType The type of map. Either Cesium or Mapbox
 * @returns The data model required for visualisation.
 */
export function parseMapDataSettings(
  dataSettings: JsonObject,
  mapType: string
): DataStore {
  return new DataParser(mapType).loadData(dataSettings);
}

/**
 * Set the selected feature and its required properties in Redux state for global access.
 *
 * @param {MapFeaturePayload} selectedFeature The feature of interest.
 * @param {Dispatch<any>} dispatch The dispatch function from Redux for dispatching actions.
 */
export function setSelectedFeature(
  selectedFeature: MapFeaturePayload,
  map: Map,
  dispatch: Dispatch
): void {
  if (selectedFeature) {
    // Disable linting as we wish to remove layer but do not require it in this function
    const { _layer, stack, iri, ...selectedProperties } = selectedFeature;
    if (!iri) {
      console.warn("IRI is missing. Data fetching will be skipped.");
    } else if (!stack) {
      console.warn(
        "Feature does not have a defined stack. Data fetching will be skipped."
      );
    }
    dispatch(setIri(iri));
    dispatch(setProperties(selectedProperties));
    dispatch(setStack(stack));
    dispatch(clearFeatures());
  }
}

/**
 * Check if an accompanying highlight layer exists, if it exists, make it visible and only show the selected feature
 * @param selectedFeature 
 * @param map 
 * @param dataStore 
 */
export function highlightFeature(selectedFeature: MapFeaturePayload, map: Map, dataStore: DataStore) {

  const layerArray: DataLayer[] = dataStore?.getLayerList();
  const layerContainingFeature = layerArray.find(layer => layer.id === selectedFeature.layerId);

  if (layerContainingFeature.hasHighlight) {
    const highlightLayer = layerArray.find(layer => layer.id === selectedFeature.layerId + '-highlight');
    map.setFilter(highlightLayer.id, ['in', highlightLayer.highlightFeatureId, selectedFeature[highlightLayer.highlightFeatureId]]);
    map.setLayoutProperty(highlightLayer.id, "visibility", "visible");
  }
}

/**
 * Capitalises the words.
 *
 * @param {string} str input string.
 */
export function parseWordsForLabels(str: string): string {
  if (isValidIRI(str)) {
    return getAfterDelimiter(str, "/");
  }
  return str
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Replaces all white spaces with _ to ensure it is valid for urls
 *
 * @param {string} str input string.
 */
export function parseStringsForUrls(str: string): string {
  return str.trim().replace(/\s+/g, "_");
}

/**
 * Retrieves the ID from input.
 *
 * @param {string} input input string.
 */
export function getId(input: string): string {
  return isValidIRI(input) ? getAfterDelimiter(input, "/") : input;
}

/**
 * Checks that the input iri is valid.
 *
 * @param {string} iri input iri.
 */
export function isValidIRI(iri: string): boolean {
  // eslint-disable-next-line
  const iriPattern = /^(https?|ftp|mailto|file|data|irc|tel|urn|uuid|doi):((\/\/[^\/?#]*)?[^?#]*)(\?[^#]*)?(#.*)?$/i;
  return iriPattern.test(iri);
}

/**
 * Retrieves the string following the delimiter if it exists. Otherwise returns the string as is.
 *
 * @param {string} str input string.
 * @param {string} delimiter delimiter of interest.
 */
export function getAfterDelimiter(str: string, delimiter: string): string {
  return str.includes(delimiter) ? str.split(delimiter).pop() : str;
}

/**
 * Get the value from the target SPARQL response.
 *
 * @param {SparqlResponseField} response The target SPARQL response.
 */
export function getSparqlResponseValue(response: SparqlResponseField): string {
  return response.value;
}

/**
 * Extract the target field as a Response Field Object from the response.
 *
 * @param {RegistryFieldValues} response The response.
 * @param {string} field The target field of interest.
 * @param {boolean} getFirstArrayField Optional indicator to retrieve the first array field if required.
 */
export function extractResponseField(
  response: RegistryFieldValues,
  field: string,
  getFirstArrayField?: boolean
): SparqlResponseField {
  if (Array.isArray(response[field])) {
    if (getFirstArrayField) {
      return response[field][0];
    } else {
      console.warn(
        `Detected that field ${field} is an array! Skipping field...`
      );
      return null;
    }
  } else {
    return response[field];
  }
}

/**
 * Extract the inital date based on the current lifecycle stage.
 *
 * @param {LifecycleStage} lifecycleStage The lifecycle stage of interest.
 */
export function getInitialDateFromLifecycleStage(
  lifecycleStage: LifecycleStage
): DateRange {
  // For closed and other stages: start with today
  const initialDate: Date = new Date();

  if (lifecycleStage === "scheduled") {
    // For scheduled: start with tomorrow since today and past are disabled
    initialDate.setDate(initialDate.getDate() + 1);
  }

  return { from: initialDate, to: initialDate };
}

/**

=======
  * Compares the target and reference date to verify if they are before or after each other. Note that this function returns true if they are equivalent.
  *
  * @param {string} targetDate The target date for comparison.
  * @param {boolean} isAfter Verifies if the target date occurs after the reference date.
  * @param {string} refDate An optional reference date for the comparison. If empty, it will default to today.
*/
export function compareDates(
  targetDate: string,
  isAfter: boolean,
  refDate?: string,

): boolean {
  const targetDateObject = new Date(targetDate);
  // Defaults to today if reference date is not provided
  const refDateObject = refDate ? new Date(refDate) : new Date();
  // Equivalent dates will return true
  if (targetDateObject.toDateString() === refDateObject.toDateString()) {
    return true;
  }
  if (isAfter) {
    return targetDateObject >= refDateObject;
  }
  return targetDateObject <= refDateObject;
}

/**
 * Get initial date ie today.
 */
export function getInitialDate(): DateRange {
  const currentDate: Date = new Date();
  return {
    from: currentDate,
    to: currentDate,
  }
}

/**
  * Get the UTC date from the date input.
  * 
  * @param {Date} date The target date.
  */
export function getUTCDate(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    )
  );
}

/**
  * Get the normalized date format in yyyy-mm-dd from the date input.
  * 
  * @param {Date} date The target date.
  */
export function getNormalizedDate(date: Date): string {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { AgentResponseBody, InternalApiIdentifierMap } from "types/backend-agent";
import { FormTemplateType, PROPERTY_GROUP_TYPE, PROPERTY_SHAPE_TYPE, PropertyGroup, PropertyShape, TYPE_KEY, VALUE_KEY } from "types/form";
import { FORM_STATES, updateLatLong } from "ui/interaction/form/form-utils";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";
import { ExistingCoordinatesDescriptor, useExistingLocationCoordinates } from "./useExistingLocationCoordinates";

export interface GeocodeTemplateDescriptor {
  isFetching: boolean;
  postalCodeShape: PropertyShape;
  addressShapes: PropertyShape[];
}
/**
  * A custom hook to initialise and retrieve all related geocoding templates for the geocoder.
  *
  * @param {PropertyShape} field The SHACL restrictions for geolocation.
  * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
*/
export function useGeocodeTemplate(
  field: PropertyShape,
  form: UseFormReturn,
): GeocodeTemplateDescriptor {
  const postalCode: string = "postal code";
  const latLongRegex: RegExp = /^POINT\(\s*-?([0-9]{1,2}|1[0-7][0-9]|180)(\.[0-9]{1,10})?\s-?([0-8]?[0-9]|90)(\.[0-9]{1,10})?\)$/;
  const [postalCodeShape, setPostalCodeShape] = useState<PropertyShape>(null);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [defaultCoordinates, setDefaultCoordinates] = useState<string[]>(null);
  const [addressShapes, setAddressShapes] = useState<PropertyShape[]>([]);

  const formType: string = form.getValues(FORM_STATES.FORM_TYPE);
  const { isFetching: isFetchingExistingCoordinates, coordinates }: ExistingCoordinatesDescriptor = useExistingLocationCoordinates(Array.isArray(field.defaultValue)
    ? field.defaultValue?.[0].value
    : field.defaultValue?.value, formType);

  useEffect(() => {
    // Declare an async function to get all address related shapes
    const getAddressShapes = async (
      locationIdentifier: string
    ): Promise<void> => {
      const resBody: AgentResponseBody = await queryInternalApi(
        makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.FORM, locationIdentifier)
      );
      const template: FormTemplateType = resBody?.data?.items?.[0] as FormTemplateType;

      // Retrieve and store the default coordinates set via the geopoint if available
      const geopointShape: PropertyShape = template.property.find(
        (field) => field[TYPE_KEY].includes(PROPERTY_SHAPE_TYPE) &&
          (field as PropertyShape).name[VALUE_KEY] === "geopoint"
      ) as PropertyShape;

      if (geopointShape.defaultValue) {
        const wktPoint: string = Array.isArray(geopointShape.defaultValue)
          ? geopointShape.defaultValue?.[0].value
          : geopointShape.defaultValue?.value;
        const match = wktPoint.match(latLongRegex);

        if (match) {
          const longitude: string = match[1] + match[2];
          const latitude: string = match[3] + match[4];
          setDefaultCoordinates([longitude, latitude]);
        }
      }

      const addressField: PropertyGroup = template.property.find(
        (field) =>
          field[TYPE_KEY].includes(PROPERTY_GROUP_TYPE) &&
          (field as PropertyGroup).label[VALUE_KEY] === "address"
      ) as PropertyGroup;

      const addressProperties: PropertyShape[] = addressField.property.map(
        (field) => {
          return {
            ...field,
            fieldId: field.name[VALUE_KEY],
          };
        }
      );
      // Search for postal code shape
      const postalCodeShape: PropertyShape = addressProperties.find((field) => field.fieldId === postalCode);
      delete postalCodeShape.minCount;
      setPostalCodeShape(postalCodeShape);
      // Get all address related shape that isnt the id or postal code
      setAddressShapes(
        addressProperties.filter(
          (field) => field.fieldId != "id" && field.fieldId != postalCode
        ).map(field => {
          delete field.minCount;
          return field;
        })
      );
    };

    setIsFetching(true);
    if (formType == "add" || formType == "edit") {
      getAddressShapes(field.name[VALUE_KEY]);
    }
    setIsFetching(false);
  }, []);

  // Set the initial coordinates within the form
  useEffect(() => {
    setIsFetching(true);
    let latitude: string = "";
    let longitude: string = "";
    // If there are existing coordinates, they should always be set first
    if (!isFetchingExistingCoordinates && coordinates.length === 2) {
      latitude = coordinates[1].toString();
      longitude = coordinates[0].toString();
      // Defaults to the default coordinates if the user has set them
    } else if (!isFetchingExistingCoordinates && defaultCoordinates) {
      latitude = defaultCoordinates[1];
      longitude = defaultCoordinates[0];
    }
    updateLatLong(field.fieldId, latitude, longitude, form);
    setIsFetching(false);
  }, [coordinates, defaultCoordinates]);

  return {
    isFetching: isFetching || isFetchingExistingCoordinates,
    postalCodeShape,
    addressShapes,
  }
}

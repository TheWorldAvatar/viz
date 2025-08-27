import React, { useEffect, useRef, useState } from "react";
import {
  FieldValues,
  set,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form";

import { useDictionary } from "hooks/useDictionary";
import { Address } from "types/address";
import { Dictionary } from "types/dictionary";
import {
  FormTemplateType,
  PROPERTY_GROUP_TYPE,
  PROPERTY_SHAPE_TYPE,
  PropertyGroup,
  PropertyShape,
  TYPE_KEY,
  VALUE_KEY,
} from "types/form";
import LoadingSpinner from "ui/graphic/loader/spinner";
import GeocodeMapContainer from "ui/map/geocode/geocode-map-container";
import ErrorComponent from "ui/text/error/error";
import { parseWordsForLabels } from "utils/client-utils";
import FormFieldComponent from "../field/form-field";
import { FORM_STATES } from "../form-utils";
import { makeInternalRegistryAPIwithParams } from "utils/internal-api-services";
import Button from "ui/interaction/button";
import { AgentResponseBody } from "types/backend-agent";

interface FormGeocoderProps {
  field: PropertyShape;
  form: UseFormReturn;
}

/**
 * This component renders a geocoding section for the form.
 *
 * @param {PropertyShape} field The SHACL restrictions for geolocation.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 */
export default function FormGeocoder(props: Readonly<FormGeocoderProps>) {
  const formType: string = props.form.getValues(FORM_STATES.FORM_TYPE);
  const dict: Dictionary = useDictionary();

  const postalCode: string = "postal code";
  const latitudeShape: PropertyShape = {
    "@id": "_:latitude",
    "@type": "http://www.w3.org/ns/shacl#PropertyShape",
    name: {
      "@value": FORM_STATES.LATITUDE,
    },
    description: {
      "@value": `${dict.form.latDesc} ${props.field.name[VALUE_KEY]}`,
    },
    datatype: "decimal",
    fieldId: FORM_STATES.LATITUDE,
    order: 10,
    step: {
      "@value": "0.00000001",
      "@type": "http://www.w3.org/2001/XMLSchema#decimal",
    },
    minCount: {
      "@value": "1",
      "@type": "http://www.w3.org/2001/XMLSchema#integer",
    },
    maxCount: {
      "@value": "1",
      "@type": "http://www.w3.org/2001/XMLSchema#integer",
    },
  };

  const longitudeShape: PropertyShape = {
    "@id": "_:longitude",
    "@type": "http://www.w3.org/ns/shacl#PropertyShape",
    name: {
      "@value": FORM_STATES.LONGITUDE,
    },
    description: {
      "@value": `${dict.form.longDesc} ${props.field.name[VALUE_KEY]}`,
    },
    fieldId: FORM_STATES.LONGITUDE,
    order: 11,
    step: {
      "@value": "0.00000001",
      "@type": "http://www.w3.org/2001/XMLSchema#decimal",
    },
    datatype: "decimal",
    minCount: {
      "@value": "1",
      "@type": "http://www.w3.org/2001/XMLSchema#integer",
    },
    maxCount: {
      "@value": "1",
      "@type": "http://www.w3.org/2001/XMLSchema#integer",
    },
  };

  const isInitialFetching: React.RefObject<boolean> = useRef<boolean>(true);
  const [isEmptyAddress, setIsEmptyAddress] = useState<boolean>(false);
  const [hasGeolocation, setHasGeolocation] = useState<boolean>(false);
  const [addressShapes, setAddressShapes] = useState<PropertyShape[]>([]);
  const [postalCodeShape, setPostalCodeShape] = useState<PropertyShape>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address>(null);
  const [isMapSelected, setIsMapSelected] = useState<boolean>(false);
  const [defaultCoordinates, setDefaultCoordinates] = useState<string[]>(null);

  useEffect(() => {
    // Declare an async function to get all address related shapes
    const getAddressShapes = async (
      locationIdentifier: string
    ): Promise<void> => {
      isInitialFetching.current = true;
      const res = await fetch(
        makeInternalRegistryAPIwithParams("form", locationIdentifier),
        {
          cache: "no-store",
          credentials: "same-origin",
        }
      );
      const resBody: AgentResponseBody = await res.json();
      const template: FormTemplateType = resBody?.data
        ?.items?.[0] as FormTemplateType;

      const geopointShape: PropertyShape = template.property.find(
        (field) =>
          field[TYPE_KEY].includes(PROPERTY_SHAPE_TYPE) &&
          (field as PropertyShape).name[VALUE_KEY] === "geopoint"
      ) as PropertyShape;

      if (geopointShape.defaultValue) {
        const wktPoint: string = Array.isArray(geopointShape.defaultValue)
          ? geopointShape.defaultValue?.[0].value
          : geopointShape.defaultValue?.value;

        const latLongRegex = /POINT\(\s*(-?\d+(\.\d+)?)\s+(-?\d+(\.\d+)?)\s*\)/;
        const match = wktPoint.match(latLongRegex);

        if (match) {
          const longitude = match[1];
          const latitude = match[3];
          setDefaultCoordinates([latitude, longitude]);
          props.form.setValue(FORM_STATES.LATITUDE, latitude);
          props.form.setValue(FORM_STATES.LONGITUDE, longitude);
          props.form.setValue(props.field.fieldId, wktPoint);
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
      setPostalCodeShape(
        addressProperties.find((field) => field.fieldId === postalCode)
      );
      // Get all address related shape that isnt the id or postal code
      setAddressShapes(
        addressProperties.filter(
          (field) => field.fieldId != "id" && field.fieldId != postalCode
        )
      );
      isInitialFetching.current = false;
    };

    // Declare an async function to get geocoordinates associated with the location
    const getGeoCoordinates = async (location: string): Promise<void> => {
      isInitialFetching.current = true;
      const res = await fetch(
        makeInternalRegistryAPIwithParams("geodecode", location),
        {
          cache: "no-store",
          credentials: "same-origin",
        }
      );
      const resBody: AgentResponseBody = await res.json();
      const coordinates: number[] = (
        resBody.data?.items as Record<string, unknown>[]
      )?.[0]?.coordinates as number[];
      if (coordinates.length === 2) {
        // Geolocation is in longitude(x), latitude(y) format
        setHasGeolocation(true);
        props.form.setValue(FORM_STATES.LATITUDE, coordinates[1].toString());
        props.form.setValue(FORM_STATES.LONGITUDE, coordinates[0].toString());
        props.form.setValue(
          props.field.fieldId,
          `POINT(${coordinates[0]}, ${coordinates[1]})`
        );
      }
      isInitialFetching.current = false;
    };

    if (formType == "add" || formType == "edit") {
      getAddressShapes(props.field.name[VALUE_KEY]);
    }
    if (formType == "view" || formType == "edit") {
      getGeoCoordinates(
        Array.isArray(props.field.defaultValue)
          ? props.field.defaultValue?.[0].value
          : props.field.defaultValue?.value
      );
    }
  }, []);

  /**
   * A submit action to search for the address based on a postal code
   *
   * @param {FieldValues} data Values inputed into the form fields.
   */
  const onSearchForAddress: SubmitHandler<FieldValues> = async (
    data: FieldValues
  ) => {
    // Switch to postal code mode
    setIsMapSelected(false);
    // Reset states
    setAddresses([]);
    setSelectedAddress(null);
    setIsEmptyAddress(false);
    setHasGeolocation(false);
    // Start search
    const results: AgentResponseBody = await fetch(
      makeInternalRegistryAPIwithParams("address", data[postalCode]),
      {
        cache: "no-store",
        credentials: "same-origin",
      }
    ).then((response) => response.json());
    if (results.data?.message) {
      setIsEmptyAddress(true);
      // Clear address fields when no address is found
      addressShapes.forEach((shape) => {
        props.form.setValue(shape.fieldId, "");
      });
      // Also clear coordinates
      props.form.setValue(FORM_STATES.LATITUDE, "");
      props.form.setValue(FORM_STATES.LONGITUDE, "");
      props.form.setValue(props.field.fieldId, "");
    } else {
      setAddresses(
        (results.data?.items as Record<string, unknown>[]).map((address) => {
          return {
            block: (address.block as string) ?? null,
            street: address.street as string,
            city: address.city as string,
            country: address.country as string,
          };
        })
      );
    }
  };

  /**
   * Enable direct map selection without requiring postal code or address data.
   * This shows the map interface for users to click and select a location.
   */
  const onSelectFromMap = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent form submission
    event.preventDefault();
    event.stopPropagation();

    // Switch to map selection mode
    setIsMapSelected(true);
    // Reset address search states but keep selected address to show fields
    setAddresses([]);
    setIsEmptyAddress(false);

    // Clear postal code if switching from postal code mode
    if (postalCodeShape) {
      props.form.setValue(postalCode, "");
    }

    // Check if we already have coordinates from postal code selection
    // This will set the coordinates to the one selected from the post code
    // Otherwise it will use the default one
    const existingLat = props.form.getValues(FORM_STATES.LATITUDE);
    const existingLng = props.form.getValues(FORM_STATES.LONGITUDE);

    if (
      !existingLat ||
      !existingLng ||
      existingLat === "" ||
      existingLng === ""
    ) {
      props.form.setValue(FORM_STATES.LATITUDE, defaultCoordinates[0]);
      props.form.setValue(FORM_STATES.LONGITUDE, defaultCoordinates[1]);
    } else {
      props.form.setValue(FORM_STATES.LATITUDE, existingLat);
      props.form.setValue(FORM_STATES.LONGITUDE, existingLng);
    }

    // Enable the map interface
    setHasGeolocation(true);
  };

  /**
   * Switch back to postal code selection mode
   */
  const onSelectPostCode = () => {
    setIsMapSelected(false);
    // Just hide the map interface, don't clear coordinates
    setHasGeolocation(false);
  };

  // A click action to set the selected address
  const handleAddressClick = async (address: Address) => {
    // Set default values based on the clicked address
    addressShapes.map((shape) => {
      let defaultVal: string;
      if (shape.fieldId.includes("block")) {
        defaultVal = address.block;
      } else if (shape.fieldId.includes("city")) {
        defaultVal = address.city;
      } else if (shape.fieldId.includes("country")) {
        defaultVal = address.country;
      } else if (shape.fieldId.includes("street")) {
        defaultVal = address.street;
      }
      props.form.setValue(shape.fieldId, defaultVal);
    });
    setSelectedAddress(address);

    // Automatically geocode the selected address to get coordinates
    const postalCodeValue = props.form.getValues(postalCode);
    const internalApiPaths: string[] = [
      // First by postal code
      makeInternalRegistryAPIwithParams("geocode_postal", postalCodeValue),
      // If no coordinates are found, search by block (if available) and street name
      makeInternalRegistryAPIwithParams(
        "geocode_address",
        address.block,
        address.street
      ),
      // If no coordinates are found, search for any coordinate in the same city and country
      makeInternalRegistryAPIwithParams(
        "geocode_city",
        address.city,
        address.country
      ),
    ];

    for (const url of internalApiPaths) {
      const res = await fetch(url, {
        cache: "no-store",
        credentials: "same-origin",
      });

      const resBody: AgentResponseBody = await res.json();
      const coordinates: number[] = (
        resBody.data?.items as Record<string, unknown>[]
      )?.[0]?.coordinates as number[];
      if (coordinates.length === 2) {
        // Geolocation is in longitude(x), latitude(y) format
        props.form.setValue(FORM_STATES.LATITUDE, coordinates[1].toString());
        props.form.setValue(FORM_STATES.LONGITUDE, coordinates[0].toString());
        props.form.setValue(
          props.field.fieldId,
          `POINT(${coordinates[0]}, ${coordinates[1]})`
        );
        break;
      }
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold text-foreground">
        {parseWordsForLabels(props.field.name[VALUE_KEY])}
      </h2>
      {isInitialFetching.current && (
        <div className="mr-2">
          <LoadingSpinner isSmall={true} />
        </div>
      )}
      {!isInitialFetching.current &&
        (formType == "add" || formType == "edit") && (
          <div className="flex my-4 gap-1.5 flex-wrap">
            <Button
              leftIcon="search"
              label={dict.action.searchByPostCode}
              variant={isMapSelected ? "secondary" : "primary"}
              tooltipText={dict.action.searchByPostCode}
              onClick={onSelectPostCode}
              type="button"
            />
            <Button
              leftIcon="place"
              label={dict.action.selectLocation}
              variant={isMapSelected ? "primary" : "secondary"}
              tooltipText={dict.action.selectLocation}
              onClick={onSelectFromMap}
              type="button"
            />
          </div>
        )}

      {!isMapSelected && (
        <div className="flex items-center gap-2 mb-2">
          {postalCodeShape && (
            <FormFieldComponent field={postalCodeShape} form={props.form} />
          )}

          {!isInitialFetching.current &&
            (formType == "add" || formType == "edit") && (
              <div className="flex mt-12">
                <Button
                  leftIcon="search"
                  size="icon"
                  tooltipText={dict.action.findAddress}
                  onClick={props.form.handleSubmit(onSearchForAddress)}
                  type="button"
                />
              </div>
            )}
        </div>
      )}

      {!isMapSelected && isEmptyAddress && (
        <div className="m-2">
          <ErrorComponent message={dict.message.noAddressFound} />
        </div>
      )}
      {!isMapSelected && addresses.length > 0 && !selectedAddress && (
        <div className="flex flex-wrap w-fit gap-2">
          {addresses.map((address, index) => (
            <button
              key={address.street + index}
              className="cursor-pointer overflow-hidden whitespace-nowrap flex text-center w-fit p-2 text-base md:text-lg text-foreground bg-background border-1 border-border rounded-lg hover:bg-primary transition-colors duration-200"
              onClick={() => handleAddressClick(address)}
            >
              {String.fromCharCode(62)} {address.block}{" "}
              {parseWordsForLabels(address.street)}, {address.city}
            </button>
          ))}
        </div>
      )}
      {addressShapes.length > 0 &&
        ((!isMapSelected && (selectedAddress || isEmptyAddress)) ||
          (isMapSelected && selectedAddress)) && (
          <div className="flex flex-wrap w-full p-0 m-0">
            {addressShapes.map((shape, index) => (
              <FormFieldComponent
                key={shape.fieldId + index}
                field={shape}
                form={props.form}
              />
            ))}
          </div>
        )}
      {hasGeolocation && (
        <div className="flex flex-wrap w-full">
          <GeocodeMapContainer
            form={props.form}
            fieldId={props.field.fieldId}
          />
          <FormFieldComponent
            field={latitudeShape}
            form={props.form}
            options={{
              disabled: formType == "view" || formType == "delete",
            }}
          />
          <FormFieldComponent
            field={longitudeShape}
            form={props.form}
            options={{
              disabled: formType == "view" || formType == "delete",
            }}
          />
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { FieldValues, SubmitHandler, UseFormReturn } from "react-hook-form";

import { useDictionary } from "hooks/useDictionary";
import { Address } from "types/address";
import { Dictionary } from "types/dictionary";
import {
  FormTemplateType,
  PROPERTY_GROUP_TYPE,
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
      const template: FormTemplateType = await res.json();
      const addressField: PropertyGroup = template.property.find((field) => {
        if (field[TYPE_KEY].includes(PROPERTY_GROUP_TYPE)) {
          const fieldset: PropertyGroup = field as PropertyGroup;
          if (fieldset.label[VALUE_KEY] === "address") {
            return true;
          }
        }
        return false;
      }) as PropertyGroup;
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
      const coordinates: number[] = await res.json();
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
    // Reset states
    setAddresses([]);
    setSelectedAddress(null);
    setIsEmptyAddress(false);
    // Start search
    const results = await fetch(
      makeInternalRegistryAPIwithParams("address", data[postalCode]),
      {
        cache: "no-store",
        credentials: "same-origin",
      }
    ).then((response) => response.text());
    if (
      results ==
      "There are no address associated with the parameters in the knowledge graph."
    ) {
      setIsEmptyAddress(true);
    } else {
      setAddresses(JSON.parse(results));
    }
  };

  /**
   * A submit action to search for the geocoordinates based on address components.
   *
   * @param {FieldValues} data Values inputed into the form fields.
   */
  const onGeocoding: SubmitHandler<FieldValues> = async (data: FieldValues) => {
    // Reset location
    setHasGeolocation(false);
    // Searches for geolocation in the following steps
    const internalApiPaths: string[] = [
      // First by postal code
      makeInternalRegistryAPIwithParams("geocode_postal", data[postalCode]),
      // If no coordinates are found, search by block (if available) and street name
      makeInternalRegistryAPIwithParams(
        "geocode_address",
        data.block,
        data.street
      ),
      // If no coordinates are found, search for any coordinate in the same city and country
      makeInternalRegistryAPIwithParams(
        "geocode_city",
        data.city,
        data.country
      ),
    ];

    for (const url of internalApiPaths) {
      const res = await fetch(url, {
        cache: "no-store",
        credentials: "same-origin",
      });
      const coordinates: number[] = await res.json();
      if (coordinates.length === 2) {
        // Geolocation is in longitude(x), latitude(y) format
        setHasGeolocation(true);
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

  // A click action to set the selected address
  const handleAddressClick = (address: Address) => {
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
      {postalCodeShape && (
        <FormFieldComponent field={postalCodeShape} form={props.form} />
      )}
      {!isInitialFetching.current &&
        (formType == "add" || formType == "edit") && (
          <div className="flex my-4 gap-1 ">
            <Button
              leftIcon="search"
              size="icon"
              tooltipText={dict.action.findAddress}
              onClick={props.form.handleSubmit(onSearchForAddress)}
            />
            {addressShapes.length > 0 &&
              (selectedAddress || isEmptyAddress) && (
                <Button
                  leftIcon="edit_location"
                  label="Select Location"
                  size="sm"
                  tooltipText={dict.action.selectLocation}
                  onClick={props.form.handleSubmit(onGeocoding)}
                />
              )}
          </div>
        )}
      {isEmptyAddress && (
        <div className="m-2">
          <ErrorComponent message={dict.message.noAddressFound} />
        </div>
      )}
      {addresses.length > 0 && !selectedAddress && (
        <div className="grid grid-col-1 lg:grid-cols-2  w-fit my-2 gap-2 ">
          {addresses.map((address, index) => (
            <button
              key={address.street + index}
              className="cursor-pointer overflow-hidden whitespace-nowrap flex text-center p-2 text-sm md:text-lg text-foreground bg-background border-1 border-border rounded-lg hover:bg-primary transition-colors duration-200"
              onClick={() => handleAddressClick(address)}
            >
              {String.fromCharCode(62)} {address.block}{" "}
              {parseWordsForLabels(address.street)}, {address.city}
            </button>
          ))}
        </div>
      )}
      {addressShapes.length > 0 && (selectedAddress || isEmptyAddress) && (
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

import styles from '../form.module.css';

import React, { useEffect, useRef, useState } from 'react';
import { FieldValues, SubmitHandler, UseFormReturn } from 'react-hook-form';

import { Address } from 'types/address';
import { FormTemplate, PROPERTY_GROUP_TYPE, PropertyGroup, PropertyShape, TYPE_KEY, VALUE_KEY } from 'types/form';
import { parseWordsForLabels } from 'utils/client-utils';
import { getFormTemplate, getGeolocation, sendGetRequest } from 'utils/server-actions';
import MaterialIconButton from 'ui/graphic/icon/icon-button';
import LoadingSpinner from 'ui/graphic/loader/spinner';
import FormFieldComponent from '../field/form-field';

interface FormGeocoderProps {
  agentApi: string;
  field: PropertyShape;
  form: UseFormReturn;
  options?: {
    disabled?: boolean;
  };
}

/**
 * This component renders a geocoding section for the form.
 * 
 * @param {string} agentApi The target agent endpoint for any registry related functionalities.
 * @param {PropertyShape} field The SHACL restrictions for geolocation.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {boolean} options.disabled Optional indicator if the fields should be disabled. Defaults to false.
 */
export default function FormGeocoder(props: Readonly<FormGeocoderProps>) {
  const postalCode: string = "postal code";
  const postalCodeUnderscored: string = "postal_code";

  const isInitialFetching: React.MutableRefObject<boolean> = useRef<boolean>(true);
  const [addressShapes, setAddressShapes] = useState<PropertyShape[]>([]);
  const [postalCodeShape, setPostalCodeShape] = useState<PropertyShape>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address>(null);
  const [geolocation, setGeolocation] = useState<number[]>([]);

  useEffect(() => {
    // Declare an async function to get all address related shapes
    const getAddressShapes = async (agentApi: string, locationIdentifier: string): Promise<void> => {
      isInitialFetching.current = true;
      // The location resource must mapped to the field name on the backend
      const template: FormTemplate = await getFormTemplate(agentApi, locationIdentifier.replace(/\s+/g, "_"))
      const addressField: PropertyGroup = template.property.find(field => {
        if (field[TYPE_KEY].includes(PROPERTY_GROUP_TYPE)) {
          const fieldset: PropertyGroup = field as PropertyGroup;
          if (fieldset.label[VALUE_KEY] === "address") {
            return true;
          }
        }
        return false;
      }) as PropertyGroup;
      const addressProperties: PropertyShape[] = addressField.property.map(field => {
        return {
          ...field,
          fieldId: field.name[VALUE_KEY],
        };
      });
      // Search for postal code shape
      setPostalCodeShape(addressProperties.find(field => field.fieldId === postalCode));
      // Get all address related shape that isnt the id or postal code
      setAddressShapes(addressProperties.filter(field => field.fieldId != "id" && field.fieldId != postalCode));
      isInitialFetching.current = false;
    }
    getAddressShapes(props.agentApi, props.field.name[VALUE_KEY]);
  }, []);

  /**
   * A submit action to search for the address based on a postal code
   * 
   * @param {FieldValues} data Values inputed into the form fields.
   */
  const onSearchForAddress: SubmitHandler<FieldValues> = async (data: FieldValues) => {
    // Reset states
    setAddresses([]);
    setSelectedAddress(null);
    // Start search
    const searchParams: URLSearchParams = new URLSearchParams();
    searchParams.append(postalCodeUnderscored, data[postalCode]);

    const url: string = `${props.agentApi}/geocode/api/search?${searchParams.toString()}`;
    const results = await sendGetRequest(url);
    setAddresses(JSON.parse(results));
  }

  /**
   * A submit action to search for the geocoordinates based on address components.
   * 
   * @param {FieldValues} data Values inputed into the form fields.
   */
  const onGeocoding: SubmitHandler<FieldValues> = async (data: FieldValues) => {
    // Reset location
    setGeolocation([]);
    // Searches for geolocation in the following steps
    const searchParamsList: Record<string, string | undefined>[] = [
      // First by postal code
      { [postalCodeUnderscored]: data[postalCode] },
      // If no coordinates are found, search by block (if available) and street name
      { block: data.block, street: data.street },
      // If no coordinates are found, search for any coordinate in the same city and country
      { city: data.city, country: data.country },
    ];

    for (const params of searchParamsList) {
      const coordinates: number[] = await getGeolocation(props.agentApi, params);
      // Only set coordinates if they are available
      if (coordinates.length === 2) {
        // Geolocation is in longitude(x), latitude(y) format
        setGeolocation(coordinates);
        break; // Stop function if found
      };
    }
  }

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
  }

  return (
    <fieldset className={styles["form-fieldset"]}>
      {isInitialFetching.current &&
        <div className={styles["loader-container"]}>
          <LoadingSpinner isSmall={false} />
        </div>
      }
      {!isInitialFetching.current && <>
        <legend className={styles["form-fieldset-label"]}>
          {parseWordsForLabels(props.field.name[VALUE_KEY])}
        </legend>
        <div className={styles["form-fieldset-contents"]}>
          {postalCodeShape && <FormFieldComponent
            entityType={props.field.name[VALUE_KEY]}
            field={postalCodeShape}
            form={props.form}
            options={props.options}
          />}
        </div>
        <div className={styles["form-dependent-button-layout"]}>
          <MaterialIconButton
            iconName={"search"}
            className={styles["button"] + " " + styles["button-layout"]}
            iconStyles={[styles["icon"]]}
            text={{
              styles: [styles["button-text"]],
              content: "Find address"
            }}
            onClick={props.form.handleSubmit(onSearchForAddress)}
          />
        </div>
        {addresses.length > 0 && !selectedAddress && <div className={styles["form-menu"]}>
          {addresses.map((address, index) => (
            <button
              key={address.street + index}
              className={styles["form-menu-item"]}
              onClick={() => handleAddressClick(address)}>
              {String.fromCharCode(62)} {address.block} {parseWordsForLabels(address.street)}, {address.city}
            </button>
          ))}
        </div>
        }
        {addressShapes.length > 0 && selectedAddress && <div className={styles["form-fieldset-contents"]}>
          {addressShapes.map((shape, index) => <FormFieldComponent
            key={shape.fieldId + index}
            entityType={props.field.name[VALUE_KEY]}
            agentApi={props.agentApi}
            field={shape}
            form={props.form}
            options={props.options}
          />)
          }
          <div className={styles["form-dependent-button-layout"]}>
            <MaterialIconButton
              iconName={"edit_location"}
              className={styles["button"] + " " + styles["button-layout"]}
              iconStyles={[styles["icon"]]}
              text={{
                styles: [styles["button-text"]],
                content: "Select location"
              }}
              onClick={props.form.handleSubmit(onGeocoding)}
            />
          </div>
        </div>}
        {/** WIP to use the geolocations for visual interactions */}
        {geolocation.length > 0 && <div>{geolocation[0]} {geolocation[1]}</div>}
      </>}
    </fieldset>);
}
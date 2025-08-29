import { useState } from "react";
import { FieldValues, SubmitHandler, UseFormReturn } from "react-hook-form";
import { Address } from "types/address";
import { AgentResponseBody } from "types/backend-agent";
import { PropertyShape } from "types/form";
import { updateLatLong } from "ui/interaction/form/form-utils";
import { makeInternalRegistryAPIwithParams } from "utils/internal-api-services";

export interface GeocodingActions {
  hasNoAddressFound: boolean;
  showAddressOptions: boolean;
  addresses: Address[];
  handleAddressClick: (_address: Address) => Promise<void>
  onGeocoding: SubmitHandler<FieldValues>,
}
/**
  * A custom hook to return geocoding executable actions.
  *
  * @param {PropertyShape[]} addressShapes The SHACL restrictions for addresses.
  * @param {PropertyShape} field The SHACL restrictions for geolocation.
  * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
*/
export function useGeocode(
  addressShapes: PropertyShape[],
  field: PropertyShape,
  form: UseFormReturn,
): GeocodingActions {
  const postalCode: string = "postal code";
  const [hasNoAddressFound, setHasNoAddressFound] = useState<boolean>(false);
  const [showAddressOptions, setShowAddressOptions] = useState<boolean>(false);
  const [addresses, setAddresses] = useState<Address[]>([]);

  /**
   * A function to see if coordinates can be fetched from a given URL. If found, coordinates will be updated in the form.
   * @param {string} url the url for execution.
   */
  async function fetchCoordinatesFromUrl(url: string): Promise<boolean> {
    const res: AgentResponseBody = await fetch(url, {
      cache: "no-store",
      credentials: "same-origin",
    }).then((response) => response.json());

    const coordinates: number[] = (
      res.data?.items as Record<string, unknown>[]
    )?.[0]?.coordinates as number[];
    if (coordinates?.length === 2) {
      // Geolocation is in longitude(x), latitude(y) format
      updateLatLong(field.fieldId, coordinates[1].toString(), coordinates[0].toString(), form);
      return true;
    }
    return false;
  }

  /**
   * A function to fetch address based on the postal code if available.
   * 
   * @param {FieldValues} data the values in the field.
   */
  async function fetchAddress(data: FieldValues): Promise<boolean> {
    // Start search
    const results: AgentResponseBody = await fetch(
      makeInternalRegistryAPIwithParams("address", data[postalCode]),
      {
        cache: "no-store",
        credentials: "same-origin",
      }
    ).then((response) => response.json());
    if (results.data?.message) {
      setShowAddressOptions(false);
      setHasNoAddressFound(true);
      setAddresses([]);
      // Clear address fields when no address is found
      addressShapes.forEach((shape) => {
        form.setValue(shape.fieldId, "");
      });
    } else {
      setShowAddressOptions(true);
      setHasNoAddressFound(false);
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
    return !!results.data?.message;
  }

  /**
  * A function to retrieve the coordinates by the address input.
  * 
  * @param {string} block the block number if available.
  * @param {string} street the name of the street if available.
  * @param {string} city the name of the city if available.
  * @param {string} country the country instance if available.
  */
  async function getCoordinatesByAddress(block: string, street: string, city: string, country: string): Promise<void> {
    const internalApiPaths: string[] = [
      // First, search by block (if available) and street name
      makeInternalRegistryAPIwithParams("geocode_address", block, street),
      // If no coordinates are found, search for any coordinate in the same city and country
      makeInternalRegistryAPIwithParams("geocode_city", city, country),
    ];

    for (const url of internalApiPaths) {
      const hasCoordinates = await fetchCoordinatesFromUrl(url);
      if (!hasCoordinates) {
        break;
      }
    }
  }

  // Form submission action to start geocoding
  const onGeocoding: SubmitHandler<FieldValues> = async (
    formValues: FieldValues
  ) => {
    setAddresses([]);
    addressShapes.forEach((shape) => {
      form.setValue(shape.fieldId, "");
    });
    const geocodeByPostalCodeUrl: string = makeInternalRegistryAPIwithParams("geocode_postal", formValues[postalCode]);
    const hasCoordinates = await fetchCoordinatesFromUrl(geocodeByPostalCodeUrl);
    if (hasCoordinates) {
      const hasAddress: boolean = await fetchAddress(formValues);
      if (!hasAddress) {
        getCoordinatesByAddress(formValues["block"],
          formValues["street"],
          formValues["city"],
          formValues["country"])
      }
    }
  };

  // A click action to set the selected address
  const handleAddressClick: (_address: Address) => Promise<void> = async (address: Address) => {
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
      form.setValue(shape.fieldId, defaultVal);
    });
    getCoordinatesByAddress(address.block, address.street, address.city, address.country);
    setShowAddressOptions(false);
  };

  return {
    hasNoAddressFound,
    showAddressOptions,
    addresses,
    handleAddressClick,
    onGeocoding,
  }
}

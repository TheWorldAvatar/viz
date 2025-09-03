import { useEffect, useState } from "react";
import { AgentResponseBody } from "types/backend-agent";
import { makeInternalRegistryAPIwithParams } from "utils/internal-api-services";

export interface ExistingCoordinatesDescriptor {
  isFetching: boolean;
  coordinates: number[];
}

/**
 * A custom hook to retrieve geocoordinates from an existing location IRI.
 *
 * @param {string} location The existing location IRI.
 * @param {string} formType The type of the form.
 */
export function useExistingLocationCoordinates(
  location: string,
  formType: string,
): ExistingCoordinatesDescriptor {
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [coordinates, setCoordinates] = useState<number[]>([]);

  useEffect(() => {
    // Declare an async function to get geocoordinates associated with the location
    const getGeoCoordinates = async (location: string): Promise<void> => {
      const res = await fetch(
        makeInternalRegistryAPIwithParams("geodecode", location),
        {
          cache: "no-store",
          credentials: "same-origin",
        }
      );
      const resBody: AgentResponseBody = await res.json();
      const existingCoordinates: number[] = (
        resBody.data?.items as Record<string, unknown>[]
      )?.[0]?.coordinates as number[];
      if (existingCoordinates.length === 2) {
        setCoordinates(existingCoordinates);
      }
    };

    setIsFetching(true);
    if (formType == "delete" || formType == "edit" || formType == "view") {
      getGeoCoordinates(location);
    }
    setIsFetching(false);
  }, []);

  return {
    isFetching,
    coordinates,
  }
}

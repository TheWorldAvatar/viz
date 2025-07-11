"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import { Map, Marker } from "mapbox-gl";
import { useEffect, useState } from "react";
import { Control, FieldValues, UseFormReturn, useWatch } from "react-hook-form";

import { CameraPosition } from "types/settings";
import { FORM_STATES } from "ui/interaction/form/form-utils";
import { MapSettingsProvider } from "ui/map/mapbox/map-settings-context";
import MapboxMapComponent from "ui/map/mapbox/mapbox-container";

interface GeocodeMapContainerProps {
  form: UseFormReturn;
  fieldId: string;
}

/**
 * Renders the geocoding map based on form inputs.
 */
export default function GeocodeMapContainer(props: GeocodeMapContainerProps) {
  const [map, setMap] = useState<Map>(null);
  const [marker, setMarker] = useState<Marker>(null);

  // Monitor longitude and latitude values
  const control: Control = props.form.control;
  const longitude: number = useWatch<FieldValues>({
    control,
    name: FORM_STATES.LONGITUDE,
  });
  const latitude: number = useWatch<FieldValues>({
    control,
    name: FORM_STATES.LATITUDE,
  });
  // Set a inital camera position
  const defaultPosition: CameraPosition = {
    name: "",
    center: [longitude, latitude],
    zoom: 16,
    bearing: 0,
    pitch: 0,
  };

  // Create a new draggable marker on any map rerenders
  useEffect(() => {
    if (map) {
      const marker = new Marker({
        color: "#146a7d",
        draggable: true,
      })
        .setLngLat([longitude, latitude])
        .addTo(map);

      // Marker must update the form values when draggred
      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        props.form.setValue(FORM_STATES.LATITUDE, lngLat.lat.toString());
        props.form.setValue(FORM_STATES.LONGITUDE, lngLat.lng.toString());
        props.form.setValue(
          props.fieldId,
          `POINT(${lngLat.lng}, ${lngLat.lat})`
        );
      });
      setMarker(marker);
    }
  }, [map]);

  // This function updates the map when longitude and latitude form values are updated
  useEffect(() => {
    if (map && marker) {
      marker.setLngLat([longitude, latitude]);
      props.form.setValue(props.fieldId, `POINT(${longitude}, ${latitude})`);
      map.flyTo({ center: [longitude, latitude] });
    }
  }, [longitude, latitude, marker, map]);

  return (
    <MapSettingsProvider
      settings={{
        type: "mapbox",
        camera: null,
        imagery: null,
      }}
    >
      <div className="flex  w-full h-[50vh]  my-4 ">
        <MapboxMapComponent
          currentMap={map}
          setMap={setMap}
          defaultPosition={defaultPosition}
          styles="w-full h-[50vh]"
        />
      </div>
    </MapSettingsProvider>
  );
}

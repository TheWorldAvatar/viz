import "mapbox-gl/dist/mapbox-gl.css";
import "./mapbox.css";

import mapboxgl, { Map } from "mapbox-gl";
import React, { useEffect, useRef } from "react";

import { CameraPosition, ImageryOption } from "types/settings";
import { togglePlacenames } from "../map-helper";
import { useMapSettings } from "./map-settings-context";
/**
 * @param {Map} map The reference to the current map (if any).
 * @param {string} styles The css styles for the mapbox container.
 * @param setMap Sets the reference for the created map.
 * @param {CameraPosition} defaultPosition The default camera position for the map.
 * @param {ImageryOption} imageryOption An optional imagery option for the default map setup.
 */
interface MapProperties {
  currentMap: Map;
  styles: string;
  setMap: React.Dispatch<React.SetStateAction<Map>>;
  defaultPosition: CameraPosition;
  imageryOption?: ImageryOption;
  hideLabels?: boolean;
}

/**
 * Renders a mapbox map instance.
 */
export default function MapboxMapComponent(props: MapProperties) {
  const mapContainerRef = useRef(null);

  const mapSettings = useMapSettings();
  // Run when component loaded
  useEffect(() => {
    initialiseMap();

    return () => {
      if (props.currentMap) {
        props.currentMap.remove(); // Remove the map instance
        props.setMap(null); // Reset the map ref
      }
    };
  }, []);

  // Initialise the map object
  const initialiseMap = async () => {
    props.currentMap?.remove();

    const defaultImagery: ImageryOption = props.imageryOption ?? {
      name: "Standard (Night)",
      url: "mapbox://styles/mapbox/standard",
      time: "dusk",
    };

    mapboxgl.accessToken = process.env.MAPBOX_API_KEY;

    const map: Map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: defaultImagery.url,
      center: props.defaultPosition.center,
      zoom: props.defaultPosition.zoom,
      bearing: props.defaultPosition.bearing,
      pitch: props.defaultPosition.pitch,
      transformRequest: (url: string) => {
        if (process.env.REACT_APP_USE_GEOSERVER_PROXY === "true") {
          try {
            const urlObject = new URL(url);
            const params = new URLSearchParams(urlObject.search);
            if (params.get("request") === "GetMap") {
              // not sure if this will work across all conditions
              const proxyUrl = `${
                process.env.REACT_APP_SERVER_URL
              }/geoserver-proxy?url=${encodeURIComponent(url)}`;
              return {
                url: proxyUrl,
              };
            }
          } catch (error) {
            console.error("Error processing URL with geoserver proxy:", error);
            return { url: url };
          }
        } else {
          return { url: url };
        }
      },
    });

    map.addControl(
      new mapboxgl.ScaleControl() as mapboxgl.IControl,
      "bottom-right"
    );
    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    map.on("style.load", function () {
      // Hide labels if specified
      if (props.hideLabels) {
        togglePlacenames(mapSettings.imagery, map);
      }
      // Update time if using new v3 standard style
      if (defaultImagery.time != null) {
        map.setConfigProperty("basemap", "lightPreset", defaultImagery.time);
      }
      // Map is only settable after the styles have loaded
      props.setMap(map);
    });
  };

  return (
    <div
      ref={mapContainerRef}
      className=" h-full w-full  pointer-events-auto inset-1 "
    />
  );
}

MapboxMapComponent.displayName = "MapboxMapComponent";

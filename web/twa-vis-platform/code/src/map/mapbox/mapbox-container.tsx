/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/prop-types */

/**
 * Question(s) here are:
 *
 * - How the hell can I create a map instance that can be interacted with from other classes, or other
 * UI components in a totally different place in the UI hierarchy?
 *     - Quick solution is to use the global "window" object to store the map object globally.
 *
 * - Can I create a map instance that won't re-initialise (and re-load ALL the data) anytime something
 * else in the UI changes?
 */
"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import "./mapbox.css";

import mapboxgl from "mapbox-gl";
import React, { useRef, useEffect } from "react";
import { getDefaultCameraPosition } from "./mapbox-camera-utils";
import { MapSettings } from "../../types/map-settings";
import {
  getCurrentImageryOption,
  getDefaultImageryOption,
  getImageryOption,
} from "./mapbox-imagery-utils";
import { DataStore } from "../../io/data/data-store";
import { addAllSources } from "./mapbox-source-utils";
import { addAllLayers } from "./mapbox-layer-utils";
import { addIcons } from "./mapbox-icon-loader";

import { useDispatch } from "react-redux";
import { setLatLng } from "../../state/floating-panel-click-slice";

// Type definition of incoming properties
interface MapProperties {
  settings: MapSettings;
  dataStore: DataStore;
}

// Return the default style URL
function getDefaultStyle(mapSettings: MapSettings) {
  if (mapSettings.imagery.default.toLowerCase() == "auto") {
    // Auto detect browser theme
    if (
      window?.matchMedia &&
      window?.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return getImageryOption("3D (Night)", mapSettings.imagery);
    } else {
      return getImageryOption("3D (Day)", mapSettings.imagery);
    }
  } else {
    return getDefaultImageryOption(mapSettings);
  }
}

/**
 * Dynamically load and render content from an optional metadata file
 * based on the incoming URL route.
 *
 * @param params incoming route parameters.
 *
 * @returns React component for display.
 */
export default function MapboxMapComponent(props: MapProperties) {
  const settings = props.settings;
  const mapContainer = useRef(null);
  const map = useRef(null);
  const dispatch = useDispatch();
  // Run when component loaded
  useEffect(() => {
    initialiseMap();
  }, []);

  useEffect(() => {
    // Type the event parameter as CustomEvent<any> to access the detail property
    const mapClickHandler = (event: CustomEvent<any>) => {
      const lngLat = event.detail;
      dispatch(setLatLng({ lat: lngLat.lat, lng: lngLat.lng }));
    };

    // Convert the handler function to match the EventListener interface
    const eventListener = (e: Event) => mapClickHandler(e as CustomEvent<any>);

    window.addEventListener("mapClickEvent", eventListener);

    return () => {
      window.removeEventListener("mapClickEvent", eventListener);
    };
  }, [dispatch]);

  // Initialise the map object
  const initialiseMap = async () => {
    if (map.current) return;

    // Set credentials
    mapboxgl.accessToken = settings["credentials"]["key"];

    // Get default camera position
    const defaultPosition = getDefaultCameraPosition(settings);
    let styleObject = getCurrentImageryOption(settings);

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: styleObject.url,
      center: defaultPosition["center"],
      zoom: defaultPosition["zoom"],
      bearing: defaultPosition["bearing"],
      pitch: defaultPosition["pitch"],
    });

    // Store map object globally.
    // Note that setting a globally accessible variable for the map probably isn't wise. However,
    // we know this shouldn't be re-initialised, and the alternative is to pass the map object into
    // dozens of other UI components as a prop. This method should also allow client-side JS scripts
    // to access the map too. Would recommend revisiting this choice later though.
    window.map = map.current;
    console.info("Initialised a new Mapbox map object.");

    // Adding the click event listener here
    window.map.on("click", function (e) {
      // Create a custom event with the clicked coordinates
      const customEvent = new CustomEvent("mapClickEvent", {
        detail: e.lngLat,
      });
      window.dispatchEvent(customEvent);
    });

    window.map.on("style.load", function () {
      // Update time if using new v3 standard style
      styleObject = getCurrentImageryOption(settings);
      if (styleObject.time != null) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window.map as any).setConfigProperty(
          "basemap",
          "lightPreset",
          styleObject.time
        );
      }

      // Parse data configuration and load icons
      const iconPromise = addIcons(settings.icons);

      Promise.all([iconPromise]).then(() => {
        let dataStore: DataStore = props.dataStore;

        // Once that is done and completed...
        console.log("Data definitions fetched and parsed.");

        // Plot data
        addAllSources(dataStore);
        addAllLayers(dataStore);
      });
    });
  };

  return (
    <div id="mapContainer" ref={mapContainer} className="mapContainer">
      {/* Map will be generated here. */}
    </div>
  );
}

"use client";

import { Map } from "mapbox-gl";
import React, { useState } from "react";

import { MapLayer } from "@/types/map-layer";
import { MapSearchConfig } from "@/types/map-layer";
import { MapSearchConfigValue } from "@/types/map-layer";
import { parseWordsForLabels } from "@/utils/client-utils";
import Button from "@/ui/interaction/button";
import Modal from "../modal";
import styles from "./local-search-modal.module.css";

interface LocalSearchModalProps {
  search: MapSearchConfig;
  show: boolean;
  setShowState: React.Dispatch<React.SetStateAction<boolean>>;
  layers: MapLayer[];
  map: Map;
}

/** A modal that filters the currently loaded map features locally. */
export default function LocalSearchModal(
  props: Readonly<LocalSearchModalProps>
) {
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, MapSearchConfigValue>
  >(
    Object.fromEntries(
      Object.entries(props.search).map(([key, values]) => [key, values[0]])
    )
  );

  const handleChange = (key: string, value: string) => {
    const selectedValue = props.search[key].find(
      (option) => String(option) === value
    );

    setSelectedFilters((current: Record<string, MapSearchConfigValue>) => ({
      ...current,
      [key]: selectedValue ?? value,
    }));
  };

  const handleSearch = () => {
    const combinedFilters = [
      "all",
      ...Object.entries(selectedFilters).map(([key, value]) => [
        "==",
        ["get", key],
        value,
      ]),
    ];

    props.layers.forEach((layer) => {
      layer.ids.forEach((id) => {
        if (layer.idToFilterMap?.get(id)) {
          console.warn(
            `${layer.name} has a predefined filter that will be overwritten by the search filter.`
          );
        }
        props.map.setFilter(id, combinedFilters);
      });
    });

    props.setShowState(false);
  };

  return (
    <Modal
      isOpen={props.show}
      setIsOpen={props.setShowState}
      className="h-[90vh] w-[90vw]"
    >
      <div className="flex flex-col w-full gap-4">
        {Object.entries(props.search).map(([key, values]) => (
          <div key={key} className="flex flex-col w-full">
            <label htmlFor={key}>
              <span className="text-lg font-semibold">
                {parseWordsForLabels(key)}
              </span>
            </label>
            <select
              id={key}
              className={styles["select-value"]}
              value={String(selectedFilters[key])}
              onChange={(event) => handleChange(key, event.target.value)}
            >
              {values.map((value) => (
                <option key={String(value)} value={String(value)}>
                  {String(value)}
                </option>
              ))}
            </select>
          </div>
        ))}

        <div className="flex gap-2">
          <Button leftIcon="search" label="Search" onClick={handleSearch} />
        </div>
      </div>
    </Modal>
  );
}

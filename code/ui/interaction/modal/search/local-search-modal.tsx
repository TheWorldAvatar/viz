"use client";

import { FilterSpecification, Map } from "mapbox-gl";
import React, { useState } from "react";

import { MapLayer } from "@/types/map-layer";
import { MapSearchConfig } from "@/types/map-layer";
import { MapSearchConfigValue } from "@/types/map-layer";
import { parseWordsForLabels } from "@/utils/client-utils";
import Button from "@/ui/interaction/button";
import Modal from "../modal";
import SimpleSelector, {
  SelectOptionType,
} from "@/ui/interaction/dropdown/simple-selector";
import { Search, SquareSquare } from "lucide-react";
import { Dictionary } from "@/types/dictionary";
import { useDictionary } from "@/hooks/useDictionary";

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
  const dict: Dictionary = useDictionary();
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
    const combinedFilters: FilterSpecification = [
      "all",
      ...Object.entries(selectedFilters).map(
        ([key, value]): FilterSpecification => ["==", ["get", key], value]
      ),
    ];

    props.layers.forEach((layer) => {
      layer.ids.forEach((id) => {
        const defaultFilter = layer.idToFilterMap?.get(id) as
          | FilterSpecification
          | undefined;
        const layerFilter: FilterSpecification = defaultFilter
          ? ["all", defaultFilter, combinedFilters]
          : combinedFilters;

        props.map.setFilter(id, layerFilter);
      });
    });

    props.setShowState(false);
  };

  const handleRevert = () => {
    props.layers.forEach((layer) => {
      layer.ids.forEach((id) => {
        const defaultFilter = layer.idToFilterMap.get(id) as
          | FilterSpecification
          | undefined;

        props.map.setFilter(id, defaultFilter ?? null);
      });
    });

    props.setShowState(false);
  };

  return (
    <Modal
      isOpen={props.show}
      setIsOpen={props.setShowState}
      className="h-auto! max-h-dvh w-full md:max-w-xl! overflow-y-auto rounded-xl! "
    >
      <div className="flex flex-col w-full gap-4 mt-4">
        {Object.entries(props.search).map(([key, values]) => (
          <div key={key} className="flex flex-col w-full gap-1.5">
            <label htmlFor="select-input" className="text-lg font-semibold">
              {parseWordsForLabels(key)}
            </label>
            <SimpleSelector
              options={values.map((value) => ({
                label: String(value),
                value: String(value),
                disabled: false,
              }))}
              defaultVal={String(selectedFilters[key])}
              onChange={(selected) =>
                handleChange(key, (selected as SelectOptionType)?.value)
              }
              ariaLabel={parseWordsForLabels(key)}
            />
          </div>
        ))}

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" label={dict.action.showAll} leftIcon={SquareSquare} onClick={handleRevert} />
          <Button leftIcon={Search} label={dict.action.search} onClick={handleSearch} />
        </div>
      </div>
    </Modal>
  );
}

"use client";

import { useExistingLocationCoordinates } from "hooks/geocode/useExistingLocationCoordinates";
import { useDictionary } from "hooks/useDictionary";
import { useEffect, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { Dictionary } from "types/dictionary";
import GeocodeMapContainer from "ui/map/geocode/geocode-map-container";
import Button from "../../button";
import { FORM_STATES } from "../../form/form-utils";
import Modal from "../../modal/modal";

interface FormQuickViewMapProps {
  label: string;
  locationUri: string;
}

/**
 * A component that renders the map modal for a form quick view panel.
 *
 * @param {string} label - The field name.
 * @param {string} locationUri - The URI of the location.
 **/
export default function FormQuickViewMap(
  props: Readonly<FormQuickViewMapProps>
) {
  const dict: Dictionary = useDictionary();
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);

  const { isFetching, coordinates } = useExistingLocationCoordinates(
    props.locationUri,
    "view"
  );
  const mapForm = useForm<FieldValues>({
    defaultValues: {
      formType: "view",
      latitude: 0,
      longitude: 0,
    },
  });

  useEffect(() => {
    if (!isFetching) {
      mapForm.setValue(FORM_STATES.LATITUDE, coordinates[1]);
      mapForm.setValue(FORM_STATES.LONGITUDE, coordinates[0]);
    }
  }, [coordinates]);

  return (
    <div className="flex flex-col items-baseline">
      <div className="flex flex-row items-baseline">
        <h4 className="flex-shrink-0 w-40 text-base  text-foreground capitalize font-semibold">
          {props.label}
        </h4>
        <div className="flex-1 text-base text-foreground flex gap-2">
          <Button
            type="button"
            size="icon"
            tooltipText={isMapOpen ? dict.action.hide : dict.action.show}
            iconSize="small"
            leftIcon={"location_on"}
            onClick={() => setIsMapOpen(!isMapOpen)}
            variant={isMapOpen ? "secondary" : "outline"}
            loading={isFetching}
          />
        </div>
      </div>
      <Modal
        isOpen={isMapOpen}
        setIsOpen={setIsMapOpen}
        className="!h-fit !w-sm md:!w-2xl lg:!w-4xl !rounded-xl"
      >
        <div className="flex flex-col h-full p-2.5">
          <h1 className="flex-shrink-0 w-40 text-sm font-medium text-foreground capitalize">
            {props.label}
          </h1>
          <div className="flex-1 h-96">
            <GeocodeMapContainer form={mapForm} fieldId="mapDisplay" />
          </div>
        </div>
      </Modal>
    </div>
  );
}

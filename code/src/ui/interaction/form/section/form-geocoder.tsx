import { useGeocode } from "hooks/geocode/useGeocode";
import { GeocodeTemplateDescriptor, useGeocodeTemplate } from "hooks/geocode/useGeocodeTemplate";
import { useDictionary } from "hooks/useDictionary";
import React, { useState } from "react";
import { Control, FieldValues, UseFormReturn, useWatch } from "react-hook-form";
import { Dictionary } from "types/dictionary";
import {
  PropertyShape,
  VALUE_KEY
} from "types/form";
import LoadingSpinner from "ui/graphic/loader/spinner";
import Button from "ui/interaction/button";
import GeocodeMapContainer from "ui/map/geocode/geocode-map-container";
import ErrorComponent from "ui/text/error/error";
import { parseWordsForLabels } from "utils/client-utils";
import FormFieldComponent from "../field/form-field";
import { FORM_STATES } from "../form-utils";

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

  const control: Control = props.form.control;

  const latitude: string = useWatch<FieldValues>({
    control,
    name: FORM_STATES.LATITUDE,
  });
  const longitude: string = useWatch<FieldValues>({
    control,
    name: FORM_STATES.LONGITUDE,
  });

  const {
    isFetching,
    postalCodeShape,
    addressShapes,
  }: GeocodeTemplateDescriptor = useGeocodeTemplate(props.field, props.form);

  const {
    hasNoAddressFound,
    showAddressOptions,
    showAddressShapes,
    addresses,
    selectAddress,
    onGeocoding,
  } = useGeocode(addressShapes, props.field, props.form);

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold text-foreground">
        {parseWordsForLabels(props.field.name[VALUE_KEY])}
      </h2>
      {isFetching && (
        <div className="mr-2">
          <LoadingSpinner isSmall={true} />
        </div>
      )}

      {!isFetching && <>
        <div className="flex items-center gap-2 mb-2">
          {postalCodeShape && (
            <FormFieldComponent field={postalCodeShape} form={props.form} />
          )}

          {(formType == "add" || formType == "edit") && (
              <div className="flex mt-12">
                <Button
                  leftIcon="place"
                  size="icon"
                  tooltipText={dict.action.selectLocation}
                  onClick={
                    props.form.handleSubmit(onGeocoding)
                  } type="button"
                />
              </div>
            )}
        </div>

        {hasNoAddressFound && (
          <div className="m-2">
            <ErrorComponent message={dict.message.noAddressFound} />
          </div>
        )}
        {addresses?.length > 1 && showAddressOptions && (
          <div className="flex flex-wrap w-fit gap-2">
            {addresses.map((address, index) => (
              <button
                key={address.street + index}
                className="cursor-pointer overflow-hidden whitespace-nowrap flex text-center w-fit p-2 text-base md:text-lg text-foreground bg-background border-1 border-border rounded-lg hover:bg-primary transition-colors duration-200"
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                  // Prevent form submission
                  event.preventDefault();
                  event.stopPropagation();
                  selectAddress(address);
                }}
              >
                {String.fromCharCode(62)} {address.block}{" "}
                {parseWordsForLabels(address.street)}, {address.city}
              </button>
            ))}
          </div>
        )}
        {addressShapes.length > 0 && showAddressShapes && (
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
        {latitude && longitude && (
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
      </>}
    </div>
  );
}

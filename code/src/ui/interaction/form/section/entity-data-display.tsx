import React, { useState, useEffect } from "react";
import { useDictionary } from "hooks/useDictionary";
import { FieldValues, useForm } from "react-hook-form";
import { AgentResponseBody } from "types/backend-agent";
import {
  FormTemplateType,
  PropertyShapeOrGroup,
  PropertyShape,
  PropertyGroup,
  TYPE_KEY,
  PROPERTY_GROUP_TYPE,
  VALUE_KEY,
  RegistryFieldValues,
} from "types/form";
import { makeInternalRegistryAPIwithParams } from "utils/internal-api-services";
import LoadingSpinner from "ui/graphic/loader/spinner";
import { parsePropertyShapeOrGroupList, FORM_STATES } from "../form-utils";
import { usePathname } from "next/dist/client/components/navigation";
import { getAfterDelimiter } from "utils/client-utils";
import Button from "ui/interaction/button";
import GeocodeMapContainer from "ui/map/geocode/geocode-map-container";
import Modal from "ui/interaction/modal/modal";
import { Dictionary } from "types/dictionary";

interface EntityDataDisplayProps {
  entityType: string;
  id?: string;
}

/**
 * This component renders a component that displays entity data.
 *
 * @param {string} entityType The type of entity.
 * @param {string} id An optional identifier input.
 */

export function EntityDataDisplay(props: Readonly<EntityDataDisplayProps>) {
  const dict: Dictionary = useDictionary();
  const id: string = props.id ?? getAfterDelimiter(usePathname(), "/");
  const [formTemplate, setFormTemplate] = useState<FormTemplateType | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [expandedUris, setExpandedUris] = useState<
    Record<string, RegistryFieldValues>
  >({});
  const [loadingUris, setLoadingUris] = useState<Record<string, boolean>>({});
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Form for map component (required by GeocodeMapContainer)
  const mapForm = useForm<FieldValues>({
    defaultValues: {
      formType: "view",
      latitude: 0,
      longitude: 0,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const template = await fetch(
          makeInternalRegistryAPIwithParams("form", props.entityType, id),
          {
            cache: "no-store",
            credentials: "same-origin",
          }
        ).then(async (res) => {
          const body: AgentResponseBody = await res.json();
          return body.data?.items?.[0] as FormTemplateType;
        });

        const initialState = {
          formType: "view",
          id: id,
        };
        const updatedProperties: PropertyShapeOrGroup[] =
          parsePropertyShapeOrGroupList(initialState, template.property);

        setFormTemplate({
          ...template,
          property: updatedProperties,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [props.entityType, id]);

  // Extract field value from property shape
  const getFieldValue = (propertyField: PropertyShape) => {
    return propertyField.defaultValue || null;
  };

  // Extract display value from field value
  const getDisplayValue = (fieldValue: unknown): string => {
    if (fieldValue === undefined || fieldValue === null) {
      return "";
    }

    if (typeof fieldValue === "object" && fieldValue !== null) {
      // Check for direct value
      if ("value" in fieldValue) {
        return String((fieldValue as { value: unknown }).value || "");
      }
    }

    return String(fieldValue);
  };

  // Check if the field value is of URI type
  const isUriType = (fieldValue: unknown): boolean => {
    return (
      typeof fieldValue === "object" &&
      fieldValue !== null &&
      "type" in fieldValue &&
      (fieldValue as { type: string }).type === "uri"
    );
  };

  // Check if this is a service location field
  const isServiceLocation = (label: string): boolean => {
    const lowerLabel = label.toLowerCase();
    return lowerLabel.includes("location");
  };

  // Handle map modal for service location
  const handleShowLocationMap = async (fieldValue: unknown, label: string) => {
    if (!isUriType(fieldValue)) return;
    if (!isServiceLocation(label)) return;

    const uriValue = (fieldValue as { value: string }).value;
    try {
      const response = await fetch(
        makeInternalRegistryAPIwithParams("geodecode", uriValue),
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          credentials: "same-origin",
        }
      );
      const body: AgentResponseBody = await response.json();
      const locationData = body.data?.items?.[0] as RegistryFieldValues;

      if (locationData) {
        if (
          locationData.coordinates &&
          Array.isArray(locationData.coordinates)
        ) {
          const coordinatesArray = locationData.coordinates;
          const lngValue = coordinatesArray[0];
          const latValue = coordinatesArray[1];

          // Update map form with coordinates
          mapForm.setValue(FORM_STATES.LATITUDE, latValue);
          mapForm.setValue(FORM_STATES.LONGITUDE, lngValue);
          setIsMapOpen(true);
        }
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
    }
  };

  // Handle showing URI details
  const handleShowUri = async (fieldValue: unknown, label: string) => {
    if (!isUriType(fieldValue)) return;

    const uriValue = (fieldValue as { value: string }).value;

    // The uriKey is used as a unique identifier to track which URI fields are expanded (queried)
    const uriKey = getAfterDelimiter(uriValue, "/");

    // If already expanded, collapse it
    if (expandedUris[uriKey]) {
      setExpandedUris((prev) => {
        const { [uriKey]: _removed, ...rest } = prev;
        return rest;
      });
      setLoadingUris((prev) => {
        const { [uriKey]: _removed, ...rest } = prev;
        return rest;
      });
      return;
    }

    try {
      setLoadingUris((prev) => ({ ...prev, [uriKey]: true }));
      // Extract entity type and ID from the label and URI
      const entityType = label.toLowerCase().replace(/\s+/g, "_");
      const entityId = getAfterDelimiter(uriValue, "/");

      const response = await fetch(
        makeInternalRegistryAPIwithParams(
          "instances",
          entityType,
          "false",
          entityId
        ),
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          credentials: "same-origin",
        }
      );

      const body: AgentResponseBody = await response.json();
      const data = body.data?.items?.[0] || null;

      if (data) {
        setExpandedUris((prev) => ({
          ...prev,
          [uriKey]: data as RegistryFieldValues,
        }));
      }
    } catch (error) {
      console.error("Error fetching URI data:", error);
    } finally {
      setLoadingUris((prev) => ({ ...prev, [uriKey]: false }));
    }
  };

  const handleMapOrUri = async (fieldValue: unknown, label: string) => {
    if (isUriType(fieldValue)) {
      if (isServiceLocation(label)) {
        await handleShowLocationMap(fieldValue, label);
      } else {
        await handleShowUri(fieldValue, label);
      }
    }
  };

  // Render a single property field
  const renderPropertyField = (
    propertyField: PropertyShape,
    key: string | number
  ) => {
    const label = propertyField.name?.[VALUE_KEY] || "Unknown Field";
    const fieldValue = getFieldValue(propertyField);
    const displayValue = getDisplayValue(fieldValue);

    if (label.toLowerCase().includes("id")) {
      return null;
    }

    // Check if this is a URI type field
    if (isUriType(fieldValue)) {
      const uriValue = (fieldValue as { value: string }).value;
      const uriKey = getAfterDelimiter(uriValue, "/");
      const expandedData = expandedUris[uriKey];
      const isExpanded = !!expandedData;

      return (
        <div key={key} className="flex flex-col py-2">
          <div className="flex flex-row items-baseline">
            <div className="flex-shrink-0 w-40 text-sm font-medium text-foreground capitalize">
              {label}
            </div>
            <div className="flex-1 text-xs text-foreground flex gap-2">
              <Button
                type="button"
                size="icon"
                tooltipText={isExpanded ? dict.action.hide : dict.action.show}
                iconSize="small"
                leftIcon={
                  isServiceLocation(label)
                    ? "location_on"
                    : isExpanded
                    ? "keyboard_arrow_up"
                    : "keyboard_arrow_down"
                }
                onClick={() => handleMapOrUri(fieldValue, label)}
                variant={isExpanded ? "secondary" : "outline"}
                disabled={!!loadingUris[uriKey]}
                loading={!!loadingUris[uriKey]}
              />
            </div>
          </div>

          {isExpanded && expandedData && (
            <div className="mt-4 pl-4 border-l-1 border-border">
              <div className="space-y-2">
                {Object.entries(expandedData).map(([key, value]) => {
                  if (key === "id") {
                    return null;
                  }

                  // Handle arrays directly (like phone_no)
                  if (Array.isArray(value)) {
                    return value.map((item, index) => (
                      <div
                        key={`${key}-${index}`}
                        className="flex flex-row flex-wrap py-1"
                      >
                        <div className="w-32 font-medium text-gray-600 dark:text-gray-400 capitalize">
                          {key.replace(/_/g, " ")}{" "}
                          {index > 0 ? `(${index + 1})` : ""}
                        </div>
                        <div className="flex-1 ml-2 text-foreground">
                          {String(item.value || item)}
                        </div>
                      </div>
                    ));
                  }

                  // Handle objects with type property
                  if (
                    typeof value === "object" &&
                    value !== null &&
                    "type" in value
                  ) {
                    const objValue = value as { type: string; value: unknown };
                    if (objValue.type === "uri") {
                      return null; // Skip URI fields in expanded view
                    }

                    return (
                      <div key={key} className="flex flex-row flex-wrap py-1">
                        <div className="w-32 font-medium text-gray-600 dark:text-gray-400 capitalize">
                          {key.replace(/_/g, " ")}:
                        </div>
                        <div className="flex-1 ml-2 text-foreground">
                          {String(objValue.value || "")}
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    // If no display value, skip rendering
    // This is for optional fields that are not set
    if (!displayValue) {
      return null;
    }

    // Single properties
    return (
      <div key={key} className="flex flex-row sm:items-start py-2">
        <div className="flex-shrink-0 w-40 text-sm font-medium text-foreground capitalize">
          {label}
        </div>
        <div className="flex-1 text-sm text-foreground">{displayValue}</div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <LoadingSpinner isSmall={true} />
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden">
        <div className="p-4 space-y-2 text-sm font-medium text-foreground">
          {formTemplate?.property.map((field, index) => {
            if (field[TYPE_KEY].includes(PROPERTY_GROUP_TYPE)) {
              // Group Property
              const group = field as PropertyGroup;
              const groupLabel = group.label?.[VALUE_KEY] || "Group";
              const groupProperties = group.property || [];

              return (
                <div key={index} className="mb-4">
                  <h4 className="mb-2 capitalize">{groupLabel}</h4>
                  <div className="pl-4 space-y-2">
                    {groupProperties.map(
                      (nestedField: PropertyShape, nestedIndex: number) =>
                        renderPropertyField(nestedField, nestedIndex)
                    )}
                  </div>
                </div>
              );
            }

            // Individual property
            const propertyField = field as PropertyShape;
            return renderPropertyField(propertyField, index);
          })}
        </div>
      </div>

      <MapModal isOpen={isMapOpen} setIsOpen={setIsMapOpen} mapForm={mapForm} />
    </>
  );
}

interface MapModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mapForm: ReturnType<typeof useForm<FieldValues>>;
}

function MapModal(props: Readonly<MapModalProps>) {
  return (
    <Modal
      isOpen={props.isOpen}
      setIsOpen={props.setIsOpen}
      className="!h-fit !w-sm md:!w-2xl lg:!w-4xl !rounded-xl"
    >
      <div className="flex flex-col h-full ">
        <div className="flex-1 h-96 p-2.5">
          <GeocodeMapContainer form={props.mapForm} fieldId="mapDisplay" />
        </div>
      </div>
    </Modal>
  );
}

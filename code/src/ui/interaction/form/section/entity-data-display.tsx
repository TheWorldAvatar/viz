import { useState, useEffect } from "react";
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
import { parsePropertyShapeOrGroupList } from "../form-utils";
import { usePathname } from "next/dist/client/components/navigation";
import { getAfterDelimiter } from "utils/client-utils";

interface EntityDataDisplayProps {
  entityType: string;
  id?: string;
  additionalFields?: PropertyShapeOrGroup[];
}

export function EntityDataDisplay(props: Readonly<EntityDataDisplayProps>) {
  const id: string = props.id ?? getAfterDelimiter(usePathname(), "/");
  const [formTemplate, setFormTemplate] = useState<FormTemplateType | null>(
    null
  );
  const [instance, setInstance] = useState<RegistryFieldValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedUris, setExpandedUris] = useState<
    Record<string, RegistryFieldValues>
  >({});

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

        const instanceData = await fetch(
          makeInternalRegistryAPIwithParams(
            "instances",
            props.entityType,
            "false",
            id
          ),
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            credentials: "same-origin",
          }
        ).then(async (res) => {
          const body: AgentResponseBody = await res.json();
          return body.data?.items?.[0] || null;
        });

        setInstance(instanceData as RegistryFieldValues);

        // Add additional fields if provided
        if (props.additionalFields) {
          props.additionalFields.forEach((field: PropertyShapeOrGroup) =>
            template.property.push(field)
          );
        }

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
  }, [props.entityType, props.additionalFields, id]);

  // Extract field value from instance data or defaultValue
  const getFieldValue = (propertyField: PropertyShape) => {
    const fieldId = propertyField.fieldId || propertyField["@id"] || "";
    let fieldValue = null;

    if (instance && fieldId) {
      const directField = instance[fieldId];
      if (directField !== undefined) {
        fieldValue = directField;
      } else {
        const propertyName = propertyField.name?.[VALUE_KEY];
        if (propertyName && instance[propertyName] !== undefined) {
          fieldValue = instance[propertyName];
        }
      }
    }

    if (fieldValue === null && propertyField.defaultValue) {
      fieldValue = propertyField.defaultValue;
    }

    return fieldValue;
  };

  // Extract display value from field value
  const getDisplayValue = (fieldValue: unknown): string => {
    if (fieldValue === undefined || fieldValue === null) {
      return "";
    }

    // Here we check for defaultValue first
    if (
      typeof fieldValue === "object" &&
      "defaultValue" in fieldValue &&
      fieldValue.defaultValue
    ) {
      if (
        typeof fieldValue.defaultValue === "object" &&
        "value" in fieldValue.defaultValue
      ) {
        return String(fieldValue.defaultValue.value || "");
      } else {
        return String(fieldValue.defaultValue);
      }
    }
    // Else we check for direct value
    else if (typeof fieldValue === "object" && "value" in fieldValue) {
      return String((fieldValue as { value: unknown }).value || "");
    } else {
      return String(fieldValue);
    }
  };

  const isUriType = (fieldValue: unknown): boolean => {
    return (
      typeof fieldValue === "object" &&
      fieldValue !== null &&
      "type" in fieldValue &&
      (fieldValue as { type: string }).type === "uri"
    );
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
        const newState = { ...prev };
        delete newState[uriKey];
        return newState;
      });
      return;
    }

    try {
      // Extract entity type and ID from the label and URI
      const entityType = label.toLowerCase().replace(/\s+/g, "_");

      // Extract ID from URI using the same function as the main component
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

    // Check if this is a URI type field
    if (isUriType(fieldValue)) {
      const uriValue = (fieldValue as { value: string }).value;
      const uriKey = getAfterDelimiter(uriValue, "/");
      const expandedData = expandedUris[uriKey];
      const isExpanded = !!expandedData;

      return (
        <div key={key} className="flex flex-col py-2">
          <div className="flex flex-col sm:flex-row sm:items-start">
            <div className="flex-shrink-0 w-40 text-sm font-medium text-foreground">
              {label}
            </div>
            <div className="flex-1 text-xs text-foreground">
              <button
                type="button"
                onClick={() => handleShowUri(fieldValue, label)}
                className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                  isExpanded
                    ? "bg-gray-500 hover:bg-gray-600 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {isExpanded ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Expanded URI data */}
          {isExpanded && expandedData && (
            <div className="mt-2 ml-0 sm:ml-40 pl-4 border-l-2 border-gray-200">
              <div className="space-y-1">
                {Object.entries(expandedData).map(([key, value]) => {
                  // Skip displaying the full URI values for nested objects
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
                      <div
                        key={key}
                        className="flex flex-col sm:flex-row text-xs"
                      >
                        <div className="w-32 font-medium text-gray-600 capitalize">
                          {key.replace(/_/g, " ")}:
                        </div>
                        <div className="flex-1 text-gray-800">
                          {String(objValue.value || "")}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={key}
                      className="flex flex-col sm:flex-row text-xs"
                    >
                      <div className="w-32 font-medium text-gray-600 capitalize">
                        {key.replace(/_/g, " ")}:
                      </div>
                      <div className="flex-1 text-gray-800">
                        {String(value || "")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={key} className="flex flex-col sm:flex-row sm:items-start py-2">
        <div className="flex-shrink-0 w-40 text-sm font-medium text-foreground">
          {label}
        </div>
        <div className="flex-1 text-xs text-foreground break-all">
          {displayValue ? (
            <span className="text-xs bg-background px-3 py-1.5 rounded-md border border-border text-foreground">
              {displayValue}
            </span>
          ) : (
            <span className="text-gray-400 italic text-sm">Not specified</span>
          )}
        </div>
      </div>
    );
  };

  if (isLoading || !formTemplate) {
    return (
      <div className="flex justify-center p-4">
        <LoadingSpinner isSmall={true} />
      </div>
    );
  }

  return (
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
                <h4 className="mb-2">{groupLabel}</h4>
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
  );
}

import { useState } from "react";
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
import { FieldValues, useForm, UseFormReturn } from "react-hook-form";
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

  const form: UseFormReturn = useForm({
    defaultValues: async (): Promise<FieldValues> => {
      const initialState: FieldValues = {
        formType: "view",
        id: id,
      };

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

      if (props.additionalFields) {
        props.additionalFields.forEach((field: PropertyShapeOrGroup) =>
          template.property.push(field)
        );
      }

      const updatedProperties: PropertyShapeOrGroup[] =
        parsePropertyShapeOrGroupList(initialState, template.property);

      setFormTemplate({
        ...template,
        property: updatedProperties,
      });
      return initialState;
    },
  });

  const isLoading = form.formState.isLoading;

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
            // Property group
            const group = field as PropertyGroup;
            const groupLabel = group.label?.[VALUE_KEY] || "Group";
            const groupProperties = group.property || [];
            // console.info(
            //   "PropertyGroup:",
            //   groupLabel,
            //   "Instance data:",
            //   instance
            // );
            // console.info("Group properties:", groupProperties);

            return (
              <div key={index} className="mb-4">
                <h4 className="mb-2">{groupLabel}</h4>
                <div className="pl-4 space-y-2">
                  {groupProperties.map(
                    (nestedField: PropertyShape, nestedIndex: number) => {
                      const propertyField: PropertyShape =
                        nestedField as PropertyShape;
                      const label =
                        propertyField.name?.[VALUE_KEY] || "Unknown Field";
                      const fieldId =
                        propertyField.fieldId || propertyField["@id"] || "";

                      // Use instance data instead of form values
                      let fieldValue = null;
                      if (instance && fieldId) {
                        // Try to find the field in the instance data
                        const directField = instance[fieldId];
                        if (directField !== undefined) {
                          fieldValue = directField;
                        } else {
                          const propertyName = propertyField.name?.[VALUE_KEY];

                          if (
                            propertyName &&
                            instance[propertyName] !== undefined
                          ) {
                            fieldValue = instance[propertyName];
                          }
                        }
                      }

                      if (fieldValue === null && propertyField.defaultValue) {
                        fieldValue = propertyField.defaultValue;
                      }

                      let displayValue = "";
                      if (fieldValue !== undefined && fieldValue !== null) {
                        // Check for the default value first
                        // Some of the values are under defaultValue others are directly under value
                        if (
                          typeof fieldValue === "object" &&
                          "defaultValue" in fieldValue &&
                          fieldValue.defaultValue
                        ) {
                          if (
                            typeof fieldValue.defaultValue === "object" &&
                            "value" in fieldValue.defaultValue
                          ) {
                            displayValue = String(
                              fieldValue.defaultValue.value || ""
                            );
                          } else {
                            displayValue = String(fieldValue.defaultValue);
                          }
                        }
                        // Check for direct value
                        else if (
                          typeof fieldValue === "object" &&
                          "value" in fieldValue
                        ) {
                          displayValue = String(fieldValue.value || "");
                        }
                        // Finally, use the field value directly
                        else {
                          displayValue = String(fieldValue);
                        }
                      }

                      return (
                        <div
                          key={nestedIndex}
                          className="flex flex-col sm:flex-row sm:items-start  py-2"
                        >
                          <div className="flex-shrink-0 w-40 text-sm font-medium text-foreground">
                            {label}
                          </div>
                          <div className="flex-1 text-xs text-foreground break-all">
                            {displayValue ? (
                              <span className="text-xs bg-background px-3 py-1.5 rounded-md border border-border text-foreground">
                                {displayValue}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic text-sm">
                                Not specified
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            );
          }

          const propertyField: PropertyShape = field as PropertyShape;

          const label = propertyField.name?.[VALUE_KEY] || "Unknown Field";
          const fieldId = propertyField.fieldId || propertyField["@id"] || "";

          let fieldValue = null;

          if (instance && fieldId) {
            // Try to find the field in the instance data
            // Handle both direct field names and group-prefixed field names
            const directField = instance[fieldId];
            if (directField !== undefined) {
              fieldValue = directField;
            } else {
              // Try to find by matching the property name
              const propertyName = propertyField.name?.[VALUE_KEY];

              if (propertyName && instance[propertyName] !== undefined) {
                fieldValue = instance[propertyName];
              }
            }
          }
          // If no instance data found, try to use defaultValue from the form template
          if (fieldValue === null && propertyField.defaultValue) {
            fieldValue = propertyField.defaultValue;
          }

          let displayValue = "";
          if (fieldValue !== undefined && fieldValue !== null) {
            // Check for defaultValue first
            if (
              typeof fieldValue === "object" &&
              "defaultValue" in fieldValue &&
              fieldValue.defaultValue
            ) {
              if (
                typeof fieldValue.defaultValue === "object" &&
                "value" in fieldValue.defaultValue
              ) {
                displayValue = String(fieldValue.defaultValue.value || "");
              } else {
                displayValue = String(fieldValue.defaultValue);
              }
            } else if (
              typeof fieldValue === "object" &&
              "value" in fieldValue
            ) {
              displayValue = String(fieldValue.value || "");
            } else {
              displayValue = String(fieldValue);
            }
          }

          return (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-start gap-4 py-2"
            >
              <div className="flex-shrink-0 w-40 text-sm font-medium text-foreground">
                {label}
              </div>
              <div className="flex-1 text-xs text-foreground break-all">
                {displayValue ? (
                  <span className="text-xs bg-background px-3 py-1.5 rounded-md border border-border text-foreground">
                    {displayValue}
                  </span>
                ) : (
                  <span className="text-gray-400 italic text-sm">
                    Not specified
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState } from "react";
import { AgentResponseBody } from "types/backend-agent";
import {
  FormTemplateType,
  PropertyShapeOrGroup,
  PropertyShape,
  TYPE_KEY,
  PROPERTY_GROUP_TYPE,
  VALUE_KEY,
} from "types/form";
import { makeInternalRegistryAPIwithParams } from "utils/internal-api-services";
import LoadingSpinner from "ui/graphic/loader/spinner";
import { FieldValues, useForm, UseFormReturn } from "react-hook-form";
import { parsePropertyShapeOrGroupList } from "../form-utils";

interface EntityDataDisplayProps {
  entityType: string;
  id?: string;
  additionalFields?: PropertyShapeOrGroup[];
}

export function EntityDataDisplay({
  entityType,
  id,
  additionalFields,
}: EntityDataDisplayProps) {
  const [formTemplate, setFormTemplate] = useState<FormTemplateType | null>(
    null
  );

  const form: UseFormReturn = useForm({
    defaultValues: async (): Promise<FieldValues> => {
      // All forms will require an ID to be assigned
      const initialState: FieldValues = {
        formType: "view", // Always view mode
        id: id,
      };

      // Get template with values for view mode
      const template = await fetch(
        makeInternalRegistryAPIwithParams("form", entityType, id),
        {
          cache: "no-store",
          credentials: "same-origin",
        }
      ).then(async (res) => {
        const body: AgentResponseBody = await res.json();
        return body.data?.items?.[0] as FormTemplateType;
      });

      if (additionalFields) {
        additionalFields.forEach((field: PropertyShapeOrGroup) =>
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
    <div className=" overflow-hidden">
      <div className="p-4 space-y-2">
        {formTemplate?.property.map((field, index) => {
          if (field[TYPE_KEY] === PROPERTY_GROUP_TYPE) {
            return null;
          }

          const propertyField = field as PropertyShape;

          const label = propertyField.name?.[VALUE_KEY] || "Unknown Field";
          const fieldId = propertyField.fieldId || propertyField["@id"] || "";
          const fieldValue = form.getValues(fieldId);

          // Extract value from the field value, handling different value types
          let displayValue = "";
          if (fieldValue !== undefined && fieldValue !== null) {
            if (typeof fieldValue === "object" && "value" in fieldValue) {
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

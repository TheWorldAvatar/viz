import { useEffect, useState } from "react";
import { AgentResponseBody } from "types/backend-agent";
import { RegistryFieldValues } from "types/form";
import { makeInternalRegistryAPIwithParams } from "utils/internal-api-services";
import LoadingSpinner from "ui/graphic/loader/spinner";

interface EntityDataDisplayProps {
  entityType: string;
  id: string;
}

interface DataField {
  label: string;
  value: string;
}

export function EntityDataDisplay({ entityType, id }: EntityDataDisplayProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [entityData, setEntityData] = useState<DataField[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntityData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          makeInternalRegistryAPIwithParams("instances", entityType, id),
          {
            cache: "no-store",
            credentials: "same-origin",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch entity data: ${response.statusText}`
          );
        }

        const responseBody: AgentResponseBody = await response.json();

        if (!responseBody.data?.items || responseBody.data.items.length === 0) {
          throw new Error("No entity data found");
        }

        const data = responseBody.data.items[0] as RegistryFieldValues;

        // Convert the entity data to label/value pairs
        const fields: DataField[] = Object.entries(data)
          .map(([key, field]) => {
            let value = "";

            if (Array.isArray(field)) {
              // Handle array fields
              value = field.map((f) => f.value || "").join(", ");
            } else if (typeof field === "object" && field !== null) {
              // Handle object fields (like SparqlResponseField)
              if ("value" in field) {
                value = (field as { value: string }).value || "";
              } else {
                value = "";
              }
            } else {
              // Handle primitive values
              value = String(field || "");
            }

            // Clean up the key to make it more readable
            const label = key
              .replace(/^@/, "") // Remove @ prefix
              .replace(/([A-Z])/g, " $1") // Add space before capital letters
              .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
              .trim();

            return { label, value };
          })
          .filter((field) => field.value && field.value.trim() !== ""); // Only show fields with values

        setEntityData(fields);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch entity data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (entityType && id) {
      fetchEntityData();
    }
  }, [entityType, id]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <LoadingSpinner isSmall={true} />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 text-center">Error: {error}</div>;
  }

  if (entityData.length === 0) {
    return (
      <div className="text-gray-500 p-4 text-center">No data available</div>
    );
  }

  return (
    <div className=" overflow-hidden">
      <div className="p-4 space-y-2">
        {entityData.map((field, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row sm:items-start gap-4 py-2"
          >
            <div className="flex-shrink-0 w-40 text-sm font-medium text-foreground">
              {field.label}
            </div>
            <div className="flex-1 text-xs text-foreground break-all">
              {field.value ? (
                <span className="text-xs bg-background px-3 py-1.5 rounded-md border border-border text-foreground">
                  {field.value}
                </span>
              ) : (
                <span className="text-gray-400 italic text-sm">
                  Not specified
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

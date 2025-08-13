import {
  ColumnDef
} from "@tanstack/react-table";
import { FieldValues } from "react-hook-form";
import {
  RegistryFieldValues
} from "types/form";
import StatusComponent from "ui/text/status/status";
import { parseWordsForLabels } from "utils/client-utils";

export type TableData = {
  data: FieldValues[];
  columns: ColumnDef<FieldValues>[];
}

/**
 * Parses raw data from API into table data format suitable for rendering.
 *
 * @param {RegistryFieldValues[]} instances Raw instances queried from knowledge graph
 */
export function parseDataForTable(instances: RegistryFieldValues[]): TableData {
  const results: TableData = {
    data: [],
    columns: [],
  };
  if (instances?.length > 0) {
    let maxFieldLength: number = 0;
    instances.map(instance => {
      const flattenInstance: Record<string, string> = {};
      const fields: string[] = Object.keys(instance);
      fields.forEach((field) => {
        const fieldValue = instance[field];
        if (Array.isArray(fieldValue)) {
          flattenInstance[field] = fieldValue[0]?.value;
        } else {
          flattenInstance[field] = fieldValue?.value;
        }
        // Whenever the number of fields in a row exceeds the current max number of fields,
        // update column definitions to follow the new max
        if (fields.length > maxFieldLength) {
          const title: string = parseWordsForLabels(field);
          const minWidth: number = Math.max(
            title.length * 15,
            125
          );
          results.columns.push({
            accessorKey: field,
            header: title,
            cell: ({ getValue }) => {
              const value: string = getValue() as string;
              if (!value) return "";

              if (field.toLowerCase() === "status") {
                return <StatusComponent status={value} />;
              }

              return (
                <div className="text-foreground">
                  {parseWordsForLabels(value)}
                </div>
              );
            },
            size: minWidth,
            enableSorting: true,
          })
        }
      });
      results.data.push(flattenInstance);
      if (fields.length > maxFieldLength) {
        maxFieldLength = fields.length;
      }
    });
  }
  return results;
}
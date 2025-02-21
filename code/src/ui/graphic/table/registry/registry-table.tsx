import styles from "./registry.table.module.css";

import React from "react";
import { FieldValues } from "react-hook-form";

import { RegistryFieldValues, RegistryTaskOption } from "types/form";
import { parseWordsForLabels } from "utils/client-utils";
import RegistryRowActions from "./actions/registry-table-action";
import StatusComponent from "ui/text/status/status";

import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { RegistryTableTheme } from "./registry-table-theme";

interface RegistryTableProps {
  recordType: string;
  lifecycleStage: string;
  instances: RegistryFieldValues[];
  setTask: React.Dispatch<React.SetStateAction<RegistryTaskOption>>;
  limit?: number;
}

/**
 * This component renders a registry of table based on the inputs.
 *
 * @param {string} recordType The type of the record.
 * @param {string} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {RegistryFieldValues[]} instances The instance values for the table.
 * @param setTask A dispatch method to set the task option when required.
 * @param {number} limit Optional limit to the number of columns shown.
 */
export default function RegistryTable(props: Readonly<RegistryTableProps>) {
  // Generate a list of column headings
  // const columns: ColumnDef<Record<string, string>>[] = React.useMemo(() => {
  const columns: GridColDef[] = React.useMemo(() => {
    if (props.instances?.length === 0) return [];
    return [
      {
        field: "actions",
        headerName: "",
        width: 25,
        headerClassName: styles["header"],
        cellClassName: styles["header-text"],
        renderCell: (params) => {
          return (
            <RegistryRowActions
              recordType={props.recordType}
              lifecycleStage={props.lifecycleStage}
              row={params.row}
              setTask={props.setTask}
            />
          );
        },
      },
      // Get instances with the most number of fields
      ...Object.keys(
        props.instances.reduce((prev, current) => {
          const prevKeys = Object.keys(prev).length;
          const currentKeys = Object.keys(current).length;
          return prevKeys >= currentKeys ? prev : current;
        })
      ).map((field) => ({
        field,
        headerName: parseWordsForLabels(field),
        width: 100, // Adjust the width as needed
        headerClassName: styles["header"],
        cellClassName: styles["header-text"],
        renderCell: (params: GridRenderCellParams) => {
          // Render status differently
          if (field.toLowerCase() === "status") {
            return <StatusComponent status={`${params.value}`} />;
          }
          if (params.value) {
            return parseWordsForLabels(`${params.value}`);
          }
          return "";
        },
      })),
    ];
  }, [props.instances]);

  // Parse row values
  const data: FieldValues[] = React.useMemo(() => {
    if (props.instances?.length === 0) return [];
    // Extract only the value into the data to simplify
    return props.instances.map((instance) => {
      const flattenInstance: Record<string, string> = {};
      Object.keys(instance).forEach((field) => {
        const fieldValue = instance[field];
        if (Array.isArray(fieldValue)) {
          flattenInstance[field] = fieldValue[0]?.value; // Handle array of SparqlResponseField
        } else {
          flattenInstance[field] = fieldValue?.value;
        }
      });
      return flattenInstance;
    });
  }, [props.instances]);

  return (
    <RegistryTableTheme>
      <Box>
        <DataGrid
          className={styles["table"]}
          rows={data}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          checkboxSelection={false}
          disableRowSelectionOnClick={false}
          autosizeOnMount={true}
          getRowId={(row) => row.id || row.iri}
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? styles["even-row"] : styles["odd-row"]
          }
          getCellClassName={() => styles["body-cell"]}
        />
      </Box>
    </RegistryTableTheme>
  );
}

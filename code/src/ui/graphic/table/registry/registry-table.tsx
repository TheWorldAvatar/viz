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

import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

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
  const columns: ColumnsType<any> = React.useMemo(() => {
    if (props.instances?.length === 0) return [];
    return [
      {
        key: "actions",
        title: '',
        width: 25,
        className: styles["header"],
        cellClassName: styles["header-text"],
        render: (_, record) => (
          <RegistryRowActions
            recordType={props.recordType}
            lifecycleStage={props.lifecycleStage}
            row={record}
            setTask={props.setTask}
          />
        ),
      },
      // Get instances with the most number of fields
      ...Object.keys(
        props.instances.reduce((prev, current) => {
          const prevKeys = Object.keys(prev).length;
          const currentKeys = Object.keys(current).length;
          return prevKeys >= currentKeys ? prev : current;
        })
      ).map((field) => ({
        key: field,
        dataIndex: field,
        title: parseWordsForLabels(field),
        width: 100,
        className: styles["header"],
        render: (value) => {
          if (field.toLowerCase() === "status") {
            return <StatusComponent status={`${value}`} />;
          }
          if (value) {
            return parseWordsForLabels(`${value}`);
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
    return props.instances.map((instance, index) => {
      const flattenInstance: Record<string, string> = { key: `row-${index}` };
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
    <Table
      className={styles["table"]}
      dataSource={data}
      columns={columns}
      pagination={{
        defaultPageSize: 10,
        pageSizeOptions: [5, 10, 20],
        showSizeChanger: true
      }}
      rowKey={(record) => record.id || record.iri}
      rowClassName={(record, index) =>
        index % 2 === 0 ? styles["even-row"] : styles["odd-row"]
      }
      onRow={(record) => ({
        className: styles["body-cell"]
      })}
    />
  );
} 

import styles from "./registry.table.module.css";
import React from "react";
import { FieldValues } from "react-hook-form";
import { RegistryFieldValues, RegistryTaskOption } from "types/form";
import { parseWordsForLabels } from "utils/client-utils";
import RegistryRowActions from "./actions/registry-table-action";
import StatusComponent from "ui/text/status/status";
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
        fixed: 'left'
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
        ellipsis: true,
        render: (value) => {
          if (!value) return "";
          if (field.toLowerCase() === "status") {
            return <StatusComponent status={`${value}`} />;
          }
          return parseWordsForLabels(`${value}`);
        },
        sorter: (a, b) => {
          if (!a[field] || !b[field]) return 0;
          return `${a[field]}`.localeCompare(`${b[field]}`);
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
        showSizeChanger: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        position: ['bottomCenter']
      }}
      rowKey={(record) => record.id || record.iri || record.key}
      rowClassName={(record, index) =>
        `${styles["body-cell"]} ${index % 2 === 0 ? styles["even-row"] : styles["odd-row"]}`
      }
      scroll={{ x: 'max-content' }}
      size="middle"
      sticky={{ offsetHeader: 0 }}
      bordered={false}
      responsive={true}
      showSorterTooltip={true}
      locale={{
        triggerDesc: 'Sort descending',
        triggerAsc: 'Sort ascending',
        cancelSort: 'Cancel sort',
        emptyText: (
          <div style={{ padding: '20px', color: 'var(--text-color-secondary)' }}>
            <span className="material-symbols-outlined" style={{ marginRight: '8px' }}>info</span>
            <span>No data available</span>
          </div>
        )
      }}
    />
  );
}

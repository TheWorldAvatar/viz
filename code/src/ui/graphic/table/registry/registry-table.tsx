import styles from "./registry.table.module.css";

import { Table, TableColumnsType, Typography } from 'antd';
import React from 'react';
import { FieldValues } from "react-hook-form";

import { RegistryFieldValues, RegistryTaskOption } from "types/form";
import AntDesignConfig from "ui/css/ant-design-style";
import StatusComponent from "ui/text/status/status";
import { parseWordsForLabels } from "utils/client-utils";
import RegistryRowActions from "./actions/registry-table-action";

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
  const columns: TableColumnsType<FieldValues> = React.useMemo(() => {
    if (props.instances?.length === 0) return [];
    return [
      {
        key: "actions",
        title: '',
        className: styles["header"],
        render: (_, record) => (
          <RegistryRowActions
            recordType={props.recordType}
            lifecycleStage={props.lifecycleStage}
            row={record}
            setTask={props.setTask}
          />
        ),
        fixed: 'left',
        width: 60
      },
      // Get instances with the most number of fields
      ...Object.keys(
        props.instances.reduce((prev, current) => {
          const prevKeys = Object.keys(prev).length;
          const currentKeys = Object.keys(current).length;
          return prevKeys >= currentKeys ? prev : current;
        })
      ).map((field) => {
        // minimum width based on field name
        const title = parseWordsForLabels(field);
        // Set minimum width based on column title length
        const minWidth = Math.max(
          title.length * 18, // Title width + space for icons (sort + filter)
          getMaxContentLength(props.instances, field) * 8, // Based on content
          80 // Minimum width
        );

        return {
          key: field,
          dataIndex: field,
          className: styles["header"],
          title: parseWordsForLabels(field),
          ellipsis: true,
          width: minWidth,
          render: (value: FieldValues) => {
            if (!value) return "";
            if (field.toLowerCase() === "status") {
              return <StatusComponent status={`${value}`} />;
            }
            return <Typography.Text className={styles["row-cell"]}>
              {parseWordsForLabels(`${value}`)}
            </Typography.Text>
          },
          sorter: (a: FieldValues, b: FieldValues) => {
            if (!a[field] || !b[field]) return 0;
            return `${a[field]}`.localeCompare(`${b[field]}`);
          },
          // Filtering
          filters: getColumnFilters(props.instances, field),
          onFilter: (value, record) =>
            record[field] ? record[field].toString() === value.toString() : false,
          filters: getColumnFilters(props.instances, field),
          onFilter: (value, record) =>
            record[field] ? record[field].toString() === value.toString() : false,
          filterSearch: true,
        };
      }),
    ];
  }, [props.instances]);

  // Function to generate filter options for columns
  function getColumnFilters(instances: RegistryFieldValues[], field: string) {
    if (field === 'id' || field === 'iri' || field === 'key') return undefined;
    // Get unique values for the field
    const uniqueValues = [...new Set(
      instances
        .map(item => {
          const fieldValue = item[field];
          if (Array.isArray(fieldValue)) {
            return fieldValue[0]?.value;
          } else {
            return fieldValue?.value;
          }
        })
        .filter(Boolean)
    )];

    return uniqueValues.map(value => ({
      text: parseWordsForLabels(`${value}`),
      value: value,
    }));
  }

  // Function to calculate the max content length in a column
  function getMaxContentLength(instances: RegistryFieldValues[], field: string): number {
    let maxLength = 0;
    instances.forEach(instance => {
      const fieldValue = instance[field];
      let valueStr = '';

      if (Array.isArray(fieldValue)) {
        valueStr = String(fieldValue[0]?.value || '');
      } else {
        valueStr = String(fieldValue?.value || '');
      }

      maxLength = Math.max(maxLength, valueStr.length);
    });

    return maxLength;
  }

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
    <AntDesignConfig>
      <Table
        className={styles["table"]}
        rowClassName={styles["row"]}
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
        scroll={{ x: 'max-content' }}
        size="middle"
        sticky={{ offsetHeader: 0 }}
        bordered={false}
        showSorterTooltip={true}
        locale={{
          triggerDesc: 'Sort descending',
          triggerAsc: 'Sort ascending',
          cancelSort: 'Cancel sort',
          filterConfirm: 'OK',
          filterReset: 'Reset',
          filterEmptyText: 'No filters',
          filterSearchPlaceholder: 'Search in filters',
          emptyText: (
            <div style={{ padding: '20px', color: 'var(--text-color-secondary)' }}>
              <span className="material-symbols-outlined" style={{ marginRight: '8px' }}>info</span>
              <span>No data available</span>
            </div>
          )
        }}
      />
    </AntDesignConfig>
  );
}
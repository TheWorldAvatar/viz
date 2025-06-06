import styles from "./registry.table.module.css";

import { Table, TableColumnsType, Typography } from 'antd';

import React from 'react';
import { FieldValues } from "react-hook-form";

import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import { LifecycleStage, RegistryFieldValues, RegistryTaskOption } from "types/form";
import AntDesignConfig from "ui/css/ant-design-style";
import StatusComponent from "ui/text/status/status";
import { parseWordsForLabels } from "utils/client-utils";
import RegistryRowActions from "./actions/registry-table-action";

interface RegistryTableProps {
  recordType: string;
  lifecycleStage: LifecycleStage;
  instances: RegistryFieldValues[];
  setTask: React.Dispatch<React.SetStateAction<RegistryTaskOption>>;
  limit?: number;
}

/**
 * This component renders a registry of table based on the inputs.
 *
 * @param {string} recordType The type of the record.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {RegistryFieldValues[]} instances The instance values for the table.
 * @param setTask A dispatch method to set the task option when required.
 * @param {number} limit Optional limit to the number of columns shown.
 */
export default function RegistryTable(props: Readonly<RegistryTableProps>) {
  const dict: Dictionary = useDictionary();

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
        // Set minimum width to require space for title and icons
        const minWidth = Math.max(
          title.length * 15, // Compute based on title length
          125 // Minimum width
        );

        return {
          key: field,
          dataIndex: field,
          className: styles["header"],
          title: title,
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
        };
      }),
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
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
          position: ['bottomCenter']
        }}
        rowKey={(record) => record.event_id ?? record.id ?? record.iri ?? record.key}
        scroll={{ x: 'max-content' }}
        size="middle"
        sticky={{ offsetHeader: 0 }}
        bordered={false}
        showSorterTooltip={true}
        locale={{
          triggerAsc: dict.action.sortasc,
          triggerDesc: dict.action.sortdesc,
          cancelSort: dict.action.clearSort,
          filterConfirm: dict.action.update.toUpperCase(),
          filterReset: dict.action.clear.toUpperCase(),
          filterEmptyText: dict.message.noData,
          filterSearchPlaceholder: dict.action.search,
          emptyText: (
            <span>{dict.message.noData}</span>
          )
        }}
      />
    </AntDesignConfig>
  );
}
import styles from "./registry.table.module.css";

import React, { useEffect, useRef, useState } from 'react';
import { FieldValues } from "react-hook-form";
import { Table, TableColumnsType } from 'antd';

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
  const tableRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const [tableWidth, setTableWidth] = useState<number>(0);
  const [clientWidth, setClientWidth] = useState<number>(0);

  // Synchronize scrolling between the table and the scrollbar
  useEffect(() => {
    const tableElement = tableRef.current?.querySelector('.ant-table-body');
    const scrollbarElement = scrollbarRef.current;

    if (!tableElement || !scrollbarElement) return;

    // Set initial dimensions
    setTableWidth(tableElement.scrollWidth);
    setClientWidth(tableElement.clientWidth);

    // When the table scrolls, update the scrollbar position
    const handleTableScroll = () => {
      // Temporarily remove the scrollbar's scroll event listener to prevent loops
      scrollbarElement.removeEventListener('scroll', handleScrollbarScroll);
      scrollbarElement.scrollLeft = tableElement.scrollLeft;
      // Re-add the event listener after a small delay
      setTimeout(() => {
        scrollbarElement.addEventListener('scroll', handleScrollbarScroll);
      }, 10);
    };

    // When the scrollbar scrolls, update the table position
    const handleScrollbarScroll = () => {
      // Temporarily remove the table's scroll event listener to prevent loops
      tableElement.removeEventListener('scroll', handleTableScroll);
      tableElement.scrollLeft = scrollbarElement.scrollLeft;
      // Re-add the event listener after a small delay
      setTimeout(() => {
        tableElement.addEventListener('scroll', handleTableScroll);
      }, 10);
    };

    // Add event listeners
    tableElement.addEventListener('scroll', handleTableScroll);
    scrollbarElement.addEventListener('scroll', handleScrollbarScroll);

    // Clean up
    return () => {
      tableElement.removeEventListener('scroll', handleTableScroll);
      scrollbarElement.removeEventListener('scroll', handleScrollbarScroll);
    };
  }, [props.instances]);

  // Generate a list of column headings
  const columns: TableColumnsType<FieldValues> = React.useMemo(() => {
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
        render: (value: FieldValues) => {
          if (!value) return "";
          if (field.toLowerCase() === "status") {
            return <StatusComponent status={`${value}`} />;
          }
          return parseWordsForLabels(`${value}`);
        },
        sorter: (a: FieldValues, b: FieldValues) => {
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
    <AntDesignConfig>
      <div ref={tableRef} className={styles["table-wrapper"]}>
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
          scroll={{ x: 'max-content' }}
          size="middle"
          sticky={{ offsetHeader: 0 }}
          bordered={false}
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

        {/* Simple scrollbar element */}
        <div className={styles["scrollbar-container"]}>
          <div
            ref={scrollbarRef}
            style={{
              overflowX: 'auto',
              overflowY: 'hidden',
              height: '8px',
              width: '100%'
            }}
          >
            <div style={{ width: tableWidth + 'px', height: '1px' }}></div>
          </div>
        </div>
      </div>
    </AntDesignConfig>
  );
}
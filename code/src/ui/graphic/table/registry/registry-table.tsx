import styles from "./registry.table.module.css";

import { Input, Space, Table, TableColumnsType, Typography, Select } from 'antd';

import React, { useState, useMemo } from 'react';
import { FieldValues } from "react-hook-form";

import { Dictionary } from "types/dictionary";
import { RegistryFieldValues, RegistryTaskOption } from "types/form";
import AntDesignConfig from "ui/css/ant-design-style";
import StatusComponent from "ui/text/status/status";
import { parseWordsForLabels } from "utils/client-utils";
import { useDictionary } from "utils/dictionary/DictionaryContext";
import RegistryRowActions from "./actions/registry-table-action";
import ClickActionButton from "ui/interaction/action/click/click-button";

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
  const dict: Dictionary = useDictionary();
  const [searchText, setSearchText] = useState<string>('');
  const [searchColumn, setSearchColumn] = useState<string>('');

  // Add states for the applied filters
  const [appliedSearchText, setAppliedSearchText] = useState<string>('');
  const [appliedSearchColumn, setAppliedSearchColumn] = useState<string>('');

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
          // Filtering
          filters: getColumnFilters(props.instances, field),
          onFilter: (value: React.Key | boolean, record: FieldValues) =>
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


  // Generate search options based on columns
  const searchOptions = useMemo(() => {
    if (columns.length === 0) return [];

    return columns
      .filter(col => col.key !== 'actions' && typeof col.dataIndex === 'string') // Exclude action column
      .map(col => ({
        value: col.dataIndex as string,
        label: col.title as string
      }));
  }, [columns]);

  // Filter function that respects column selection
  const filteredData = useMemo(() => {
    if (!appliedSearchText.trim() || !appliedSearchColumn) return data;

    return data.filter((record) => {
      // Search only the selected column
      const value = record[appliedSearchColumn];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(appliedSearchText.toLowerCase());
      }
      return false;
    });
  }, [data, appliedSearchText, appliedSearchColumn]);

  // Handler for the Update button
  const handleUpdate = () => {
    setAppliedSearchText(searchText);
    setAppliedSearchColumn(searchColumn);
  };

  // Handler for the Clear button
  const handleClear = () => {
    setSearchText('');
    setAppliedSearchText('');
  };

  // Search input handler
  const handleColumnChange = (value: string) => {
    setSearchColumn(value);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  return (
    <AntDesignConfig>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Select
          value={searchColumn}
          style={{ width: 180 }}
          onChange={handleColumnChange}
          options={searchOptions}
          placeholder={dict.action.selectColumn || 'Select column'}
        />
        <Input
          placeholder={dict.action.search}
          value={searchText}
          onChange={handleSearch}
          prefix={<span className="material-symbols-outlined">search</span>}
          style={{ width: 200 }}
        />
        <ClickActionButton
          icon="update"
          tooltipText={dict.action.update || 'Update'}
          onClick={handleUpdate}
          isHoverableDisabled={!searchText || !searchColumn}
        />
        <ClickActionButton
          icon="close"
          tooltipText={dict.action.clear || 'Clear'}
          onClick={handleClear}
          isHoverableDisabled={!appliedSearchText && !appliedSearchColumn}
        />
      </Space>
      <Table
        className={styles["table"]}
        rowClassName={styles["row"]}
        dataSource={filteredData}
        columns={columns}
        pagination={{
          defaultPageSize: 10,
          pageSizeOptions: [5, 10, 20],
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
          position: ['bottomCenter']
        }}
        rowKey={(record) => record.id || record.iri || record.key}
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
import React from "react";
import { Table, Button, Tooltip, theme, TreeSelect } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { FilterDropdownProps } from "antd/es/table/interface";

// Import your custom utility and components
import { parseWordsForLabels } from "utils/client-utils";
import StatusComponent from "ui/text/status/status";
import { RegistryFieldValues, RegistryTaskOption } from "types/form";

// Define a type for the table's data rows
type TableData = {
  key: string;
  [key: string]: string | number;
};

interface AntRegistryTableProps {
  recordType: string;
  lifecycleStage: string;
  instances: RegistryFieldValues[];
  setTask: React.Dispatch<React.SetStateAction<RegistryTaskOption>>;
  isLoading?: boolean;
}

export default function AntRegistryTable({
  instances,
  setTask,
  isLoading = false,
  ...props
}: AntRegistryTableProps) {
  const { token } = theme.useToken();

  // Handler for the state of pagination
  const [pageSize, setPageSize] = React.useState<number>(10);

  // Function to get unique values for a field to build filter tree
  const getUniqueFieldValues = React.useCallback(
    (field: string) => {
      if (!instances?.length) return [];

      const uniqueValues = new Set(
        instances.map((instance) => instance[field]?.value).filter(Boolean)
      );

      // Convert to array and map to proper filter format with text and value
      return Array.from(uniqueValues)
        .sort((a, b) => String(a).localeCompare(String(b)))
        .map((value) => ({
          text: parseWordsForLabels(String(value)), // Changed from title to text
          value: String(value),
          key: String(value),
        }));
    },
    [instances]
  );

  // Handler for the row action button
  const handleRowAction = React.useCallback(
    (record: TableData) => {
      setTask({
        id: record.id?.toString() || record.iri?.toString(),
        status: record.status?.toString(),
        contract: record.contract?.toString(),
      });
    },
    [setTask]
  );

  // Memoise columns and data so they only recalc when instances change
  const [columns, data] = React.useMemo(() => {
    if (!instances?.length) return [[], []];

    // Determine the instance with the most fields to extract the column keys
    const fieldKeys = Object.keys(
      instances.reduce((a, b) =>
        Object.keys(a).length > Object.keys(b).length ? a : b
      )
    );

    // Build table columns
    const columns: ColumnsType<TableData> = [
      {
        title: "",
        key: "actions",
        fixed: "left",
        width: "auto",
        render: (_, record) => (
          <Tooltip title="View Details">
            <Button
              type="link"
              icon={
                <span className="material-symbols-outlined">
                  expand_circle_right
                </span>
              }
              onClick={() => handleRowAction(record)}
            />
          </Tooltip>
        ),
      },
      ...fieldKeys.map((field) => ({
        title: parseWordsForLabels(field),
        dataIndex: field,
        key: field,
        sorter: {
          compare: (a, b) => customSorter(a[field], b[field]),
          multiple: 1,
        },
        filterMode: "tree",
        filterSearch: true,
        filters: getUniqueFieldValues(field),
        onFilter: (value: string, record: TableData) => {
          const recordValue = record[field];
          if (!recordValue) return false;
          return (
            String(recordValue).toLowerCase() === String(value).toLowerCase()
          );
        },
        filterMultiple: true,
        render: (value: unknown) => renderCell(value, field),
      })),
    ];

    // Transform the instances into table data
    const data = instances.map((instance) => ({
      key: instance.id?.value || instance.iri?.value,
      ...Object.fromEntries(
        Object.entries(instance).map(([k, v]) => [k, v.value])
      ),
    }));

    return [columns, data];
  }, [instances, handleRowAction, getUniqueFieldValues]);

  return (
    <Table
      loading={isLoading}
      columns={columns}
      dataSource={data}
      scroll={{ x: "max-content" }}
      pagination={{
        pageSize: pageSize,
        pageSizeOptions: [5, 10, 20, 50],
        showSizeChanger: true, // Allow users to change page size
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} items`,
        showQuickJumper: true, // Add quick jump capability
        responsive: true,
        position: ["bottomRight"],
        onChange: (page, newPageSize) => {
          if (newPageSize !== pageSize) {
            setPageSize(newPageSize);
          }
        },
      }}
      style={{
        backgroundColor: token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
      }}
      size="middle"
      bordered
      {...props}
    />
  );
}

// Helper function for custom sorting
function customSorter(a: unknown, b: unknown) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

// Helper function to render cell content
function renderCell(value: unknown, field: string) {
  if (field.toLowerCase() === "status") {
    return <StatusComponent status={String(value)} />;
  }
  return value ? parseWordsForLabels(String(value)) : null;
}

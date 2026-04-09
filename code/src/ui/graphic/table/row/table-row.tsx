import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender, Row } from "@tanstack/react-table";
import { usePermissionGuard } from "hooks/auth/usePermissionGuard";
import { useDrawerNavigation } from "hooks/drawer/useDrawerNavigation";
import useTableSession from "hooks/table/useTableSession";
import { useDictionary } from "hooks/useDictionary";
import useOperationStatus from "hooks/useOperationStatus";
import { Routes } from "io/config/routes";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { FieldValues, useForm, UseFormReturn } from "react-hook-form";
import { browserStorageManager } from "state/browser-storage-manager";
import { AgentResponseBody, InternalApiIdentifierMap } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import { FormTemplateType, FormTypeMap, LifecycleStageMap, PROPERTY_GROUP_TYPE, PropertyGroup, PropertyShape, PropertyShapeOrGroup, RegistryStatusMap, TYPE_KEY, VALUE_KEY } from "types/form";
import Button from "ui/interaction/button";
import { SelectOptionType } from "ui/interaction/dropdown/simple-selector";
import { parsePropertyShapeOrGroupList } from "ui/interaction/form/form-utils";
import Checkbox from "ui/interaction/input/checkbox";
import { getId } from "utils/client-utils";
import { DATE_KEY, EVENT_KEY } from "utils/constants";
import { FormSessionContextProvider } from "utils/form/FormSessionContext";
import { makeInternalRegistryAPIwithParams, queryInternalApi, queryInternalTaskFormTemplate } from "utils/internal-api-services";
import DragActionHandle from "../action/drag-action-handle";
import RegistryRowAction from "../action/registry-row-action";
import EditableTableCell from "../cell/editable-table-cell";
import TableCell from "../cell/table-cell";
import { EnhancedColumnDef, getRowRecordId } from "../registry/registry-table-utils";

interface TableRowProps {
  id: string;
  accountType: string;
  disableRowAction: boolean;
  row: Row<FieldValues>;
  triggerRefresh: () => void;
}

export interface TableRowHandle {
  getRowData: () => FieldValues;
}

/**
 * This component renders a draggable table row with an action menu on the first cell.
 *
 * @param {string} id The unique identifier for the row.
 * @param {string} accountType The type of account for billing capabilities.
 * @param {boolean} disableRowAction Hides the row actions for the user if true.
 * @param triggerRefresh A function to refresh the table when required.
 * @param {React.ReactNode} children The content of the row.
 */
export function TableRowRender(props: Readonly<TableRowProps>, ref: React.ForwardedRef<TableRowHandle>) {
  const dict: Dictionary = useDictionary();
  const [isBulkEditMode, setIsBulkEditMode] = useState<boolean>(false);
  const [dispatchDefaultValues, setDispatchDefaultValues] = useState<FieldValues>({});
  const [dispatchFormFields, setDispatchFormFields] = useState<Record<string, PropertyShape>>({});

  const { isLoading, resetFormSession } = useOperationStatus();
  const { navigateToDrawer } = useDrawerNavigation();
  const isPermitted = usePermissionGuard();
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: props.row?.id,
  });

  const { activeRowId, recordType, lifecycleStage, tableDescriptor, setActiveRowId, setHistoryId, setIsOpenHistoryModal, isBulkActionPermitted } = useTableSession();

  const isSelected: boolean = props.row?.getIsSelected();
  const isActive: boolean = activeRowId === props.id;

  const rowBackgroundClass: string = isActive
    ? "bg-success-background dark:bg-success-background hover:bg-success-background-hover"
    : isSelected
      ? "bg-neutral-background hover:bg-neutral-background-hover"
      : "bg-muted hover:bg-background";

  const onRowClick = async (row: FieldValues) => {
    if (isLoading) return;
    const recordId: string = getRowRecordId(row);
    setActiveRowId(recordId);
    // Clear any stored form data when clicking on a row
    browserStorageManager.clear();
    resetFormSession();
    if (
      lifecycleStage === LifecycleStageMap.TASKS ||
      lifecycleStage === LifecycleStageMap.OUTSTANDING ||
      lifecycleStage === LifecycleStageMap.SCHEDULED
    ) {
      // Determine the appropriate task route based on status and permissions
      let taskRoute: string;
      if (isPermitted("operation") &&
        ((row[dict.title.status] as string).toLowerCase() === RegistryStatusMap.NEW ||
          ((row[dict.title.status] as string).toLowerCase() === RegistryStatusMap.ASSIGNED &&
            lifecycleStage === LifecycleStageMap.SCHEDULED))
      ) {
        taskRoute = Routes.REGISTRY_TASK_DISPATCH;
      } else if (isPermitted("completeTask") &&
        (row[dict.title.status] as string).toLowerCase() === RegistryStatusMap.ASSIGNED
      ) {
        taskRoute = Routes.REGISTRY_TASK_COMPLETE;
      } else {
        taskRoute = Routes.REGISTRY_TASK_VIEW;
      }
      navigateToDrawer(taskRoute, recordId);
    } else if (lifecycleStage === LifecycleStageMap.CLOSED) {
      if (isPermitted("invoice") &&
        [RegistryStatusMap.COMPLETED, RegistryStatusMap.CANCELLED,
        RegistryStatusMap.REPORTED, RegistryStatusMap.BILLABLE_CANCELLED,
        RegistryStatusMap.BILLABLE_COMPLETED, RegistryStatusMap.BILLABLE_REPORTED].includes(row[dict.title.status].toLowerCase())
      ) {
        browserStorageManager.set(EVENT_KEY, row.event_id)
        browserStorageManager.set(DATE_KEY, row.date)
        const url: string = makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.BILL, FormTypeMap.ASSIGN_PRICE, row.id, row.date);
        const body: AgentResponseBody = await queryInternalApi(url);
        try {
          const res: AgentResponseBody = await queryInternalApi(makeInternalRegistryAPIwithParams(
            InternalApiIdentifierMap.FILTER,
            LifecycleStageMap.ACCOUNT,
            props.accountType,
            row[props.accountType]
          ));
          const options: SelectOptionType[] = res.data?.items as SelectOptionType[];
          // Set the account type in browser storage to match the values of the account type in the assign price form
          browserStorageManager.set(props.accountType, options[0]?.value);
        } catch (error) {
          console.error("Error fetching instances", error);
        }
        if (body.data.message == "true") {
          navigateToDrawer(Routes.REGISTRY_TASK_ACCRUAL, recordId);
        } else {
          navigateToDrawer(Routes.BILLING_ACTIVITY_PRICE, getId(row.id));
        }
      } else {
        navigateToDrawer(Routes.REGISTRY_TASK_VIEW, recordId);
      }
    } else if (lifecycleStage === LifecycleStageMap.INVOICE) {
      navigateToDrawer(Routes.REGISTRY, recordType, recordId);
    } else if (lifecycleStage === LifecycleStageMap.ACTIVE || lifecycleStage === LifecycleStageMap.ARCHIVE) {
      navigateToDrawer(Routes.REGISTRY, recordType, recordId);
    }
    else {
      const registryRoute: string = isPermitted("edit") ? Routes.REGISTRY_EDIT : Routes.REGISTRY;
      navigateToDrawer(registryRoute, recordType, recordId);
    }
  };

  useEffect(() => {
    // Declare an async function to retrieve the form template for executing the target action
    const getFormTemplate = async (): Promise<void> => {
      setDispatchDefaultValues({});
      setDispatchFormFields({});
      try {
        const template: FormTemplateType = await queryInternalTaskFormTemplate(FormTypeMap.DISPATCH, props.id);
        const initialState: FieldValues = {
          lockField: [] // An array that stores all fields that should be locked (disabled)
        };
        const fields: PropertyShapeOrGroup[] = parsePropertyShapeOrGroupList(initialState, FormTypeMap.MASS_EDIT, template?.property, {});
        fields.forEach((field) => {
          if (field[TYPE_KEY].includes(PROPERTY_GROUP_TYPE)) {
            (field as PropertyGroup).property.forEach((nestedField) => {
              setDispatchFormFields((prev) => ({
                ...prev,
                [nestedField.name[VALUE_KEY].replace(" ", "_")]: nestedField
              }));
            })
          } else {
            const fieldShape: PropertyShape = field as PropertyShape;
            setDispatchFormFields((prev) => ({
              ...prev,
              [fieldShape.name[VALUE_KEY].replace(" ", "_")]: fieldShape
            }));
          }
        });
        delete initialState.lockField;
        setDispatchDefaultValues(initialState);
      } catch (error) {
        console.error("Failed to fetch form template:", error);
      }
    };

    if (isBulkEditMode) {
      getFormTemplate();
    }
  }, [props.id, isBulkEditMode]);

  const form: UseFormReturn = useForm({
    defaultValues: dispatchDefaultValues,
  });

  useImperativeHandle(ref, () => ({
    getRowData: () => {
      if (props.row.getIsSelected()) {
        return {
          ...form.getValues(),
          id: props.id,
          contract: props.row.original.id,
          date: props.row.original.date,
        };
      }
      return {};
    }
  }));

  return (
    <FormSessionContextProvider formType={FormTypeMap.MASS_EDIT} entityType="">
      <tr
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition: transition,
        }}
        onClick={() => {
          if (tableDescriptor.isBulkDispatchEdit) {
            if (!isBulkEditMode) {
              setIsBulkEditMode(true);
            }
            props.row.toggleSelected(!props.row.getIsSelected());
          }
        }}
        className={`border-b border-border text-left relative ${isDragging ? "z-10 opacity-70" : "z-0"} ${rowBackgroundClass}`}
      >
        <TableCell className={`sticky left-0 z-20 cursor-default ${rowBackgroundClass}`}>
          <div className="flex items-center justify-evenly gap-0.5">
            {!props.disableRowAction && <DragActionHandle disabled={isLoading} id={props.row.id} />}
            {!tableDescriptor.isBulkDispatchEdit && <RegistryRowAction
              recordType={recordType}
              accountType={props.accountType}
              lifecycleStage={lifecycleStage}
              row={props.row.original}
              triggerRefresh={props.triggerRefresh}
              setActiveRowId={setActiveRowId}
            />}
            {!props.disableRowAction && !tableDescriptor.isBulkDispatchEdit && <Button
              leftIcon="history"
              size="icon"
              variant="ghost"
              tooltipText={dict.title.history}
              onClick={() => {
                setHistoryId(props.id);
                setIsOpenHistoryModal(true);
              }}
            />}
            {isBulkActionPermitted && (
              <Checkbox
                aria-label={props.row.id}
                className="mx-4 w-4 h-4 cursor-pointer"
                disabled={isLoading}
                checked={props.row.getIsSelected()}
                handleChange={(checked) => {
                  if (lifecycleStage == LifecycleStageMap.BILLABLE) {
                    tableDescriptor.setSelectedRows(props.id, !checked);
                  }
                  props.row.toggleSelected(checked);
                }}
              />
            )}
          </div>
        </TableCell>
        {props.row.getVisibleCells().map((cell, index) => {
          if (tableDescriptor.isBulkDispatchEdit &&
            (cell.column.columnDef as EnhancedColumnDef<FieldValues>).stage == FormTypeMap.DISPATCH) {
            return <EditableTableCell
              key={cell.id + index}
              isBulkEditMode={isBulkEditMode}
              fieldShape={dispatchFormFields[cell.column.id]}
              form={form}
            >
              {flexRender(
                cell.column.columnDef.cell,
                cell.getContext()
              )}
            </EditableTableCell>;
          } else {
            return <TableCell
              key={cell.id + index}
              width={cell.column.getSize()}
              className="cursor-pointer"
              onClick={tableDescriptor.isBulkDispatchEdit ? undefined : () => {
                if (lifecycleStage == LifecycleStageMap.BILLABLE) {
                  const isSelected: boolean = props.row.getIsSelected();
                  tableDescriptor.setSelectedRows(
                    getId(props.row.getValue("event_id")), isSelected);
                  props.row.toggleSelected(!isSelected);
                } else {
                  onRowClick(props.row.original as FieldValues);
                }
              }}
            >
              {flexRender(
                cell.column.columnDef.cell,
                cell.getContext()
              )}
            </TableCell>
          }
        })}
      </tr>
    </FormSessionContextProvider>
  );
};

const TableRow = forwardRef(TableRowRender);
export default TableRow;
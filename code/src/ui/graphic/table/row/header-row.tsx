import { Header } from "@tanstack/react-table";
import { usePermissionGuard } from "hooks/auth/usePermissionGuard";
import useTableSession from "hooks/table/useTableSession";
import { useDictionary } from "hooks/useDictionary";
import useOperationStatus from "hooks/useOperationStatus";
import { HTTP_METHOD } from "next/dist/server/web/http";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { FieldValues } from "react-hook-form";
import { AgentResponseBody, InternalApiIdentifierMap } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import { FormTypeMap, LifecycleStageMap } from "types/form";
import { JsonObject } from "types/json";
import DraftTemplateButton from "ui/interaction/action/draft-template/draft-template-button";
import PopoverActionButton from "ui/interaction/action/popover/popover-button";
import { toast } from "ui/interaction/action/toast/toast";
import Button from "ui/interaction/button";
import Checkbox from "ui/interaction/input/checkbox";
import { getId } from "utils/client-utils";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";
import HeaderCell from "../cell/header-cell";
import TableCell from "../cell/table-cell";
import { EnhancedColumnDef } from "../registry/registry-table-utils";

interface HeaderRowProps {
  accountType: string;
  headers: Header<FieldValues, unknown>[];
  triggerRefresh: () => void;
  selectedDate?: DateRange;
}

/**
 * This component renders a header row with a bulk action menu in the first column.
 *
 * @param {string} accountType The type of account for billing capabilities.
 * @param { Header<FieldValues, unknown>[]} headers Column metadata in tan stack format.
 * @param triggerRefresh A function to refresh the table when required.
 * @param {DateRange} selectedDate Optional parameter for the currently selected date.
 */
export default function HeaderRow(props: Readonly<HeaderRowProps>) {
  const dict: Dictionary = useDictionary();
  const [isActionMenuOpen, setIsActionMenuOpen] = useState<boolean>(false);
  const isPermitted = usePermissionGuard();
  const { isLoading, startLoading, stopLoading } = useOperationStatus();
  const { recordType, lifecycleStage, tableDescriptor, isBulkActionPermitted, onBulkEditSubmit } = useTableSession();
  const numberOfSelectedRows: number = tableDescriptor.table.getSelectedRowModel().rows.length;
  const hasAmendedStatus: boolean = tableDescriptor.table.getSelectedRowModel().rows.some(
    (row) => (row.original.status as string)?.toLowerCase() === "amended"
  );

  const handleBulkAction = async (action: "approve" | "resubmit") => {
    const selectedRows = tableDescriptor.table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      return;
    }

    const contractIds: string[] = selectedRows.map((row) => row.original.id);
    let reqBody: JsonObject;
    let apiUrl: string;
    let method: Omit<HTTP_METHOD, "HEAD" | "OPTIONS" | "PATCH">;

    switch (action) {
      case "approve":
        reqBody = {
          contract: contractIds,
          remarks: `${contractIds.length} contract(s) approved successfully!`,
        };
        apiUrl = makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.EVENT, "service", "commence");
        method = "POST";
        break;
      case "resubmit":
        reqBody = {
          contract: contractIds,
        };
        apiUrl = makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.EVENT, "draft", "reset");
        method = "PUT";
        break;
      default:
        throw new Error("Invalid action");
    }
    startLoading();
    const responseBody: AgentResponseBody = await queryInternalApi(apiUrl, method, JSON.stringify(reqBody));
    stopLoading();
    toast(
      responseBody?.data?.message || responseBody?.error?.message,
      responseBody?.error ? "error" : "success"
    );

    if (!responseBody?.error) {
      // Clear selection and refresh table
      tableDescriptor.table.resetRowSelection();
      props.triggerRefresh();
    }
  };

  return (
    <tr className="border-b border-border text-left bg-background text-foreground">
      <TableCell className="w-1/10 sticky left-0 z-20 bg-background">
        <div className="flex justify-end items-center rounded-md gap-2">
          {numberOfSelectedRows > 0 && (
            <PopoverActionButton
              placement="bottom-start"
              leftIcon={isActionMenuOpen ? "arrow_drop_up" : "arrow_drop_down"}
              variant="ghost"
              size="icon"
              tooltipText={dict.title.actions}
              isOpen={isActionMenuOpen}
              setIsOpen={setIsActionMenuOpen}
            >
              <div className="flex flex-col space-y-3">
                {
                  tableDescriptor.isBulkDispatchEdit && <Button
                    leftIcon="assignment_add"
                    label={dict.action.dispatch}
                    variant="ghost"
                    disabled={isLoading}
                    onClick={async () => {
                      await onBulkEditSubmit();
                      tableDescriptor.table.resetRowSelection();
                      tableDescriptor.setIsBulkDispatchEdit(false);
                      props.triggerRefresh();
                    }}
                  />
                }
                {lifecycleStage === LifecycleStageMap.PENDING && (
                  <>
                    <Button
                      leftIcon="done_outline"
                      label={dict.action.approve}
                      variant="ghost"
                      disabled={isLoading}
                      onClick={() => handleBulkAction("approve")}
                    />
                    {hasAmendedStatus && (
                      <Button
                        leftIcon="published_with_changes"
                        label={dict.action.resubmit}
                        variant="ghost"
                        disabled={isLoading}
                        onClick={() => handleBulkAction("resubmit")}
                      />
                    )}
                  </>
                )}
                {isPermitted("draftTemplate") && !tableDescriptor.isBulkDispatchEdit && (
                  <DraftTemplateButton
                    rowId={tableDescriptor.table.getSelectedRowModel().rows.map((row) => row.original.id)}
                    recordType={recordType}
                    triggerRefresh={props.triggerRefresh}
                    resetRowSelection={tableDescriptor.table.resetRowSelection}
                  />
                )}
              </div>
            </PopoverActionButton>
          )}

          {isBulkActionPermitted && !tableDescriptor.isBulkDispatchEdit && (
            <Checkbox
              aria-label={dict.action.selectAll}
              disabled={isLoading}
              className="w-4 h-4 mx-4 cursor-pointer"
              checked={tableDescriptor.table.getIsAllPageRowsSelected()}
              handleChange={(checked) => {
                tableDescriptor.table.getRowModel().rows.forEach((row) => {
                  if (lifecycleStage == LifecycleStageMap.BILLABLE) {
                    const eventId: string = getId(row.getValue("event_id"));
                    tableDescriptor.setSelectedRows(eventId, !checked);
                  }
                  row.toggleSelected(checked);
                });
              }}
            />
          )}
        </div>
      </TableCell>
      {props.headers.map((header, index) => {
        const colDef: EnhancedColumnDef<FieldValues> = header.column.columnDef as EnhancedColumnDef<FieldValues>;
        return (
          <HeaderCell
            key={header.id + index}
            type={recordType}
            table={tableDescriptor.table}
            header={header}
            lifecycleStage={lifecycleStage}
            selectedDate={props.selectedDate}
            filters={tableDescriptor.filters}
            isEditable={tableDescriptor.isBulkDispatchEdit && colDef.stage === FormTypeMap.DISPATCH}
            disableSort={colDef.dataType == "array"}
            disableFilter={colDef.dataType == "array" ||
              (lifecycleStage == LifecycleStageMap.BILLABLE && header.id == props.accountType)}
          />
        );
      })}
    </tr>
  );
}

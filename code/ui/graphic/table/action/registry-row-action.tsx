import { useRegistryRowPermissionGuard } from "@/hooks/auth/useRegistryRowPermissionGuard";
import { useDrawerNavigation } from "@/hooks/drawer/useDrawerNavigation";
import useTableSession from "@/hooks/table/useTableSession";
import { useDictionary } from "@/hooks/useDictionary";
import useOperationStatus from "@/hooks/useOperationStatus";
import { Routes } from "@/io/config/routes";
import { browserStorageManager } from "@/state/browser-storage-manager";
import { AgentResponseBody, InternalApiIdentifierMap } from "@/types/backend-agent";
import { Dictionary } from "@/types/dictionary";
import { FormTypeMap, LifecycleStage, LifecycleStageMap, RegistryStatusMap } from "@/types/form";
import { JsonObject } from "@/types/json";
import FileDownloadButtons from "@/ui/interaction/action/download/file-download";
import DraftTemplateButton from "@/ui/interaction/action/draft-template/draft-template-button";
import PopoverActionButton from "@/ui/interaction/action/popover/popover-button";
import { toast } from "@/ui/interaction/action/toast/toast";
import BillingModal from "@/ui/interaction/modal/billing-modal";
import { compareDates, getId, parseWordsForLabels } from "@/utils/client-utils";
import { FLAG_KEY } from "@/utils/constants";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "@/utils/internal-api-services";
import React from "react";
import { FieldValues } from "react-hook-form";
import AddEntityRowAction from "./registry/add-entity-row-action";
import ReviewBillableRowAction from "./registry/review-billable-row-action";
import RowActionButton from "./row-action-button";
import ViewAttachmentButton from "./view-attachment-button";
import { Ban, BanknoteX, Check, CircleDollarSign, CircleX, ClipboardList, Clock, EllipsisVertical, ExternalLink, Flag, Pencil, Trash2, TriangleAlert, Undo2, CircleCheckBig, HandCoins } from "lucide-react";


interface RegistryRowActionProps {
  recordType: string;
  accountType: string;
  lifecycleStage: LifecycleStage;
  row: FieldValues;
  triggerRefresh: () => void;
  setActiveRowId?: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * Renders the possible row actions for each row in the registry.
 *
 * @param {string} recordType The type of the record.
 * @param {string} accountType The type of account for billing capabilities.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {FieldValues} row Row values.
 * @param triggerRefresh A function to refresh the table when required.
 * @param setActiveRowId A function to set the active row ID.
 */
export default function RegistryRowAction(
  props: Readonly<RegistryRowActionProps>
) {
  const { navigateToDrawer } = useDrawerNavigation();
  const { addEntity, exportOptions } = useTableSession();

  const recordId: string = props.row.event_id
    ? getId(props.row.event_id)
    : props.row.id
      ? getId(props.row.id)
      : getId(props.row.iri);
  const dict: Dictionary = useDictionary();
  const isActionAllowed = useRegistryRowPermissionGuard(props.lifecycleStage, props.row?.status?.toLowerCase());

  const [isActionMenuOpen, setIsActionMenuOpen] =
    React.useState<boolean>(false);
  const [isOpenBillingModal, setIsOpenBillingModal] = React.useState<boolean>(false);
  const { isLoading, startLoading, stopLoading, resetFormSession } = useOperationStatus();

  /**
   * Performs these actions on every row click to reset states and mark row as active.
   */
  const handleClickRowAction = (): void => {
    // Mark row as action
    props.setActiveRowId?.(recordId);
    // Reset states
    browserStorageManager.clear();
    resetFormSession();
    // Close menu
    setIsActionMenuOpen(false);
  };

  const onApproval: React.MouseEventHandler<HTMLButtonElement> = async () => {
    const reqBody: JsonObject = {
      contract: recordId,
      remarks: "Contract has been approved successfully!",
    };
    const url: string = makeInternalRegistryAPIwithParams(
      InternalApiIdentifierMap.EVENT,
      "service",
      "commence"
    );
    submitPendingActions(url, "POST", JSON.stringify({ ...reqBody }));
  };

  const onResubmissionForApproval: React.MouseEventHandler<
    HTMLButtonElement
  > = async () => {
    const reqBody: JsonObject = {
      contract: recordId,
    };
    const url: string = makeInternalRegistryAPIwithParams(
      InternalApiIdentifierMap.EVENT,
      "draft",
      "reset"
    );
    submitPendingActions(url, "PUT", JSON.stringify({ ...reqBody }));
  };

  const onUpdateAccountFlag: React.MouseEventHandler<HTMLButtonElement> = async () => {
    const reqBody: JsonObject = {
      id: recordId,
      type: props.recordType,
    };
    const url: string = makeInternalRegistryAPIwithParams(
      InternalApiIdentifierMap.ACCOUNT,
      FLAG_KEY,
    );
    submitPendingActions(url, "PUT", JSON.stringify({ ...reqBody }));
  };

  const submitPendingActions = async (
    url: string,
    method: "POST" | "PUT" | "DELETE",
    body?: string
  ): Promise<void> => {
    startLoading();
    handleClickRowAction();
    const customAgentResponse: AgentResponseBody = await queryInternalApi(url, method, body);
    stopLoading();
    toast(
      customAgentResponse?.data?.message || customAgentResponse?.error?.message,
      customAgentResponse?.error ? "error" : "success"
    );
    props.triggerRefresh();
  };

  const handleClickView = (): void => {
    if (
      props.lifecycleStage == LifecycleStageMap.TASKS ||
      props.lifecycleStage == LifecycleStageMap.OUTSTANDING ||
      props.lifecycleStage == LifecycleStageMap.SCHEDULED ||
      props.lifecycleStage == LifecycleStageMap.CLOSED
    ) {
      // Navigate to task view modal route (drawer)
      navigateToDrawer(Routes.REGISTRY_TASK, `${FormTypeMap.VIEW}?id=${recordId}`);
    } else {
      // Move to the view page for the specific record (not a drawer)
      navigateToDrawer(Routes.REGISTRY, props.recordType, recordId);
    }
  };

  const onVoidTask: React.MouseEventHandler<HTMLButtonElement> = async () => {
    const taskId: string = getId(props.row.event_id);
    const reqBody: JsonObject = {
      id: taskId,
      contract: getId(props.row.id),
      date: props.row.date,
      previousEventId: taskId,
    };
    const url = makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.EVENT, "service", "void");
    submitPendingActions(url, "POST", JSON.stringify(reqBody));
  };

  const onRevertTask: React.MouseEventHandler<HTMLButtonElement> = () => {
    const taskId: string = getId(props.row.event_id);
    let action: "cancel" | "report" | "void";
    switch (props.row.status.toLowerCase()) {
      case RegistryStatusMap.CANCELLED:
        action = "cancel";
        break;
      case RegistryStatusMap.REPORTED:
        action = "report";
        break;
      case RegistryStatusMap.VOIDED:
        action = "void";
        break;
      default:
        console.warn("A valid task status is required to revert the task.");
        return;
    }
    const url: string = makeInternalRegistryAPIwithParams(
      InternalApiIdentifierMap.EVENT,
      "service",
      action,
      taskId
    );
    submitPendingActions(url, "DELETE");
  };

  const isSubmissionOrGeneralPage: boolean =
    props.lifecycleStage == LifecycleStageMap.PENDING || props.lifecycleStage == LifecycleStageMap.GENERAL ||
    props.lifecycleStage == LifecycleStageMap.ACCOUNT || props.lifecycleStage == LifecycleStageMap.PRICING ||
    props.lifecycleStage == LifecycleStageMap.ACTIVE || props.lifecycleStage == LifecycleStageMap.ARCHIVE ||
    props.lifecycleStage == LifecycleStageMap.INVOICE;

  return (
    <div aria-label="Actions">
      <PopoverActionButton
        placement="bottom-start"
        leftIcon={EllipsisVertical}
        variant="ghost"
        tooltipText={dict.title.actions}
        size="icon"
        className="ml-2"
        isOpen={isActionMenuOpen}
        setIsOpen={setIsActionMenuOpen}
        aria-label={`${dict.title.actions}, ${props.row.id}`}
      >
        <div className="flex flex-col space-y-8 lg:space-y-4 ">
          {isSubmissionOrGeneralPage && (
            <>
              <RowActionButton
                icon={ExternalLink}
                label={parseWordsForLabels(dict.action.view)}
                onClick={() => {
                  handleClickRowAction();
                  handleClickView();
                }}
              />
              {isActionAllowed("ADD_LINKED_ENTITY") && addEntity &&
                <AddEntityRowAction
                  recordType={props.recordType}
                  accountType={props.accountType}
                  row={props.row}
                  handleClickRowAction={handleClickRowAction}
                />
              }
              {isActionAllowed("TERMINATE_CONTRACT") &&
                <RowActionButton
                  icon={Ban}
                  disabled={isLoading}
                  label={dict.action.terminate}
                  onClick={() => {
                    handleClickRowAction();
                    navigateToDrawer(Routes.REGISTRY_TERMINATE, props.recordType, recordId);
                  }}
                />}
              {isActionAllowed("APPROVE_CONTRACT") &&
                <RowActionButton
                  icon={Check}
                  disabled={isLoading}
                  label={dict.action.approve}
                  onClick={onApproval}
                />}
              {isActionAllowed("RESUBMIT") &&
                <RowActionButton
                  icon={CircleCheckBig}
                  disabled={isLoading}
                  label={dict.action.resubmit}
                  onClick={onResubmissionForApproval}
                />
              }
              {isActionAllowed("EDIT") && <RowActionButton

                icon={Pencil}
                disabled={isLoading}
                label={dict.action.edit}
                onClick={() => {
                  handleClickRowAction();
                  navigateToDrawer(Routes.REGISTRY_EDIT, props.recordType, recordId);
                }}
              />}
              {isActionAllowed("DELETE") && <RowActionButton
                icon={Trash2}
                disabled={isLoading}
                label={dict.action.delete}
                onClick={() => {
                  handleClickRowAction();
                  navigateToDrawer(Routes.REGISTRY_DELETE, props.recordType, recordId);
                }}
              />}
            </>
          )}
          {!isSubmissionOrGeneralPage && (
            <>
              {props.lifecycleStage !== LifecycleStageMap.BILLABLE && <RowActionButton
                icon={ExternalLink}
                label={parseWordsForLabels(dict.action.view)}
                onClick={() => {
                  handleClickRowAction();
                  navigateToDrawer(Routes.REGISTRY_TASK, `${FormTypeMap.VIEW}?id=${recordId}`);
                }}
              />}
              {isActionAllowed("COMPLETE_TASK") && <RowActionButton
                icon={Check}
                disabled={isLoading}
                label={dict.action.complete}
                onClick={() => {
                  handleClickRowAction();
                  // Set a flag to indicate if the bill has been accrued, which determines the next navigation action
                  browserStorageManager.set(RegistryStatusMap.BILLABLE_COMPLETED,
                    (props.row.status.toLowerCase() === RegistryStatusMap.BILLABLE_COMPLETED).toString());
                  navigateToDrawer(Routes.REGISTRY_TASK, `${FormTypeMap.COMPLETE}?id=${recordId}`);
                }}
              />}
              {isActionAllowed("ASSIGN_TASK") && <RowActionButton
                icon={ClipboardList}
                label={dict.action.dispatch}
                onClick={() => {
                  handleClickRowAction();
                  navigateToDrawer(Routes.REGISTRY_TASK, `${FormTypeMap.DISPATCH}?id=${recordId}`);
                }}
              />}
              {isActionAllowed("RESCHEDULE_TASK") &&
                props.row.scheduleType == "singleService" && (
                  <RowActionButton
                    icon={Clock}
                    disabled={isLoading}
                    label={dict.action.reschedule}
                    onClick={() => {
                      handleClickRowAction();
                      navigateToDrawer(Routes.REGISTRY_TASK_RESCHEDULE, recordId);
                    }}
                  />
                )}
              {isActionAllowed("CANCEL_OR_REPORT_TASK") && compareDates(props.row?.date, true) && (
                <RowActionButton
                  icon={CircleX}
                  disabled={isLoading}
                  label={dict.action.cancel}
                  onClick={() => {
                    handleClickRowAction();
                    navigateToDrawer(Routes.REGISTRY_TASK, `${FormTypeMap.CANCEL}?id=${recordId}`);
                  }}
                />
              )}
              {isActionAllowed("CANCEL_OR_REPORT_TASK") && compareDates(props.row?.date, false) && (
                <RowActionButton
                  icon={TriangleAlert}
                  label={dict.action.report}
                  disabled={isLoading}
                  onClick={() => {
                    handleClickRowAction();
                    navigateToDrawer(Routes.REGISTRY_TASK, `${FormTypeMap.REPORT}?id=${recordId}`);
                  }}
                />
              )}
            </>
          )}
          {isActionAllowed("VIEW_FILES") && <ViewAttachmentButton
            id={getId(props.row.id)}
          />}
          {(isActionAllowed("ADJUST_PRICING")) && <RowActionButton
            icon={HandCoins}
            label={dict.action.adjustPricing}
            disabled={isLoading}
            onClick={() => {
              handleClickRowAction();
              // Get the id of the contract and avoid task id
              navigateToDrawer(Routes.REGISTRY_ADJUST_PRICING, getId(props.row.id));
            }}
          />}
          {(isActionAllowed("REVIEW_BILLABLES")) && <ReviewBillableRowAction
            recordType={props.recordType}
            accountType={props.accountType}
            row={props.row}
            handleClickRowAction={handleClickRowAction}
            triggerRefresh={props.triggerRefresh}
          />}
          {(isActionAllowed("VOID_TASK")) && <RowActionButton
            icon={Ban}
            label={dict.action.voidTask}
            disabled={isLoading}
            onClick={onVoidTask}
          />}
          {(isActionAllowed("UNDO_CANCEL_OR_REPORT_TASK") || isActionAllowed("UNVOID_TASK")) && <RowActionButton
            icon={Undo2}
            label={dict.action.revertStatus}
            disabled={isLoading}
            onClick={onRevertTask}
          />}
          {(isActionAllowed("EXEMPT_BILLABLES")) && <RowActionButton
            icon={BanknoteX}
            label={dict.action.exemptBillable}
            disabled={isLoading}
            onClick={() => {
              handleClickRowAction();
              navigateToDrawer(Routes.REGISTRY_TASK, `${FormTypeMap.EXEMPT}?id=${recordId}`);
            }}
          />}
          {isActionAllowed("VIEW_BILLABLES") && <RowActionButton
            icon={CircleDollarSign}
            label={dict.action.viewServiceCost}
            disabled={isLoading}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsActionMenuOpen(false);
              setIsOpenBillingModal(true);
            }}
          />}
          {exportOptions.length > 0 && <FileDownloadButtons
            targetId={recordId}
            exportOptions={exportOptions}
            disabled={isLoading}
            variant="ghost"
            className="w-full justify-start"
            onComplete={() => setIsActionMenuOpen(false)}
          />}
          {isActionAllowed("DRAFT_TEMPLATE") &&
            <DraftTemplateButton
              rowId={[props.row.id]}
              recordType={props.recordType}
              triggerRefresh={props.triggerRefresh}
              additionalAction={handleClickRowAction}
            />
          }
          {isActionAllowed("ACCOUNT_FLAG") && <RowActionButton
            icon={Flag}
            label={props.row.flag === "true" ? dict.action.flagResolution : dict.action.flag}
            disabled={isLoading}
            onClick={onUpdateAccountFlag}
          />}
        </div>
      </PopoverActionButton>
      {isOpenBillingModal && <BillingModal
        id={recordId}
        date={props.row.date}
        isOpen={isOpenBillingModal}
        setIsOpen={setIsOpenBillingModal}
      />}
    </div>
  );
}

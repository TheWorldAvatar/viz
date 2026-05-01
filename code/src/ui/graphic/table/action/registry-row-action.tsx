import { useRegistryRowPermissionGuard } from "hooks/auth/useRegistryRowPermissionGuard";
import { useDrawerNavigation } from "hooks/drawer/useDrawerNavigation";
import { useDictionary } from "hooks/useDictionary";
import useOperationStatus from "hooks/useOperationStatus";
import { Routes } from "io/config/routes";
import React from "react";
import { FieldValues } from "react-hook-form";
import { browserStorageManager } from "state/browser-storage-manager";
import { AgentResponseBody, InternalApiIdentifierMap } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import { LifecycleStage, LifecycleStageMap, RegistryStatusMap } from "types/form";
import { JsonObject } from "types/json";
import { FileDownloadButton } from "ui/interaction/action/download/file-download";
import DraftTemplateButton from "ui/interaction/action/draft-template/draft-template-button";
import PopoverActionButton from "ui/interaction/action/popover/popover-button";
import { toast } from "ui/interaction/action/toast/toast";
import BillingModal from "ui/interaction/modal/billing-modal";
import { compareDates, getId, parseWordsForLabels } from "utils/client-utils";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";
import { execReviewBillableAction } from "../registry/registry-table-utils";
import RowActionButton from "./row-action-button";


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
  const recordId: string = props.row.event_id
    ? getId(props.row.event_id)
    : props.row.id
      ? getId(props.row.id)
      : getId(props.row.iri);
  const dict: Dictionary = useDictionary();
  const isActionAllowed = useRegistryRowPermissionGuard(props.lifecycleStage, props.row?.status?.toLowerCase());

  const [isActionMenuOpen, setIsActionMenuOpen] =
    React.useState<boolean>(false);

  const { isLoading, startLoading, stopLoading, resetFormSession } = useOperationStatus();
  const [isOpenBillingModal, setIsOpenBillingModal] = React.useState<boolean>(false);

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
    };
    const url: string = makeInternalRegistryAPIwithParams(
      InternalApiIdentifierMap.ACCOUNT,
      "flag"
    );
    submitPendingActions(url, "PUT", JSON.stringify({ ...reqBody }));
  };

  const submitPendingActions = async (
    url: string,
    method: "POST" | "PUT",
    body: string
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
      navigateToDrawer(Routes.REGISTRY_TASK_VIEW, recordId);
    } else {
      // Move to the view page for the specific record (not a drawer)
      navigateToDrawer(Routes.REGISTRY, props.recordType, recordId);
    }
  };

  const onReviewBillable: React.MouseEventHandler<HTMLButtonElement> = async () => {
    handleClickRowAction();
    await execReviewBillableAction(props.row, props.accountType, navigateToDrawer);
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
        leftIcon="more_vert"
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
                icon="open_in_new"
                label={parseWordsForLabels(dict.action.view)}
                onClick={() => {
                  handleClickRowAction();
                  handleClickView();
                }}
              />
              {isActionAllowed("TERMINATE_CONTRACT") &&
                <RowActionButton
                  icon="block"
                  disabled={isLoading}
                  label={dict.action.terminate}
                  onClick={() => {
                    handleClickRowAction();
                    navigateToDrawer(Routes.REGISTRY_TERMINATE, props.recordType, recordId);
                  }}
                />}
              {isActionAllowed("APPROVE_CONTRACT") &&
                <RowActionButton
                  icon="done_outline"
                  disabled={isLoading}
                  label={dict.action.approve}
                  onClick={onApproval}
                />}
              {isActionAllowed("RESUBMIT") &&
                <RowActionButton
                  icon="published_with_changes"
                  disabled={isLoading}
                  label={dict.action.resubmit}
                  onClick={onResubmissionForApproval}
                />
              }
              {isActionAllowed("EDIT") && <RowActionButton

                icon="edit"
                disabled={isLoading}
                label={dict.action.edit}
                onClick={() => {
                  handleClickRowAction();
                  navigateToDrawer(Routes.REGISTRY_EDIT, props.recordType, recordId);
                }}
              />}
              {isActionAllowed("DELETE") && <RowActionButton
                icon="delete"
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
                icon="open_in_new"
                label={parseWordsForLabels(dict.action.view)}
                onClick={() => {
                  handleClickRowAction();
                  navigateToDrawer(Routes.REGISTRY_TASK_VIEW, recordId);
                }}
              />}
              {isActionAllowed("COMPLETE_TASK") && <RowActionButton
                icon="done_outline"
                disabled={isLoading}
                label={dict.action.complete}
                onClick={() => {
                  handleClickRowAction();
                  // Set a flag to indicate if the bill has been accrued, which determines the next navigation action
                  browserStorageManager.set(RegistryStatusMap.BILLABLE_COMPLETED,
                    (props.row.status.toLowerCase() === RegistryStatusMap.BILLABLE_COMPLETED).toString());
                  navigateToDrawer(Routes.REGISTRY_TASK_COMPLETE, recordId);
                }}
              />}
              {isActionAllowed("ASSIGN_TASK") && <RowActionButton
                icon="assignment"
                label={dict.action.dispatch}
                onClick={() => {
                  handleClickRowAction();
                  navigateToDrawer(Routes.REGISTRY_TASK_DISPATCH, recordId);
                }}
              />}
              {isActionAllowed("RESCHEDULE_TASK") &&
                props.row.scheduleType == dict.form.singleService && (
                  <RowActionButton
                    icon="schedule"
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
                  icon="cancel"
                  disabled={isLoading}
                  label={dict.action.cancel}
                  onClick={() => {
                    handleClickRowAction();
                    navigateToDrawer(Routes.REGISTRY_TASK_CANCEL, recordId);
                  }}
                />
              )}
              {isActionAllowed("CANCEL_OR_REPORT_TASK") && compareDates(props.row?.date, false) && (
                <RowActionButton
                  icon="report"
                  label={dict.action.report}
                  disabled={isLoading}
                  onClick={() => {
                    handleClickRowAction();
                    navigateToDrawer(Routes.REGISTRY_TASK_REPORT, recordId);
                  }}
                />
              )}
            </>
          )}
          {(isActionAllowed("ADJUST_PRICING")) && <RowActionButton
            icon="price_change"
            label={dict.action.adjustPricing}
            disabled={isLoading}
            onClick={() => {
              handleClickRowAction();
              // Get the id of the contract and avoid task id
              navigateToDrawer(Routes.REGISTRY_ADJUST_PRICING, getId(props.row.id));
            }}
          />}
          {(isActionAllowed("REVIEW_BILLABLES")) && <RowActionButton
            icon="price_check"
            label={dict.action.reviewBillable}
            disabled={isLoading}
            onClick={onReviewBillable}
          />}
          {(isActionAllowed("EXEMPT_BILLABLES")) && <RowActionButton
            icon="money_off"
            label={dict.action.exemptBillable}
            disabled={isLoading}
            onClick={() => {
              handleClickRowAction();
              navigateToDrawer(Routes.REGISTRY_TASK_EXEMPT, recordId);
            }}
          />}
          {isActionAllowed("VIEW_BILLABLES") && <RowActionButton
            icon="monetization_on"
            label={dict.action.viewServiceCost}
            disabled={isLoading}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsActionMenuOpen(false);
              setIsOpenBillingModal(true);
            }}
          />}
          {isActionAllowed("VIEW_INVOICE") &&
            <FileDownloadButton
              id={recordId}
              resource={props.recordType}
              format="csv"
              leftIcon="download"
              variant="ghost"
              size="md"
              iconSize="medium"
              className="w-full justify-start"
              label={dict.action.exportAsCsv}
              disabled={isLoading}
            />}
          {isActionAllowed("VIEW_INVOICE") &&
            <FileDownloadButton
              id={recordId}
              resource={props.recordType}
              format="pdf"
              leftIcon="download"
              variant="ghost"
              size="md"
              iconSize="medium"
              className="w-full justify-start"
              label={dict.action.exportAsPdf}
              disabled={isLoading}
            />}
          {isActionAllowed("DRAFT_TEMPLATE") &&
            <DraftTemplateButton
              rowId={[props.row.id]}
              recordType={props.recordType}
              triggerRefresh={props.triggerRefresh}
            />
          }
          {isActionAllowed("ACCOUNT_FLAG") && <RowActionButton
            icon="flag"
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

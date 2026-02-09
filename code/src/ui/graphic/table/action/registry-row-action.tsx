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
import { FormTypeMap, LifecycleStage, LifecycleStageMap } from "types/form";
import { JsonObject } from "types/json";
import DraftTemplateButton from "ui/interaction/action/draft-template/draft-template-button";
import PopoverActionButton from "ui/interaction/action/popover/popover-button";
import { toast } from "ui/interaction/action/toast/toast";
import Button from "ui/interaction/button";
import { SelectOptionType } from "ui/interaction/dropdown/simple-selector";
import BillingModal from "ui/interaction/modal/billing-modal";
import { compareDates, getId, parseWordsForLabels } from "utils/client-utils";
import { EVENT_KEY } from "utils/constants";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";


interface RegistryRowActionProps {
  recordType: string;
  accountType: string;
  lifecycleStage: LifecycleStage;
  row: FieldValues;
  triggerRefresh: () => void;
}

/**
 * Renders the possible row actions for each row in the registry.
 *
 * @param {string} recordType The type of the record.
 * @param {string} accountType The type of account for billing capabilities.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {FieldValues} row Row values.
 * @param triggerRefresh A function to refresh the table when required.
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
  const isActionAllowed = useRegistryRowPermissionGuard(props.lifecycleStage, props.row?.[dict.title.status]?.toLowerCase(), props.row[dict.title.billingStatus]);

  const [isActionMenuOpen, setIsActionMenuOpen] =
    React.useState<boolean>(false);

  const { isLoading, startLoading, stopLoading, resetFormSession } = useOperationStatus();
  const [isOpenBillingModal, setIsOpenBillingModal] = React.useState<boolean>(false);

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

  const submitPendingActions = async (
    url: string,
    method: "POST" | "PUT",
    body: string
  ): Promise<void> => {
    startLoading();
    const customAgentResponse: AgentResponseBody = await queryInternalApi(url, method, body);
    setIsActionMenuOpen(false);
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

  const onGenInvoice: React.MouseEventHandler<HTMLButtonElement> = async () => {
    browserStorageManager.clear();
    resetFormSession();
    const url: string = makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.BILL, FormTypeMap.ASSIGN_PRICE, props.row.id);
    const body: AgentResponseBody = await queryInternalApi(url);
    browserStorageManager.set(EVENT_KEY, props.row.event_id);
    try {
      const res: AgentResponseBody = await queryInternalApi(makeInternalRegistryAPIwithParams(
        InternalApiIdentifierMap.FILTER,
        LifecycleStageMap.ACCOUNT,
        props.accountType,
        props.row[props.accountType]
      ));
      const options: SelectOptionType[] = res.data?.items as SelectOptionType[];
      // Set the account type in browser storage to match the values of the account type in the assign price form
      browserStorageManager.set(props.accountType, options[0]?.value);
    } catch (error) {
      console.error("Error fetching instances", error);
    }
    setIsActionMenuOpen(false);
    if (body.data.message == "true") {
      navigateToDrawer(Routes.BILLING_ACTIVITY_TRANSACTION, getId(props.row.event_id))
    } else {
      navigateToDrawer(Routes.BILLING_ACTIVITY_PRICE, getId(props.row.id));
    }
  };

  const onExcludeBilling: React.MouseEventHandler<HTMLButtonElement> = async () => {
    setIsActionMenuOpen(false);
    const url: string = makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.BILL, FormTypeMap.EXCLUDE_INVOICE);
    submitPendingActions(url, "POST", JSON.stringify({
      id: getId(props.row.event_id),
      event: props.row.event_id,
    }));
  };

  const isSubmissionOrGeneralPage: boolean =
    props.lifecycleStage == LifecycleStageMap.PENDING || props.lifecycleStage == LifecycleStageMap.GENERAL ||
    props.lifecycleStage == LifecycleStageMap.ACCOUNT || props.lifecycleStage == LifecycleStageMap.PRICING ||
    props.lifecycleStage == LifecycleStageMap.ACTIVE || props.lifecycleStage == LifecycleStageMap.ARCHIVE;

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
      >
        <div className="flex flex-col space-y-8 lg:space-y-4 ">
          {isSubmissionOrGeneralPage && (
            <>
              <Button
                variant="ghost"
                leftIcon="open_in_new"
                size="md"
                iconSize="medium"
                className="w-full justify-start"
                label={parseWordsForLabels(dict.action.view)}
                onClick={() => {
                  setIsActionMenuOpen(false);
                  browserStorageManager.clear();
                  resetFormSession();
                  handleClickView();
                }}
              />
              {isActionAllowed("TERMINATE_CONTRACT") &&
                <Button
                  variant="ghost"
                  leftIcon="block"
                  size="md"
                  iconSize="medium"
                  className="w-full justify-start"
                  disabled={isLoading}
                  label={dict.action.terminate}
                  onClick={() => {
                    setIsActionMenuOpen(false);
                    navigateToDrawer(Routes.REGISTRY_TERMINATE, props.recordType, recordId);
                  }}
                />}
              {isActionAllowed("APPROVE_CONTRACT") &&
                <Button
                  variant="ghost"
                  leftIcon="done_outline"
                  disabled={isLoading}
                  size="md"
                  iconSize="medium"
                  className="w-full justify-start"
                  label={dict.action.approve}
                  onClick={onApproval}
                />}
              {isActionAllowed("RESUBMIT") &&
                <Button
                  variant="ghost"
                  leftIcon="published_with_changes"
                  size="md"
                  iconSize="medium"
                  className="w-full justify-start"
                  disabled={isLoading}
                  label={dict.action.resubmit}
                  onClick={onResubmissionForApproval}
                />
              }
              {isActionAllowed("EDIT") && <Button
                variant="ghost"
                leftIcon="edit"
                size="md"
                iconSize="medium"
                className="w-full justify-start"
                disabled={isLoading}
                label={dict.action.edit}
                onClick={() => {
                  setIsActionMenuOpen(false);
                  browserStorageManager.clear();
                  resetFormSession();
                  navigateToDrawer(Routes.REGISTRY_EDIT, props.recordType, recordId);
                }}
              />}
              {isActionAllowed("DELETE") && <Button
                variant="ghost"
                leftIcon="delete"
                size="md"
                iconSize="medium"
                className="w-full justify-start"
                disabled={isLoading}
                label={dict.action.delete}
                onClick={() => {
                  setIsActionMenuOpen(false);
                  browserStorageManager.clear();
                  resetFormSession();
                  navigateToDrawer(Routes.REGISTRY_DELETE, props.recordType, recordId);
                }}
              />}
            </>
          )}
          {!isSubmissionOrGeneralPage && (
            <>
              <Button
                variant="ghost"
                leftIcon="open_in_new"
                size="md"
                iconSize="medium"
                className="w-full justify-start"
                label={parseWordsForLabels(dict.action.view)}
                onClick={() => {
                  setIsActionMenuOpen(false);
                  browserStorageManager.clear();
                  resetFormSession();
                  navigateToDrawer(Routes.REGISTRY_TASK_VIEW, recordId);
                }}
              />
              {isActionAllowed("COMPLETE_TASK") && <Button
                variant="ghost"
                leftIcon="done_outline"
                size="md"
                iconSize="medium"
                className="w-full justify-start"
                disabled={isLoading}
                label={dict.action.complete}
                onClick={() => {
                  setIsActionMenuOpen(false);
                  browserStorageManager.clear();
                  resetFormSession();
                  navigateToDrawer(Routes.REGISTRY_TASK_COMPLETE, recordId);
                }}
              />}
              {isActionAllowed("ASSIGN_TASK") && <Button
                variant="ghost"
                leftIcon="assignment"
                size="md"
                iconSize="medium"
                className="w-full justify-start"
                disabled={isLoading}
                label={dict.action.dispatch}
                onClick={() => {
                  setIsActionMenuOpen(false);
                  browserStorageManager.clear();
                  resetFormSession();
                  navigateToDrawer(Routes.REGISTRY_TASK_DISPATCH, recordId);
                }}
              />}
              {isActionAllowed("RESCHEDULE_TASK") &&
                props.row[dict.title.scheduleType] == dict.form.singleService && (
                  <Button
                    variant="ghost"
                    leftIcon="schedule"
                    size="md"
                    iconSize="medium"
                    className="w-full justify-start"
                    disabled={isLoading}
                    label={dict.action.reschedule}
                    onClick={() => {
                      setIsActionMenuOpen(false);
                      navigateToDrawer(Routes.REGISTRY_TASK_RESCHEDULE, recordId);
                    }}
                  />
                )}
              {isActionAllowed("CANCEL_OR_REPORT_TASK") && compareDates(props.row?.date, true) && (
                <Button
                  variant="ghost"
                  leftIcon="cancel"
                  size="md"
                  iconSize="medium"
                  className="w-full justify-start"
                  disabled={isLoading}
                  label={dict.action.cancel}
                  onClick={() => {
                    setIsActionMenuOpen(false);
                    navigateToDrawer(Routes.REGISTRY_TASK_CANCEL, recordId);
                  }}
                />
              )}
              {isActionAllowed("CANCEL_OR_REPORT_TASK") && compareDates(props.row?.date, false) && (
                <Button
                  variant="ghost"
                  leftIcon="report"
                  size="md"
                  iconSize="medium"
                  className="w-full justify-start"
                  label={dict.action.report}
                  disabled={isLoading}
                  onClick={() => {
                    setIsActionMenuOpen(false);
                    navigateToDrawer(Routes.REGISTRY_TASK_REPORT, recordId);
                  }}
                />
              )}
            </>
          )}
          {(isActionAllowed("BILL_PENDING") || isActionAllowed("BILL_PAYMENT")) && < Button
            variant="ghost"
            leftIcon="price_check"
            size="md"
            iconSize="medium"
            className="w-full justify-start"
            label={props.row[dict.title.billingStatus].toLowerCase() ===
              dict.title.readyForPayment.toLowerCase().replace(/\s+/g, "") ? 
              dict.action.editAdjustment : dict.action.approve}
            disabled={isLoading}
            onClick={onGenInvoice}
          />}
          {isActionAllowed("BILL_PENDING") && <Button
            variant="ghost"
            leftIcon="money_off"
            size="md"
            iconSize="medium"
            className="w-full justify-start"
            label={dict.action.excludeFromBilling}
            disabled={isLoading}
            onClick={onExcludeBilling}
          />}
          {isActionAllowed("BILL_PAYMENT") && <Button
            variant="ghost"
            leftIcon="monetization_on"
            size="md"
            iconSize="medium"
            className="w-full justify-start"
            label={dict.action.viewServiceCost}
            disabled={isLoading}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsActionMenuOpen(false);
              setIsOpenBillingModal(true);
            }}
          />}
          {isActionAllowed("DRAFT_TEMPLATE") &&
            <DraftTemplateButton
              rowId={[props.row.id]}
              recordType={props.recordType}
              triggerRefresh={props.triggerRefresh}
            />
          }
        </div>
      </PopoverActionButton>
      {props.lifecycleStage === LifecycleStageMap.ACTIVITY && isOpenBillingModal && <BillingModal
        id={recordId}
        date={props.row.date}
        isOpen={isOpenBillingModal}
        setIsOpen={setIsOpenBillingModal}
      />}
    </div>
  );
}

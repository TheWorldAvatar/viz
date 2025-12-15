import { usePermissionScheme } from "hooks/auth/usePermissionScheme";
import { useDictionary } from "hooks/useDictionary";
import useOperationStatus from "hooks/useOperationStatus";
import { Routes } from "io/config/routes";
import { useRouter } from "next/navigation";
import React from "react";
import { FieldValues } from "react-hook-form";
import { PermissionScheme } from "types/auth";
import { AgentResponseBody, InternalApiIdentifierMap } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import { LifecycleStage, LifecycleStageMap } from "types/form";
import { JsonObject } from "types/json";
import DraftTemplateButton from "ui/interaction/action/draft-template/draft-template-button";
import PopoverActionButton from "ui/interaction/action/popover/popover-button";
import { toast } from "ui/interaction/action/toast/toast";
import Button from "ui/interaction/button";
import { compareDates, getId, parseWordsForLabels } from "utils/client-utils";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";
import { buildUrl } from "utils/client-utils";

interface RegistryRowActionProps {
  recordType: string;
  lifecycleStage: LifecycleStage;
  row: FieldValues;
  triggerRefresh: () => void;
}

/**
 * Renders the possible row actions for each row in the registry.
 *
 * @param {string} recordType The type of the record.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {FieldValues} row Row values.
 * @param triggerRefresh A function to refresh the table when required.
 */
export default function RegistryRowAction(
  props: Readonly<RegistryRowActionProps>
) {
  const router = useRouter();
  const recordId: string = props.row.event_id
    ? getId(props.row.event_id)
    : props.row.id
      ? getId(props.row.id)
      : getId(props.row.iri);

  const keycloakEnabled = process.env.KEYCLOAK === "true";
  const permissionScheme: PermissionScheme = usePermissionScheme();
  const dict: Dictionary = useDictionary();
  const [isActionMenuOpen, setIsActionMenuOpen] =
    React.useState<boolean>(false);

  const { isLoading, startLoading, stopLoading } = useOperationStatus();

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
    const customAgentResponse: AgentResponseBody = await queryInternalApi(url, method, body    );
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
      // Navigate to task view modal route
      router.push(buildUrl(Routes.REGISTRY_TASK_VIEW, recordId));
    } else {
      // Move to the view modal page for the specific record
      router.push(buildUrl(Routes.REGISTRY, props.recordType, recordId));
    }
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
                  handleClickView();
                }}
              />
              {(!keycloakEnabled ||
                !permissionScheme ||
                permissionScheme.hasPermissions.operation) &&
                props.lifecycleStage === LifecycleStageMap.ACTIVE && (
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
                      router.push(buildUrl(
                        Routes.REGISTRY_TERMINATE, props.recordType, recordId
                      ));
                    }}
                  />
                )}

              {(!keycloakEnabled ||
                !permissionScheme ||
                permissionScheme.hasPermissions.operation) &&
                props.lifecycleStage === LifecycleStageMap.PENDING && (
                  <Button
                    variant="ghost"
                    leftIcon="done_outline"
                    disabled={isLoading}
                    size="md"
                    iconSize="medium"
                    className="w-full justify-start"
                    label={dict.action.approve}
                    onClick={onApproval}
                  />
                )}

              {(!keycloakEnabled ||
                !permissionScheme ||
                permissionScheme.hasPermissions.sales) &&
                props.lifecycleStage === LifecycleStageMap.PENDING &&
                props.row?.status?.toLowerCase() === "amended" && (
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
                )}

              {(!keycloakEnabled ||
                !permissionScheme ||
                permissionScheme.hasPermissions.sales) &&
                isSubmissionOrGeneralPage && props.lifecycleStage !== "active" && props.lifecycleStage !== "archive" && (
                  <Button
                    variant="ghost"
                    leftIcon="edit"
                    size="md"
                    iconSize="medium"
                    className="w-full justify-start"
                    disabled={isLoading}
                    label={dict.action.edit}
                    onClick={() => {
                      setIsActionMenuOpen(false);
                      router.push(
                        buildUrl(Routes.REGISTRY_EDIT, props.recordType, recordId)
                      );
                    }}
                  />
                )}

              {(!keycloakEnabled ||
                !permissionScheme ||
                permissionScheme.hasPermissions.sales) &&
                isSubmissionOrGeneralPage && props.lifecycleStage !== "active" && props.lifecycleStage !== "archive" && (
                  <Button
                    variant="ghost"
                    leftIcon="delete"
                    size="md"
                    iconSize="medium"
                    className="w-full justify-start"
                    disabled={isLoading}
                    label={dict.action.delete}
                    onClick={() => {
                      setIsActionMenuOpen(false);
                      router.push(
                        buildUrl(Routes.REGISTRY_DELETE, props.recordType, recordId)
                      );
                    }}
                  />
                )}
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
                  router.push(buildUrl(Routes.REGISTRY_TASK_VIEW, recordId));
                }}
              />
              {(!keycloakEnabled ||
                !permissionScheme ||
                permissionScheme.hasPermissions.completeTask) &&
                (props.lifecycleStage === LifecycleStageMap.OUTSTANDING ||
                  props.lifecycleStage === LifecycleStageMap.CLOSED) &&
                (props.row?.status?.toLowerCase() === "assigned" ||
                  props.row?.status?.toLowerCase() === "completed") && (
                  <Button
                    variant="ghost"
                    leftIcon="done_outline"
                    size="md"
                    iconSize="medium"
                    className="w-full justify-start"
                    disabled={isLoading}
                    label={dict.action.complete}
                    onClick={() => {
                      setIsActionMenuOpen(false);
                      router.push(buildUrl(Routes.REGISTRY_TASK_COMPLETE, recordId));
                    }}
                  />
                )}
              {(!keycloakEnabled ||
                !permissionScheme ||
                permissionScheme.hasPermissions.operation) &&
                props.lifecycleStage !== LifecycleStageMap.ACTIVITY &&
                props.row?.status?.toLowerCase() !== "issue" &&
                props.row?.status?.toLowerCase() !== "cancelled" && (
                  <Button
                    variant="ghost"
                    leftIcon="assignment"
                    size="md"
                    iconSize="medium"
                    className="w-full justify-start"
                    disabled={isLoading}
                    label={dict.action.dispatch}
                    onClick={() => {
                      setIsActionMenuOpen(false);
                      router.push(buildUrl(Routes.REGISTRY_TASK_DISPATCH, recordId));
                    }}
                  />
                )}
              {(!keycloakEnabled ||
                !permissionScheme ||
                permissionScheme.hasPermissions.operation) &&
                (props.lifecycleStage === LifecycleStageMap.OUTSTANDING ||
                  props.lifecycleStage === LifecycleStageMap.SCHEDULED) &&
                compareDates(props.row?.date, true) &&
                (props.row?.status?.toLowerCase() === "new" ||
                  props.row?.status?.toLowerCase() === "assigned") && (
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
                      router.push(buildUrl(Routes.REGISTRY_TASK_CANCEL, recordId));
                    }}
                  />
                )}
              {(!keycloakEnabled ||
                !permissionScheme ||
                permissionScheme.hasPermissions.reportTask) &&
                props.lifecycleStage === LifecycleStageMap.OUTSTANDING &&
                compareDates(props.row?.date, false) &&
                (props.row?.status?.toLowerCase() === "new" ||
                  props.row?.status?.toLowerCase() === "assigned") && (
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
                      router.push(buildUrl(Routes.REGISTRY_TASK_REPORT, recordId));
                    }}
                  />
                )}
            </>
          )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.sales) &&
            props.lifecycleStage === LifecycleStageMap.ACTIVITY && (
              <Button
                variant="ghost"
                leftIcon="price_check"
                size="md"
                iconSize="medium"
                className="w-full justify-start"
                label={dict.action.approve}
                disabled={isLoading}
                onClick={() => {
                  setIsActionMenuOpen(false);
                  router.push(buildUrl(Routes.BILLING_ACTIVITY_PRICE, `${getId(props.row.id)}?event=${encodeURIComponent(props.row.event_id)}`));
                }}
              />
            )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.draftTemplate) &&
            props.lifecycleStage !== LifecycleStageMap.GENERAL && props.lifecycleStage !== LifecycleStageMap.ACCOUNT &&
            props.lifecycleStage !== LifecycleStageMap.PRICING && props.lifecycleStage !== LifecycleStageMap.ACTIVITY && (
              <DraftTemplateButton
                rowId={[props.row.id]}
                recordType={props.recordType}
                triggerRefresh={props.triggerRefresh}
              />
            )}
        </div>
      </PopoverActionButton>
    </div>
  );
}

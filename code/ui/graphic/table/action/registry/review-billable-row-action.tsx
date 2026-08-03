import { useDrawerNavigation } from "@/hooks/drawer/useDrawerNavigation";
import useFormSession from "@/hooks/form/useFormSession";
import useTableSession from "@/hooks/table/useTableSession";
import { useDictionary } from "@/hooks/useDictionary";
import useOperationStatus from "@/hooks/useOperationStatus";
import { Routes } from "@/io/config/routes";
import { browserStorageManager } from "@/state/browser-storage-manager";
import { AgentResponseBody, InternalApiIdentifierMap } from "@/types/backend-agent";
import { Dictionary } from "@/types/dictionary";
import { FormTypeMap, useLiveFormOptionReturn } from "@/types/form";
import { toast } from "@/ui/interaction/action/toast/toast";
import { canSkipOptionalAccrual } from "@/utils/accrual-utils";
import { getId } from "@/utils/client-utils";
import { DATE_KEY, EVENT_KEY, TASK_STATUS_KEY } from "@/utils/constants";
import { useIsSyncing, useLiveAccountFilter } from "@/utils/db/dexie-form-repository";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "@/utils/internal-api-services";
import { submitOptionalAccrual } from "@/utils/optional-accrual";
import React from "react";
import { FieldValues } from "react-hook-form";
import RowActionButton from "../row-action-button";


interface ReviewBillableRowActionProps {
  recordType: string;
  accountType: string;
  row: FieldValues;
  handleClickRowAction: () => void;
  triggerRefresh: () => void;
}

/**
 * Renders the review billable row action.
 *
 * @param {string} recordType The type of the record.
 * @param {string} accountType The type of account for billing capabilities.
 * @param {FieldValues} row Row values.
 * @param handleClickRowAction A function to refresh the table when required.
 * @param triggerRefresh A function to refresh the table when required.
 */
export default function ReviewBillableRowAction(
  props: Readonly<ReviewBillableRowActionProps>
) {
  const rowId: string = getId(props.row.id);
  const eventId: string = getId(props.row.event_id);
  const { navigateToDrawer } = useDrawerNavigation();
  const { saveCurrentSession } = useFormSession();
  const { pricingType } = useTableSession();

  const dict: Dictionary = useDictionary();

  const { isLoading } = useOperationStatus();
  const liveAccount: useLiveFormOptionReturn = useLiveAccountFilter(props.accountType, props.row[props.accountType]);

  const isSyncing: boolean = useIsSyncing();

  const onReviewBillable: React.MouseEventHandler<HTMLButtonElement> = async () => {
    props.handleClickRowAction();
    const url: string = makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.BILL, FormTypeMap.ASSIGN_PRICE, props.row.id, props.row.date);
    const body: AgentResponseBody = await queryInternalApi(url);
    browserStorageManager.set(DATE_KEY, props.row.date);
    browserStorageManager.set(EVENT_KEY, props.row.event_id);
    browserStorageManager.set(TASK_STATUS_KEY, props.row.status as string | undefined);

    const formData: FieldValues = {
      [props.accountType]: liveAccount?.options?.[0].value,
    };
    saveCurrentSession(formData, pricingType, true);

    if (body.data.message == "true") {
      if (canSkipOptionalAccrual(props.row.status as string | undefined)) {
        let loadingToast: string | number;
        await submitOptionalAccrual({
          taskId: eventId,
          contract: rowId,
          date: props.row.date as string,
          onStart: () => { loadingToast = toast(dict.message.processingRequest, "loading"); },
          onSuccess: (response) => {
            toast(response.data?.message ?? dict.message.success, "success");
            props.triggerRefresh?.();
          },
          onError: (message) => toast(message, "error"),
          fallbackError: dict.message.genericError,
          onFinally: () => { if (loadingToast !== undefined) toast.dismiss(loadingToast); },
        });
        return;
      }
      navigateToDrawer(Routes.REGISTRY_TASK, `${FormTypeMap.ACCRUAL}?id=${eventId}`);
    } else {
      navigateToDrawer(Routes.BILLING_ACTIVITY_PRICE, rowId);
    }

  };

  return <RowActionButton
    icon="price_check"
    label={dict.action.reviewBillable}
    disabled={isLoading || isSyncing || liveAccount?.options?.[0]?.disabled}
    onClick={onReviewBillable}
  />
}
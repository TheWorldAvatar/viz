import { useDrawerNavigation } from "@/hooks/drawer/useDrawerNavigation";
import useFormSession from "@/hooks/form/useFormSession";
import useTableSession from "@/hooks/table/useTableSession";
import { useDictionary } from "@/hooks/useDictionary";
import useOperationStatus from "@/hooks/useOperationStatus";
import { Routes } from "@/io/config/routes";
import { browserStorageManager } from "@/state/browser-storage-manager";
import { Dictionary } from "@/types/dictionary";
import { useLiveFormOptionReturn } from "@/types/form";
import { interpolate, parseWordsForLabels } from "@/utils/client-utils";
import { ADD_LINKED_FORM_KEY, FLAG_EMOJI } from "@/utils/constants";
import { useIsSyncing, useLiveAccountFilter } from "@/utils/db/dexie-form-repository";
import React from "react";
import { FieldValues } from "react-hook-form";
import RowActionButton from "../row-action-button";
import { Plus } from "lucide-react";


interface AddEntityRowActionProps {
  recordType: string;
  accountType: string;
  row: FieldValues;
  handleClickRowAction: () => void;
}

/**
 * Renders the add entity row action.
 *
 * @param {string} recordType The type of the record.
 * @param {string} accountType The type of account for billing capabilities.
 * @param {FieldValues} row Row values.
 * @param handleClickRowAction A function to refresh the table when required.
 */
export default function AddEntityRowAction(
  props: Readonly<AddEntityRowActionProps>
) {
  const { navigateToDrawer } = useDrawerNavigation();
  const { saveCurrentSession } = useFormSession();
  const { addEntity } = useTableSession();

  const dict: Dictionary = useDictionary();

  const { isLoading } = useOperationStatus();
  const liveAccount: useLiveFormOptionReturn = useLiveAccountFilter(props.accountType, props.row[props.accountType]);

  const isSyncing: boolean = useIsSyncing();

  const onAddItem: React.MouseEventHandler<HTMLButtonElement> = async () => {
    // Read before the row action clears the storage
    const previousFormFlag: string = browserStorageManager.get(ADD_LINKED_FORM_KEY);
    props.handleClickRowAction();

    const formData: FieldValues = {
      [props.accountType]: liveAccount?.options?.[0].value,
      [props.recordType.replaceAll("_", " ")]: props.row.iri,
    };
    saveCurrentSession(formData, addEntity, true);
    // We are flipping the value everytime so that the add form can re-render with new values
    browserStorageManager.set(ADD_LINKED_FORM_KEY, previousFormFlag === "true" ? "false" : "true");
    navigateToDrawer(Routes.REGISTRY_ADD, addEntity);
  };


  return <RowActionButton
    icon={Plus}
    disabled={isLoading || isSyncing || liveAccount?.options?.[0]?.disabled}
    onClick={onAddItem}
  >
    {parseWordsForLabels(interpolate(dict.action.addItem, addEntity))}
    {/* Always reserve emoji width so the menu does not jump when the flag loads */}
    <span className={`ml-1 ${!liveAccount?.options?.[0]?.disabled && "invisible"}`}
      aria-hidden={!liveAccount?.options?.[0]?.disabled}>
      {FLAG_EMOJI}
    </span>
  </RowActionButton>
}
"use client";

import { usePermissionGuard } from "hooks/auth/usePermissionGuard";
import useFormSession from "hooks/form/useFormSession";
import { useDictionary } from "hooks/useDictionary";
import { Routes } from "io/config/routes";
import type React from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";
import { browserStorageManager } from "state/browser-storage-manager";
import { Dictionary } from "types/dictionary";
import { FormTypeMap } from "types/form";
import { buildUrl } from "utils/client-utils";
import RedirectButton from "../action/redirect/redirect-button";
import Button from "../button";
import { FORM_STATES } from "../form/form-utils";

interface FormQuickViewHeaderProps {
  id: string;
  title: string;
  selectedEntityId: string;
  entityType: string;
  formType: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  accountId?: string;
  accountType?: string;
  pricingType?: string;
  form: UseFormReturn;
  translatedFormFieldIds: Record<string, string>;
  disableIfLocked?: boolean;
}

/** 
 * A component that renders the header for a form quick view panel. The header contains a trigger to open the panel, 
 * as well as several other buttons for registry actions.
 * 
 * @param {string} id - The unique ID for the form accordion.
 * @param {string} title - The label for the trigger button.
 * @param {string} selectedEntityId - The currently selected entity's id.
 * @param {string} entityType - The type of entities.
 * @param {boolean} isOpen - The show or hide state of the accordion.
 * @param setIsOpen - Updates the show or hide state of the accordion.
 * @param {string} accountId Optionally indicates the account ID.
 * @param {string} accountType Optionally indicates the type of account.
 * @param {string} pricingType Optionally indicates the type of pricing.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {Record<string, string>} translatedFormFieldIds A mapping of form field IDs to their translated storage keys.
 * @param {boolean} disableIfLocked Whether to disable action buttons if the form field is locked.
 **/
export default function FormQuickViewHeader(props: Readonly<FormQuickViewHeaderProps>) {
  const dict: Dictionary = useDictionary();
  const isPermitted = usePermissionGuard();
  const { incrementFormCount } = useFormSession();

  const toggleContent = (): void => {
    props.setIsOpen((prev) => !prev);
  };

  // Handler for form persistence when redirecting
  // Saves the current form state to the session storage
  const handleFormPersistence = (): void => {
    const values: FieldValues = props.form.getValues();
    const excludedFields: string[] = [FORM_STATES.FORM_TYPE, FORM_STATES.ID];
    const dataTypeValues: Record<string, string> = {};
    incrementFormCount();

    Object.entries(values).forEach(([key, value]) => {
      // If the field ID has been translated, use the translated ID
      // client details client -> client
      // Skip excluded fields
      if (excludedFields.includes(key) || key.startsWith('_form_')) return;
      // Check if the field is a data type field
      if (props.translatedFormFieldIds && props.translatedFormFieldIds[key]) {
        browserStorageManager.set(props.translatedFormFieldIds[key], value);
      } else {
        // Save individual field
        dataTypeValues[key] = value;
      }
    });
    // Save all data type fields under a single identifier
    if (Object.keys(dataTypeValues).length) {
      browserStorageManager.set(props.translatedFormFieldIds.formEntityType, JSON.stringify(dataTypeValues));
    }
  }

  // Generate URL for sub-entity actions (add, edit, delete)
  const genSubEntityUrl = (
    action: "add" | "edit" | "delete",
    entityType: string,
    entityId?: string
  ): string => {
    if (action == "add" && props.accountType == props.entityType) {
      return buildUrl(Routes.REGISTRY_ADD, "account", props.entityType);
    } else if (action == "add" && props.pricingType == props.entityType) {
      return buildUrl(Routes.REGISTRY_ADD, "pricing", props.entityType);
    }
    return buildUrl(action == "add" ? Routes.REGISTRY_ADD :
      action == "edit" ? Routes.REGISTRY_EDIT : Routes.REGISTRY_DELETE,
      `${entityType}${entityId ? `/${entityId}` : ""}`);
  };

  return (
    <div className="flex justify-between items-center mb-2">
      {props.selectedEntityId && <Button
        type="button"
        leftIcon="menu_open"
        size="sm"
        iconSize="small"
        variant="outline"
        onClick={toggleContent}
        aria-expanded={props.isOpen}
        aria-controls={`accordion-content-${props.id}`}
        className="text-xs"
      >
        {props.title}
      </Button>}
      {props.formType !== FormTypeMap.VIEW && props.formType !== FormTypeMap.DELETE && !props.disableIfLocked && <div className="flex gap-2">
        <RedirectButton
          leftIcon="add"
          size="icon"
          iconSize="small"
          tooltipText={dict.action.add}
          url={genSubEntityUrl("add", props.entityType)}
          softRedirect={true}
          variant="outline"
          additionalAction={handleFormPersistence}
        />
        {props.selectedEntityId && isPermitted("edit") && <RedirectButton
          leftIcon="edit"
          size="icon"
          iconSize="small"
          tooltipText={dict.action.edit}
          url={genSubEntityUrl(
            "edit",
            props.entityType,
            props.selectedEntityId
          )}
          softRedirect={true}
          variant="outline"
          additionalAction={handleFormPersistence}
        />}
        {props.selectedEntityId && isPermitted("delete") && <RedirectButton
          leftIcon="delete"
          size="icon"
          iconSize="small"
          tooltipText={dict.action.delete}
          url={genSubEntityUrl(
            "delete",
            props.entityType,
            props.selectedEntityId
          )}
          softRedirect={true}
          variant="outline"
          additionalAction={handleFormPersistence}
        />}
      </div>}
    </div>
  );
}

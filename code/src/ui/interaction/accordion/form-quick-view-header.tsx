"use client";

import { usePermissionGuard } from "hooks/auth/usePermissionGuard";
import { useDictionary } from "hooks/useDictionary";
import { Routes } from "io/config/routes";
import type React from "react";
import { Dictionary } from "types/dictionary";
import { buildUrl } from "utils/client-utils";
import RedirectButton from "../action/redirect/redirect-button";
import Button from "../button";

interface FormQuickViewHeaderProps {
  id: string;
  title: string;
  selectedEntityId: string;
  entityType: string;
  formType: string;
  isFormView: boolean;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  accountId?: string;
  accountType?: string;
  pricingType?: string;
  disableWhenDependentHasValueOnNavigation: boolean;
}

/** 
 * A component that renders the header for a form quick view panel. The header contains a trigger to open the panel, 
 * as well as several other buttons for registry actions.
 * 
 * @param {string} id - The unique ID for the form accordion.
 * @param {string} title - The label for the trigger button.
 * @param {string} selectedEntityId - The currently selected entity's id.
 * @param {string} entityType - The type of entities.
 * @param {boolean} isFormView - Indicates if the form type is view.
 * @param {boolean} isOpen - The show or hide state of the accordion.
 * @param setIsOpen - Updates the show or hide state of the accordion.
 * @param {string} accountId Optionally indicates the account ID.
 * @param {string} accountType Optionally indicates the type of account.
 * @param {string} pricingType Optionally indicates the type of pricing.
 * @param {boolean} disableWhenDependentHasValueOnNavigation Hides action buttons when navigating with dependent value to a new form. It hides only buttons for the parent, not children.
 **/
export default function FormQuickViewHeader(props: Readonly<FormQuickViewHeaderProps>) {
  const dict: Dictionary = useDictionary();
  const isPermitted = usePermissionGuard();
  const toggleContent = (): void => {
    props.setIsOpen((prev) => !prev);
  };

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
      {!props.isFormView && !props.disableWhenDependentHasValueOnNavigation && <div className="flex gap-2">
        <RedirectButton
          leftIcon="add"
          size="icon"
          iconSize="small"
          tooltipText={dict.action.add}
          url={genSubEntityUrl("add", props.entityType)}
          saveFormDataInMemory={true}
          variant="outline"
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
          saveFormDataInMemory={true}
          variant="outline"
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
          saveFormDataInMemory={true}
          variant="outline"
        />}
      </div>}
    </div>
  );
}

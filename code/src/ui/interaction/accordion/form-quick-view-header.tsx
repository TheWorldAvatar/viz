"use client";

import { useDictionary } from "hooks/useDictionary";
import type React from "react";
import { Dictionary } from "types/dictionary";
import RedirectButton from "../action/redirect/redirect-button";
import Button from "../button";

interface FormQuickViewHeaderProps {
  id: string;
  title: string;
  selectedEntityId: string;
  entityType: string;
  isFormView: boolean;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
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
 **/
export default function FormQuickViewHeader(props: Readonly<FormQuickViewHeaderProps>) {
  const dict: Dictionary = useDictionary();
  const toggleContent = (): void => {
    props.setIsOpen((prev) => !prev);
  };

  // Generate URL for sub-entity actions (add, edit, delete)
  const genSubEntityUrl = (
    action: "add" | "edit" | "delete",
    entityType: string,
    entityId?: string
  ): string => {
    const url: string = `../../${action}/${entityType}${entityId ? `/${entityId}` : ""}`;
    return url;
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
      {!props.isFormView && <div className="flex gap-2">
        <RedirectButton
          leftIcon="add"
          size="icon"
          iconSize="small"
          tooltipText={dict.action.add}
          url={genSubEntityUrl("add", props.entityType)}
          variant="outline"
        />
        {props.selectedEntityId && <RedirectButton
          leftIcon="edit"
          size="icon"
          iconSize="small"
          tooltipText={dict.action.edit}
          url={genSubEntityUrl(
            "edit",
            props.entityType,
            props.selectedEntityId
          )}
          variant="outline"
        />}
        {props.selectedEntityId && <RedirectButton
          leftIcon="delete"
          size="icon"
          iconSize="small"
          tooltipText={dict.action.delete}
          url={genSubEntityUrl(
            "delete",
            props.entityType,
            props.selectedEntityId
          )}
          variant="outline"
        />}
      </div>}
    </div>
  );
}

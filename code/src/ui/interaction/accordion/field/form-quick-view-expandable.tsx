"use client";

import { useFormQuickView } from "hooks/form/useFormQuickView";
import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import Button from "../../button";
import FormQuickViewFields from "./form-quick-view-fields";
import { useDrawerNavigation } from "hooks/drawer/useDrawerNavigation";

interface FormQuickViewExpandableProps {
  entity: string;
  entityType: string;
  nestedLevel: number;
}

/**
 * A component that renders the expandable field for a form quick view panel.
 *
 * @param {string} entity - The target entity instance.
 * @param {string} entityType - The type of the entity.
 * @param {number} nestedLevel - The current level of nesting/recursion.
 **/
export default function FormQuickViewExpandable(
  props: Readonly<FormQuickViewExpandableProps>
) {
  const dict: Dictionary = useDictionary();
  const { navigateToDrawer } = useDrawerNavigation();

  const {
    quickViewGroups,
    isQuickViewLoading,
    isQuickViewOpen,
    setIsQuickViewOpen,
    selectedEntityId,
  } = useFormQuickView(props.entity, props.entityType);

  return (
    <div className="flex flex-col py-2 w-full ">
      <div className="flex flex-row items-baseline ">
        <h4 className="flex-shrink-0 w-28 lg:w-36 text-sm sm:text-base text-foreground capitalize font-semibold flex-wrap">
          {props.entityType}
        </h4>
        <div className="flex-1 text-sm sm:text-base text-foreground flex gap-2">
          {props.nestedLevel === 3 ? (
            <Button
              type="button"
              size="icon"
              tooltipText={
                isQuickViewOpen ? dict.action.hide : dict.action.show
              }
              iconSize="small"
              leftIcon="open_in_new"
              onClick={() => navigateToDrawer(`../../view/${props.entityType}/${selectedEntityId}`)}
              variant="outline"
              loading={isQuickViewLoading}
            />
          ) : (
            <Button
              type="button"
              size="icon"
              tooltipText={
                isQuickViewOpen ? dict.action.hide : dict.action.show
              }
              iconSize="small"
              leftIcon={
                isQuickViewOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"
              }
              onClick={() => setIsQuickViewOpen(!isQuickViewOpen)}
              variant={isQuickViewOpen ? "secondary" : "outline"}
              loading={isQuickViewLoading}
            />
          )}
        </div>
      </div>
      {isQuickViewOpen && !isQuickViewLoading && (
        <div
          className={`mt-2 rounded-lg px-2 ${props.nestedLevel % 2 === 0
            ? "bg-muted shadow-md "
            : "bg-background shadow-md "
            }`}
        >
          <FormQuickViewFields
            quickViewGroups={quickViewGroups}
            nestedLevel={props.nestedLevel}
          />
        </div>
      )}
    </div>
  );
}

"use client";

import { useFormQuickView } from "hooks/form/useFormQuickView";
import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import Button from "../../button";
import FormQuickViewFields from "./form-quick-view-fields";

interface FormQuickViewExpandableProps {
  entity: string;
  entityType: string;
}

/**
 * A component that renders the expandable field for a form quick view panel.
 *
 * @param {string} entity - The target entity instance.
 * @param {string} entityType - The type of the entity.
 **/
export default function FormQuickViewExpandable(
  props: Readonly<FormQuickViewExpandableProps>
) {
  const dict: Dictionary = useDictionary();

  const {
    quickViewGroups,
    isQuickViewLoading,
    isQuickViewOpen,
    setIsQuickViewOpen,
  } = useFormQuickView(props.entity, props.entityType);

  return (
    <div className="flex flex-col  py-4 border-b border-border border-dashed">
      <div className="flex flex-row items-baseline">
        <h4 className="flex-shrink-0 w-40 text-sm sm:text-base text-foreground capitalize font-semibold">
          {props.entityType}
        </h4>
        <div className="flex-1 text-sm sm:text-base text-foreground flex gap-2">
          <Button
            type="button"
            size="icon"
            tooltipText={isQuickViewOpen ? dict.action.hide : dict.action.show}
            iconSize="small"
            leftIcon={
              isQuickViewOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"
            }
            onClick={() => setIsQuickViewOpen(!isQuickViewOpen)}
            variant={isQuickViewOpen ? "secondary" : "outline"}
            loading={isQuickViewLoading}
          />
        </div>
      </div>
      {isQuickViewOpen && !isQuickViewLoading && (
        <div className="pl-3 ">
          <FormQuickViewFields quickViewGroups={quickViewGroups} />
        </div>
      )}
    </div>
  );
}

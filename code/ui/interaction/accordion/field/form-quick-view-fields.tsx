"use client";

import { QuickViewGroupings } from "@/types/form";
import TextField from "@/ui/text/field/field";
import { getId, parseWordsForLabels } from "@/utils/client-utils";
import FormQuickViewExpandable from "./form-quick-view-expandable";
import FormQuickViewMap from "./form-quick-view-map";

interface FormQuickViewFieldsProps {
  quickViewGroups: QuickViewGroupings;
  nestedLevel: number;
}

/**
 * A component that renders the fields for a form quick view panel.
 *
 * @param {QuickViewGroupings} quickViewGroups - Input for display.
 * @param {number} nestedLevel - The current level of nesting/recursion.
 **/
export default function FormQuickViewFields(
  props: Readonly<FormQuickViewFieldsProps>
) {
  return (
    <div className="space-y-2 text-foreground">
      {Object.entries(props.quickViewGroups).map(
        ([group, fields], groupIndex) => {
          return (
            <div key={group + groupIndex}>
              {group != "default" && (
                <h4 className="mb-2 capitalize text-foreground font-semibold text-sm sm:text-base underline underline-offset-2">
                  {group}
                </h4>
              )}
              {Object.entries(fields).map(([field, valueArray], fieldIndex) => {
                if (valueArray?.[0]?.type === "mapUri") {
                  return valueArray.map((value, arrayIndex) => (
                    <FormQuickViewMap
                      key={groupIndex + fieldIndex + arrayIndex}
                      label={field}
                      locationUri={value.value}
                    />
                  ));
                }

                // Concepts target an ontology class rather than an instance
                if (valueArray?.[0]?.type === "concept") {
                  return (
                    <TextField
                      key={groupIndex + fieldIndex}
                      label={field}
                      content={valueArray
                        .map((item) => parseWordsForLabels(getId(item.value).replace(/([a-z0-9])([A-Z])/g, "$1 $2")))
                        .join(", ")}
                    />
                  );
                }

                if (valueArray?.[0]?.type === "uri") {
                  return valueArray.map((value, arrayIndex) => (
                    <FormQuickViewExpandable
                      key={groupIndex + fieldIndex + arrayIndex}
                      entity={value.value}
                      entityType={field}
                      nestedLevel={props.nestedLevel + 1}
                    />
                  ));
                }
                return (
                  <TextField
                    key={groupIndex + fieldIndex}
                    label={field}
                    content={valueArray.map((item) => item.value).join(",")}
                  />
                );
              })}
            </div>
          );
        }
      )}
    </div>
  );
}

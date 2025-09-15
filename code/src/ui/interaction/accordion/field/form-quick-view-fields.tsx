"use client";

import { QuickViewGroupings } from "types/form";
import TextField from "ui/text/field/field";
import FormQuickViewExpandable from "./form-quick-view-expandable";
import FormQuickViewMap from "./form-quick-view-map";

interface FormQuickViewFieldsProps {
  quickViewGroups: QuickViewGroupings;
}

/** 
 * A component that renders the fields for a form quick view panel. 
 * 
 * @param {QuickViewGroupings} quickViewGroups - Input for display.
 **/
export default function FormQuickViewFields(props: Readonly<FormQuickViewFieldsProps>) {
  return (
    <div className="py-4 space-y-2 text-sm font-medium text-foreground">
      {Object.entries(props.quickViewGroups).map(([group, fields], groupIndex) => {
        return (<div key={group + groupIndex}>
          {group != "default" &&
            <h4 className="mb-2 capitalize text-foreground">{group}</h4>
          }
          {Object.entries(fields).map(([field, valueArray], fieldIndex) => {
            if (valueArray?.[0].type === "mapUri") {
              return valueArray.map((value, arrayIndex) => <FormQuickViewMap
                key={groupIndex + fieldIndex + arrayIndex}
                label={field}
                locationUri={value.value}
              />
              )
            }

            if (valueArray?.[0].type === "uri") {
              return valueArray.map((value, arrayIndex) =>
                <FormQuickViewExpandable
                  key={groupIndex + fieldIndex + arrayIndex}
                  entity={value.value}
                  entityType={field} />
              )
            }
            return <TextField
              key={groupIndex + fieldIndex}
              label={field}
              content={valueArray.map(item => item.value).join(",")}
            />
          })}
        </div>)
      })}
    </div>
  );
}

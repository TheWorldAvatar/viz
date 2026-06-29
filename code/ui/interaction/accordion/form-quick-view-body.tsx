"use client";

import { useResizeObserver } from "@/hooks/screen/useResizeObserver";
import { QuickViewGroupings } from "@/types/form";
import FormQuickViewFields from "./field/form-quick-view-fields";

interface FormQuickViewBodyProps {
  id: string;
  quickViewGroups: QuickViewGroupings;
}

/**
 * A component that renders the body content for a form quick view panel.
 *
 * @param {string} id - The unique ID for the form accordion.
 * @param {QuickViewGroupings} quickViewGroups - Input for display.
 **/
export default function FormQuickViewBody(
  props: Readonly<FormQuickViewBodyProps>
) {
  // isOpen is true as the component will only render when open
  const { contentRef, contentHeight } = useResizeObserver(true);

  return (
    <div
      id={`accordion-content-${props.id}`}
      role="region"
      aria-labelledby={`accordion-button-${props.id}`}
      className={`transition-all duration-300 ease-in-out overflow-hidden bg-muted rounded-lg inset-shadow-sm `}
      style={{
        maxHeight: `${contentHeight}px`,
      }}
    >
      <div ref={contentRef} className="py-2 px-2 overflow-hidden">
        <FormQuickViewFields
          nestedLevel={0}
          quickViewGroups={props.quickViewGroups}
        />
      </div>
    </div>
  );
}

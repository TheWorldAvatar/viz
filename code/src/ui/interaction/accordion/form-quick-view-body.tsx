"use client";

import { useEffect, useRef, useState } from "react";
import { QuickViewGroupings } from "types/form";
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
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      const updateHeight = () => {
        if (contentRef.current) {
          const height = contentRef.current.scrollHeight;
          setContentHeight(height);
        }
      };

      updateHeight();

      const resizeObserver = new ResizeObserver(() => {
        updateHeight();
      });

      // Start observing the content for size changes
      resizeObserver.observe(contentRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  return (
    <div
      id={`accordion-content-${props.id}`}
      role="region"
      aria-labelledby={`accordion-button-${props.id}`}
      className={`transition-all duration-300 ease-in-out overflow-hidden bg-muted rounded-lg inset-shadow-sm`}
      style={{
        maxHeight: `${contentHeight}px`,
      }}
    >
      <div ref={contentRef} className="py-2 px-4  overflow-hidden">
        <FormQuickViewFields
          nestedLevel={0}
          quickViewGroups={props.quickViewGroups}
        />
      </div>
    </div>
  );
}

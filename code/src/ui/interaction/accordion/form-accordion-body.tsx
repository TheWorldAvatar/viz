"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";

interface FormAccordionBodyProps {
  id: string;
  children: React.ReactNode;
}

/** 
 * A component that renders the body content for a form accordion. 
 * 
 * @param {string} id - The unique ID for the form accordion.
 **/
export default function FormAccordionBody(props: Readonly<FormAccordionBodyProps>) {
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
  }, [props.children]);

  return (
    <div
      id={`accordion-content-${props.id}`}
      role="region"
      aria-labelledby={`accordion-button-${props.id}`}
      className={`transition-all duration-300 ease-in-out overflow-hidden`}
      style={{
        maxHeight: `${contentHeight}px`,
      }}
    >
      <div ref={contentRef} className="p-4 pt-0 border-t border-border">
        {props.children}
      </div>
    </div>
  );
}

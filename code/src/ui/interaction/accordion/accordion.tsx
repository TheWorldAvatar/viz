"use client";

import type React from "react";
import { useCallback, useRef, useState, useEffect } from "react";
import Button from "../button";

interface AccordionProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  isOpen?: boolean;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
  accordionActions?: React.ReactNode;
}

export default function Accordion(props: Readonly<AccordionProps>) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const handleToggle = useCallback(() => {
    if (props.setIsOpen) props.setIsOpen((prev) => !prev);
  }, [props.setIsOpen]);

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
    <div className={`${props.className || ""}`}>
      <div className="flex justify-between items-center mb-2">
        <Button
          type="button"
          leftIcon="menu_open"
          size="sm"
          variant="outline"
          onClick={handleToggle}
          aria-expanded={props.isOpen}
          className="!text-xs"
        >
          {props.title ? props.title : ""}
        </Button>
        <div className="flex gap-2">{props.accordionActions}</div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          props.isOpen ? "opacity-100" : "opacity-0"
        }`}
        style={{
          maxHeight: props.isOpen ? `${contentHeight}px` : "0px",
        }}
      >
        <div ref={contentRef} className="p-4 pt-0 border-t border-border">
          {props.children}
        </div>
      </div>
    </div>
  );
}

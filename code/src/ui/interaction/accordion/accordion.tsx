"use client";

import type React from "react";
import { useCallback, useRef, useState, useEffect } from "react";
import { Icon } from "@mui/material";

interface AccordionProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  isOpen?: boolean;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
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
  }, [props.children, props.isOpen]);

  return (
    <div
      className={`border border-border rounded-lg overflow-hidden bg-background  ${
        props.className || ""
      }`}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={props.isOpen}
        className="w-full flex items-center outline-none justify-between p-3 text-left bg-background hover:bg-background transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400  focus-visible:ring-inset"
      >
        <span className="font-medium text-foreground text-sm">
          {props.title ? props.title : ""}
        </span>
        <Icon
          className={` material-symbols-outlined  text-foreground transition-transform duration-200 ${
            props.isOpen ? "rotate-180" : ""
          }`}
        >
          keyboard_arrow_down
        </Icon>
      </button>

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

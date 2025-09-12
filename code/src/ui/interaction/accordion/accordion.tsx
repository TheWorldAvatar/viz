"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  useEffect,
  useId,
} from "react";
import Button from "../button";

interface AccordionContextType {
  isOpen: boolean;
  toggle: () => void;
  uniqueId: string;
  contentHeight: number;
  contentRef: React.RefObject<HTMLDivElement>;
}

const AccordionContext = createContext<AccordionContextType | null>(null);

interface AccordionProps {
  children: React.ReactNode;
  isOpen?: boolean;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * A collapsible accordion component with smooth animations using compound component pattern.
 *
 * @param children - The accordion trigger and content components
 * @param isOpen - Controlled open state, you can optionally manage the open state externally
 * @param setIsOpen - State setter for controlled behavior, if you want to manage the open state externally
 **/

function Accordion(props: Readonly<AccordionProps>) {
  const [isOpen, setIsOpen] = useState<boolean>(props.isOpen ?? false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const uniqueId = useId();

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
    if (props.setIsOpen) props.setIsOpen((prev) => !prev);
  }, [isOpen, props.setIsOpen]);

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
    <AccordionContext.Provider
      value={{ isOpen, toggle, uniqueId, contentHeight, contentRef }}
    >
      <div>{props.children}</div>
    </AccordionContext.Provider>
  );
}

interface AccordionTriggerProps {
  children?: React.ReactNode;
  title?: React.ReactNode;
}

/**
 * @param children - The Accordion trigger children, typically buttons or icons
 * @param title - Optional title to display next to the trigger button
 **/

function AccordionTrigger(props: Readonly<AccordionTriggerProps>) {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("AccordionTrigger must be used within an Accordion");
  }

  const { isOpen, toggle, uniqueId } = context;

  return (
    <div className="flex justify-between items-center mb-2">
      <Button
        type="button"
        leftIcon="menu_open"
        size="sm"
        iconSize="small"
        variant="outline"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${uniqueId}`}
        className="text-xs"
      >
        {props.title ? props.title : ""}
      </Button>
      <div className="flex gap-2">{props.children}</div>
    </div>
  );
}

interface AccordionContentProps {
  children: React.ReactNode;
}

/**
 * @param children - The Accordion Content children
 **/

function AccordionContent(props: Readonly<AccordionContentProps>) {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("AccordionContent must be used within an Accordion");
  }

  const { isOpen, uniqueId, contentHeight, contentRef } = context;

  return (
    <div
      id={`accordion-content-${uniqueId}`}
      role="region"
      aria-labelledby={`accordion-button-${uniqueId}`}
      className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      style={{
        maxHeight: isOpen ? `${contentHeight}px` : "0px",
      }}
    >
      <div ref={contentRef} className="p-4 pt-0 border-t border-border">
        {props.children}
      </div>
    </div>
  );
}

Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;

export default Accordion;

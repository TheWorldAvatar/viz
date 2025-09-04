import React, { useCallback } from "react";
import Button from "../button";

interface AccordionProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  isOpen?: boolean;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
}

export default function Accordion(props: Readonly<AccordionProps>) {
  const handleToggle = useCallback(() => {
    if (props.setIsOpen) props.setIsOpen((prev) => !prev);
  }, [props.isOpen, props.setIsOpen]);

  return (
    <div
      className={`${
        props.isOpen && "border border-border rounded-lg bg-muted"
      }`}
    >
      {props.title && (
        <Button
          type="button"
          leftIcon={props.isOpen ? "expand_less" : "expand_more"}
          variant="outline"
          onClick={handleToggle}
          aria-expanded={props.isOpen}
        >
          {props.title}
        </Button>
      )}
      <div className={`px-4 pb-4 ${props.isOpen ? "block" : "hidden"}`}>
        {props.children}
      </div>
    </div>
  );
}

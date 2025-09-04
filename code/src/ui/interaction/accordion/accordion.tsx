import React, { useCallback, useState } from "react";
import Button from "../button";

interface AccordionProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean; // if provided, component becomes controlled
  onToggle?: (_nextOpen: boolean) => void;
  className?: string;
}

export default function Accordion(props: Readonly<AccordionProps>) {
  const [internalOpen, setInternalOpen] = useState<boolean>(
    props.defaultOpen ?? false
  );

  const open = props.isOpen ?? internalOpen;

  const handleToggle = useCallback(() => {
    const next = !open;
    if (props.onToggle) props.onToggle(next);
    if (props.isOpen === undefined) setInternalOpen(next);
  }, [open, props.onToggle, props.isOpen]);

  return (
    <div
      className={`${
        props.isOpen && "border border-border rounded-lg bg-muted"
      }`}
    >
      {props.title && (
        <Button
          type="button"
          leftIcon={open ? "expand_less" : "expand_more"}
          variant="outline"
          onClick={handleToggle}
          aria-expanded={open}
        >
          {props.title}
        </Button>
      )}
      <div className={`px-4 pb-4 ${open ? "block" : "hidden"}`}>
        {props.children}
      </div>
    </div>
  );
}

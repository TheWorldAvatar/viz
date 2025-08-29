import React, { useCallback, useState } from "react";

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
        props.isOpen && "border border-border rounded-lg bg-background"
      }`}
    >
      {props.title && (
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-2 hover:bg-muted rounded-t-lg"
          onClick={handleToggle}
          aria-expanded={open}
        >
          <span className="text-left font-semibold">{props.title}</span>
          <span className="material-symbols-outlined">
            {open ? "expand_less" : "expand_more"}
          </span>
        </button>
      )}
      <div className={`px-4 pb-4 ${open ? "block" : "hidden"}`}>
        {props.children}
      </div>
    </div>
  );
}

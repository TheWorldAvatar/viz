import React from "react";

interface AccordionProps {
  children: React.ReactNode;
}

export default function Accordion(props: Readonly<AccordionProps>) {
  return <div className="bg-amber-400">{props.children}</div>;
}

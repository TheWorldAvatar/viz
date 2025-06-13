
import { useState } from "react";

import LoadingSpinner from "ui/graphic/loader/spinner";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
}

/**
 * This component renders an accordion section container.
 *
 * @param {string} title The title to display.
 * @param {React.ReactNode} children Children components to render.
 * @param {boolean} IsLoading Optional indicator to display a loading spinner over expansion or close icon if required.
 */
export default function Accordion(props: Readonly<AccordionProps>) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-md bg-gray-200 rounded-md">
      <button
        className="flex justify-between items-center cursor-pointer w-full p-2 bg-gray-300 rounded-lg transition-colors duration-200 hover:bg-gray-400"
        onClick={toggleAccordion}
      >
        <p className="text-foreground">{props.title}</p>
        <span
          className={`text-sm md:text-lg  transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          {props.isLoading && <LoadingSpinner isSmall={true} />}
          {!props.isLoading && <>&#x25BC;</>}
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-2 md:p-4 flex flex-col gap-2">{props.children}</div>
      </div>
    </div>
  );
}

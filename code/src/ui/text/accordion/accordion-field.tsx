import { parseWordsForLabels } from "utils/client-utils";

interface AccordionFieldProps {
  name: string;
  value: string;
}

/**
 * This component renders a field display within an accordion's content.
 *
 * @param {string} name The name of the field.
 * @param {string} value The value to render.
 */
export default function AccordionField(props: Readonly<AccordionFieldProps>) {
  return (
    <p className="flex justify-between text-xs sm:text-sm md:text-base  py-1">
      <span className="font-bold">{parseWordsForLabels(props.name)}:</span>
      {parseWordsForLabels(props.value)}
    </p>
  );
}

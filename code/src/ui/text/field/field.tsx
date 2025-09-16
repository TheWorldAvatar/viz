interface TextFieldProps {
  label: string;
  content: string;
}

/**
 * This component renders a text field display .
 *
 * @param {string} label The label of the text.
 * @param {string} content The text content.
 */
export default function TextField(props: Readonly<TextFieldProps>) {
  return (
    <div className="flex flex-row sm:items-start py-2 ">
      <h4 className="flex-shrink-0 w-28 lg:w-36 text-sm sm:text-base font-semibold text-foreground capitalize">
        {props.label}
      </h4>
      <p className="hyphens-auto  text-sm sm:text-base text-gray-500 dark:text-gray-300">
        {props.content}
      </p>
    </div>
  );
}

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
  // Check if content contains commas and split into lines
  const hasComma = props.content.includes(',');
  const lines = hasComma 
    ? props.content.split(',').map(line => line.trim()) 
    : [props.content];

  return (
    <div className="flex flex-row sm:items-start py-2 min-w-0">
      <h4 className="flex-shrink-0 w-28 sm:w-32 text-sm sm:text-base font-semibold text-foreground capitalize">
        {props.label}
      </h4>
      <div className="flex-1 min-w-0 text-wrap hyphens-auto break-all text-sm text-gray-600 dark:text-gray-300">
        {lines.map((line, index) => (
          <p key={index} className="min-w-0">
            {line}{index < lines.length - 1 ? ',' : ''}
          </p>
        ))}
      </div>
    </div>
  );
}

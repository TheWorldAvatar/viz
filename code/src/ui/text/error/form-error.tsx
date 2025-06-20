import { FieldError } from "react-hook-form";

interface FormErrorComponentProps {
  error: FieldError;
}

/**
 * Renders error message based on the error message
 *
 * @param {FieldError} error A react-hook-form error object if an error is present.
 */
export default function FormErrorComponent(
  props: Readonly<FormErrorComponentProps>
) {
  // Retrieve the message for a field if available
  // If not, retrieve the field array root's message
  // If neither are available or there is no error,  return no message
  const message: string =
    props.error?.message?.toString() ??
    props.error?.root?.message?.toString() ??
    "";
  return (
    <>
      {props.error && (
        <p className="text-red-600 text-lg mt-4">{`*${message}`}</p>
      )}
    </>
  );
}

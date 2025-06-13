
interface ErrorComponentProps {
  message: string;
}

/**
 * Renders error message.
 *
 * @param {string} message An error message to render.
 */
export default function ErrorComponent(props: Readonly<ErrorComponentProps>) {
  return (
    <p className="my-2 text-sm md:text-lg text-red-600">{`*${props.message}`}</p>
  );
}

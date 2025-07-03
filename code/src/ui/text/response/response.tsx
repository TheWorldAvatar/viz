import { useDictionary } from "hooks/useDictionary";
import { AgentResponseBody } from "types/backend-agent";
import { Dictionary } from "types/dictionary";

interface ResponseComponentProps<> {
  response: AgentResponseBody;
}

/**
 * Renders the response message for dialogs after submission.
 *
 * @param {AgentResponseBody} response Response to display.
 */
export default function ResponseComponent(
  props: Readonly<ResponseComponentProps>
) {
  const dict: Dictionary = useDictionary();
  if (props.response) {
    const textColor: string = props.response?.error
      ? "text-red-600"
      : "text-green-600";
    return (
      <div className={`${textColor} overflow-auto h-[5vh] w-full`}>
        {props.response?.data?.message || props.response?.error?.message}
        <br />
        {props.response?.error ? "" : dict.message.contactTechTeam}
      </div>
    );
  } else {
    return <div></div>;
  }
}

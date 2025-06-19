import { useDictionary } from "hooks/useDictionary";
import { CustomAgentResponseBody } from "types/backend-agent";
import { Dictionary } from "types/dictionary";

interface ResponseComponentProps<> {
  response: CustomAgentResponseBody;
}

/**
 * Renders the response message for dialogs after submission.
 *
 * @param {CustomAgentResponseBody} response Response to display.
 */
export default function ResponseComponent(
  props: Readonly<ResponseComponentProps>
) {
  const dict: Dictionary = useDictionary();
  if (props.response) {
    const textColor: string = props.response?.success
      ? "text-green-600"
      : "text-red-600";
    return (
      <div className={`${textColor} overflow-auto h-[5vh] w-full`}>
        {props.response.message}
        <br />
        {props.response.success ? "" : dict.message.contactTechTeam}
      </div>
    );
  } else {
    return <div></div>;
  }
}

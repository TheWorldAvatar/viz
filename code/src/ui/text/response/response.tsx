import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import { CustomAgentResponseBody } from "utils/server-actions";

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
    const textColor: string = props.response?.success ? "#52B7A5" : "#D7653D";
    return (
      <div
        style={{
          color: textColor,
          overflowY: "auto",
          height: "5vh",
          width: "100%",
        }}
      >
        {props.response.message}
        <br />
        {props.response.success ? "" : dict.message.contactTechTeam}
      </div>
    );
  } else {
    return <div></div>;
  }
}

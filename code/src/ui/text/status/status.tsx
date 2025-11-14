import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import { parseWordsForLabels } from "utils/client-utils";

interface StatusComponentProps<> {
  status: string;
}

export function getTranslatedStatusLabel(
  status: string,
  dict: Dictionary
): string {
  switch (status.toLowerCase()) {
    case "available":
      return dict.title.available;
    case "unavailable":
      return dict.title.unavailable;
    case "active":
      return dict.title.active;
    case "assigned":
      return dict.title.assigned;
    case "completed":
      return dict.title.completed;
    case "cancelled":
      return dict.title.cancelled;
    case "new":
      return dict.title.new;
    case "issue":
      return dict.title.issue;
    case "rescinded":
      return dict.title.rescinded;
    case "terminated":
      return dict.title.terminated;
    default:
      return null;
  }
}

/**
 * Renders the status with a circle indicator.
 *
 * @param {string} status The status to display.
 */
export default function StatusComponent(props: Readonly<StatusComponentProps>) {
  let statusTextColor: string;
  let statusBackgroundColor: string;
  const dict: Dictionary = useDictionary();

  switch (props.status.toLowerCase()) {
    case dict.title.available.toLowerCase():
    case dict.title.active.toLowerCase():
    case dict.title.new.toLowerCase():
      statusTextColor = "var(--status-open-text)";
      statusBackgroundColor = "var(--status-open-bg)";
      break;
    case dict.title.unavailable.toLowerCase():
    case dict.title.cancelled.toLowerCase():
      statusTextColor = "var(--status-cancelled-text)";
      statusBackgroundColor = "var(--status-cancelled-bg)";
      break;
    case dict.title.issue.toLowerCase():
      statusTextColor = "var(--status-issue-text)";
      statusBackgroundColor = "var(--status-issue-bg)";
      break;
    case dict.title.completed.toLowerCase():
      statusTextColor = "var(--status-open-text)";
      statusBackgroundColor = "var(--status-open-bg)";
      break;
    case dict.title.rescinded.toLowerCase():
    case dict.title.terminated.toLowerCase():
      statusTextColor = "var(--status-cancelled-text)";
      statusBackgroundColor = "var(--status-cancelled-bg)";
      break;
    default:
      statusTextColor = "var(--status-assigned-text)";
      statusBackgroundColor = "var(--status-assigned-bg)";
  }

  return (
    <span className="flex justify-center items-center">
      <p
        className="text-lg px-8 py-1 rounded-4xl"
        style={{
          color: statusTextColor,
          backgroundColor: statusBackgroundColor,
        }}
      >
        {parseWordsForLabels(dict.title[props.status.replace(/^[A-Z]/, (firstChar) => firstChar.toLowerCase())] ?? props.status)}
      </p>
    </span>
  );
}

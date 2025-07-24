import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";

export const Status: {
  [key: string]: string;
} = {
  AVAILABLE: "available",
  UNAVAILABLE: "unavailable",
  ACTIVE: "active",
  NEW: "open",
  ASSIGNED: "assigned",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  ISSUE: "issue",
  RESCINDED: "rescinded",
  TERMINATED: "terminated",
};

interface StatusComponentProps<> {
  status: string;
}

export function getTranslatedStatusLabel(
  status: string,
  dict: Dictionary
): string {
  switch (status.toLowerCase()) {
    case Status.AVAILABLE:
      return dict.title.available;
    case Status.UNAVAILABLE:
      return dict.title.unavailable;
    case Status.ACTIVE:
      return dict.title.active;
    case Status.ASSIGNED:
      return dict.title.assigned;
    case Status.COMPLETED:
      return dict.title.completed;
    case Status.CANCELLED:
      return dict.title.cancelled;
    case Status.NEW:
      return dict.title.new;
    case Status.ISSUE:
      return dict.title.issue;
    case Status.RESCINDED:
      return dict.title.rescinded;
    case Status.TERMINATED:
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
  let statusColor: string;
  const dict: Dictionary = useDictionary();

  switch (props.status.toLowerCase()) {
    case dict.title.available.toLowerCase():
    case dict.title.active.toLowerCase():
    case dict.title.new.toLowerCase():
      statusColor = "#52B7A5";
      break;
    case dict.title.unavailable.toLowerCase():
    case dict.title.cancelled.toLowerCase():
    case dict.title.issue.toLowerCase():
    case dict.title.rescinded.toLowerCase():
    case dict.title.terminated.toLowerCase():
      statusColor = "#D7653D";
      break;
    default:
      statusColor = "#666";
  }

  return (
    <span className="inline-flex items-center ">
      <span
        className="h-2 w-2 mx-1 rounded-full bg-background border-1 border-solid"
        style={{ borderColor: statusColor }}
      ></span>
      <p className="text-lg" style={{ color: statusColor }}>
        {props.status}
      </p>
    </span>
  );
}

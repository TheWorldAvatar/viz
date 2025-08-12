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
  let statusBackgroundColor: string;
  const dict: Dictionary = useDictionary();

  switch (props.status.toLowerCase()) {
    case dict.title.available.toLowerCase():
    case dict.title.active.toLowerCase():
    case dict.title.new.toLowerCase():
      statusColor = "hsl(159, 75%, 16%)";
      statusBackgroundColor = "hsl(156, 40%, 86%)";
      break;
    case dict.title.unavailable.toLowerCase():
    case dict.title.cancelled.toLowerCase():
      statusColor = "hsl(1, 75%, 20%)";
      statusBackgroundColor = "hsl(2, 100%, 96%)";
      break;
    case dict.title.issue.toLowerCase():
      statusColor = "hsl(18, 74%, 24%)";
      statusBackgroundColor = "hsl(52, 82%, 93%)";
      break;
    case dict.title.completed.toLowerCase():
      statusColor = "hsl(159, 75%, 16%)";
      statusBackgroundColor = "hsl(156, 40%, 86%)";
      break;
    case dict.title.rescinded.toLowerCase():
    case dict.title.terminated.toLowerCase():
      statusColor = "hsl(1, 75%, 20%)";
      statusBackgroundColor = "hsl(2, 100%, 96%)";
      break;
    default:
      statusColor = "hsl(0, 0%, 20%)";
      statusBackgroundColor = "hsl(0, 0%, 90%)";
  }

  return (
    <span className="flex justify-center items-center ">
      <p
        className="text-lg px-8 py-1 rounded-full"
        style={{ color: statusColor, backgroundColor: statusBackgroundColor }}
      >
        {props.status}
      </p>
    </span>
  );
}

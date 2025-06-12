import { Dictionary } from "types/dictionary";

export const Status: {
  [key: string]: string;
} = {
  AVAILABLE: "available",
  UNAVAILABLE: "unavailable",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  INCOMPLETE: "incomplete",
  RESCINDED: "rescinded",
  TERMINATED: "terminated",
  PENDING_DISPATCH: "pending dispatch",
  PENDING_EXECUTION: "pending execution",
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
    case Status.COMPLETED:
      return dict.title.completed;
    case Status.CANCELLED:
      return dict.title.cancelled;
    case Status.INCOMPLETE:
      return dict.title.incomplete;
    case Status.RESCINDED:
      return dict.title.rescinded;
    case Status.TERMINATED:
      return dict.title.terminated;
    case Status.PENDING_DISPATCH:
      return dict.title.pendingDispatch;
    case Status.PENDING_EXECUTION:
      return dict.title.pendingExecution;
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

  switch (props.status.toLowerCase()) {
    case Status.AVAILABLE:
    case Status.ACTIVE:
      statusColor = "#52B7A5";
      break;
    case Status.UNAVAILABLE:
    case Status.CANCELLED:
    case Status.INCOMPLETE:
    case Status.RESCINDED:
    case Status.TERMINATED:
      statusColor = "#D7653D";
      break;
    default:
      statusColor = "#666";
  }

  return (
    <span className="inline-flex items-center">
      <span
        className="h-2 w-2 mx-1 rounded-full bg-background border-1 border-solid"
        style={{ borderColor: statusColor }}
      ></span>
      <p className="text-xs" style={{ color: statusColor }}>
        {props.status}
      </p>
    </span>
  );
}

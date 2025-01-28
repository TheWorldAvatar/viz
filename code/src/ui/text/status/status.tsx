import styles from './status.module.css';

import React from 'react';

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
    <span className={styles.container}>
      <span className={styles.circle} style={{ borderColor: statusColor }}></span>
      <p className={styles.text} style={{ color: statusColor }}>{props.status}</p>
    </span>
  );
}
import useTableDensity from "@/hooks/table/useTableDensity";
import StatusComponent from "@/ui/text/status/status";

interface StatusCellProps {
  status: string;
}

/**
 * This component renders the status badge of a table cell, sized according to the table density.
 *
 * @param {string} status The status to display.
 */
export default function StatusCell(props: Readonly<StatusCellProps>) {
  const { statusCellSize } = useTableDensity();
  return <StatusComponent size={statusCellSize} status={props.status} />;
}

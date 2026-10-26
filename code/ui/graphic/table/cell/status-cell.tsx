import useTableSession from "@/hooks/table/useTableSession";
import { TableDensityMap } from "@/types/table";
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
  const { tableDensity } = useTableSession();
  return <StatusComponent size={tableDensity === TableDensityMap.COMPACT ? "sm" : "default"} status={props.status} />;
}

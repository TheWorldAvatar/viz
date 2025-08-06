interface TableCellProps {
  isHeader?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export default function TableCell(props: Readonly<TableCellProps>) {
  const baseClasses =
    "border-r border-border p-3 whitespace-nowrap text-lg font-normal";
  const isHeaderClasses = props.isHeader
    ? "bg-muted font-semibold text-foreground text-left"
    : "";

  return (
    <th style={props.style} className={`${baseClasses} ${isHeaderClasses}`}>
      {props.children}
    </th>
  );
}

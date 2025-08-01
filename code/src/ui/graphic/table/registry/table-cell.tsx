interface TableCellProps {
  isHeader?: boolean;
  style?: React.CSSProperties;
  scope?: string | undefined;
  children?: React.ReactNode;
  className?: string;
}

export default function TableCell(props: Readonly<TableCellProps>) {
  const baseClasses =
    "border-r border-border p-3 whitespace-nowrap text-lg font-normal";
  const isHeaderClasses = props.isHeader
    ? "bg-muted font-semibold text-foreground text-left"
    : "";
  const customClasses = props.className || "";

  return (
    <th
      style={props.style}
      className={`${baseClasses} ${isHeaderClasses} ${customClasses}`.trim()}
      scope={props.scope}
    >
      {props.children}
    </th>
  );
}

interface TableCellProps {
  isHeader?: boolean;
  style?: React.CSSProperties;
  scope?: string | undefined;
  children?: React.ReactNode;
}

export default function TableCell(props: Readonly<TableCellProps>) {
  return (
    <th
      style={props.style}
      className={`border-r border-border p-3 whitespace-nowrap text-lg font-normal ${
        props.isHeader
          ? "bg-muted  font-semibold text-foreground text-left"
          : ""
      }`}
      scope={props.scope}
    >
      {props.children}
    </th>
  );
}

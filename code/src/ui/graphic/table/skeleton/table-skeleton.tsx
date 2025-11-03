interface TableSkeletonProps {
    rows?: number;
    columns?: number;
}

/**
 * A skeleton loading component for table rows while pagination is loading.
 *
 * @param {number} rows - Number of skeleton rows to display (default: 5)
 * @param {number} columns - Number of skeleton columns to display (default: 6)
 */
export default function TableSkeleton({ rows = 5, columns = 6 }: Readonly<TableSkeletonProps>) {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={`skeleton-row-${rowIndex}`} className="group">
                    {/* Action cells*/}
                    <th className="border-r border-border border-b p-2 md:p-3 sticky left-0 z-20 bg-background">
                        <div className="flex gap-0.5">
                            <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                            <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                        </div>
                    </th>
                    {/* Data cellss */}
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <th
                            key={`skeleton-col-${colIndex}`}
                            className="border-r bg-background border-border border-b p-2 md:p-3 animate-pulse whitespace-nowrap last:border-r-0"
                        >
                            <div className="h-6 bg-gray-200 animate-pulse rounded w-full max-w-[200px]" />
                        </th>
                    ))}
                </tr>
            ))}
        </>
    );
}

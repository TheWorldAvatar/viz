import { Icon } from "@mui/material";

export default function TableSkeleton() {
    return (
        <div className="rounded-lg border border-border flex flex-col h-full w-full overflow-hidden">
            <table className="w-full border-separate border-spacing-0 ">
                <thead className="bg-muted sticky top-0 z-10">
                    <tr>
                        <th className="w-[calc(100%/20)] border-r border-border border-b p-2 md:p-3 sticky left-0 z-20 bg-muted">
                        </th>
                        {/* Header cells */}
                        {[...Array(5)].map((_, colIndex) => (
                            <th
                                key={`skeleton-header-${colIndex}`}
                                className="border-r border-border border-b p-2 md:p-3 text-left font-semibold whitespace-nowrap last:border-r-0"
                            >
                                <div className="h-5 bg-ring animate-pulse rounded w-24" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {[...Array(5)].map((_, rowIndex) => (
                        <tr key={`skeleton-row-${rowIndex}`}>
                            {/* Action cells */}
                            <th className="w-[calc(100%/20)] border-r border-border border-b  p-2 md:p-3 sticky left-0 z-20 bg-background group-hover:bg-muted">
                                <div className="flex gap-0.5">
                                    <div className="h-8 w-8 bg-ring animate-pulse rounded flex items-center justify-center">
                                        <Icon fontSize="medium" className="material-symbols-outlined  opacity-30">
                                            drag_indicator
                                        </Icon>
                                    </div>
                                    <div className="h-8 w-8 bg-ring animate-pulse rounded flex items-center justify-center">
                                        <Icon fontSize="medium" className="material-symbols-outlined opacity-30">
                                            more_vert
                                        </Icon>
                                    </div>
                                </div>
                            </th>
                            {/* Data cells */}
                            {[...Array(5)].map((_, colIndex) => (
                                <th key={`skeleton-col-${colIndex}`}
                                    className="border-r bg-background border-border border-b p-2 md:p-3 whitespace-nowrap last:border-r-0 group-hover:bg-muted "
                                >
                                    <div className="h-6 bg-ring animate-pulse rounded w-full" />
                                </th>
                            ))
                            }
                        </tr>
                    ))}
                </tbody>
            </table>
        </div >
    );
}

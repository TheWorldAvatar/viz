import { Icon } from "@mui/material";

export default function TableSkeleton() {
    return (
        <div className="w-full rounded-lg border border-border   flex flex-col h-full overflow-hidden">
            {/* Table container */}
            <div className="overflow-auto flex-1 min-h-[500px] table-scrollbar">
                <div className="min-w-full">
                    <table className="w-full border-separate border-spacing-0 ">
                        <thead className="bg-muted sticky top-0 z-10">
                            <tr className="group">
                                <th className="w-[calc(100%/20)] border-r border-border border-b p-2 md:p-3 sticky left-0 z-20 bg-muted">
                                    <div className="flex justify-end items-center rounded-md gap-2 mt-10">
                                        <div className="h-5 w-5 bg-ring animate-pulse rounded" />
                                    </div>
                                </th>
                                {/* Header cells */}
                                {Array.from({ length: 5 }).map((_, colIndex) => (
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
                            {Array.from({ length: 5 }).map((_, rowIndex) => (
                                <tr key={`skeleton-row-${rowIndex}`} className="group">
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
                                            <div className="h-8 w-8 bg-ring animate-pulse rounded flex items-center justify-center">
                                                <Icon fontSize="medium" className="material-symbols-outlined opacity-30">
                                                    check_box_icon
                                                </Icon>
                                            </div>
                                        </div>
                                    </th>
                                    {/* Data cells */}
                                    {
                                        Array.from({ length: 5 }).map((_, colIndex) => (
                                            <th
                                                key={`skeleton-col-${colIndex}`}
                                                className="border-r bg-background border-border border-b p-2 md:p-3 whitespace-nowrap last:border-r-0 group-hover:bg-muted "
                                            >
                                                <div
                                                    className="h-6 bg-ring animate-pulse rounded w-full"
                                                    style={{
                                                        maxWidth: `${120 + (colIndex * 20) % 100}px`
                                                    }}
                                                />
                                            </th>
                                        ))
                                    }
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
}

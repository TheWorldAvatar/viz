export default function FormSkeleton() {
    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <div className="flex-1 p-4 animate-pulse space-y-4 overflow-auto">

                <div className="space-y-4">
                    {[...Array(8)].map((_, index) => (
                        <div key={`skeleton-field-${index}`} className="space-y-2">
                            <div className="h-12 bg-ring rounded w-full" />
                            <div className="h-12 bg-ring rounded w-full" />
                            <div className="h-26 bg-ring rounded w-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
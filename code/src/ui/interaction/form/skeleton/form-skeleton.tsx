interface FormSkeletonProps {
    numberOfFields?: number;
}

export default function FormSkeleton({ numberOfFields = 4 }: FormSkeletonProps) {
    return (
        <div className="w-full h-full flex flex-col overflow-hidden ">
            <div className="flex-1 p-4 animate-pulse space-y-4 overflow-hidden">

                <div className="space-y-4">
                    {[...Array(numberOfFields)].map((_, index) => (
                        <div key={`skeleton-field-${index}`} className="space-y-2">
                            <div className="h-12 md:h-12 bg-ring rounded w-full" />
                            <div className="h-26 bg-ring rounded w-full" />
                            <div className="flex items-center justify-between">
                                <div className="h-12 bg-ring rounded w-46 max-w-24" />
                                <div className="h-12 bg-ring rounded w-46" />
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
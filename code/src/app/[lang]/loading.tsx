"use client"

import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import LoadingSpinner from "ui/graphic/loader/spinner";

export default function Loading() {
    const dict: Dictionary = useDictionary();
    return (
        <div className="fixed z-50 inset-0 left-0 top-0 backdrop-blur-xs bg-background/10 flex min-h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <LoadingSpinner isSmall={false} />
                <p className="text-sm md:text-base lg:text-lg text-muted-foreground">{dict.message.loading}</p>
            </div>
        </div>
    );
}
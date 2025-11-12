"use client";

import { useDictionary } from "hooks/useDictionary";
import { useRouter } from "next/navigation";
import { Dictionary } from "types/dictionary";
import Button from "ui/interaction/button";

export default function NotFound() {
    const dict: Dictionary = useDictionary();
    const router = useRouter();
    return (
        <div className="flex items-center justify-center flex-col space-y-4 h-svh">
            <h1 className="scroll-m-20 text-6xl md:text-8xl font-extrabold tracking-tight mt-20 mb-8 text-destructive underline">
                404
            </h1>
            <p className="text-foreground font-semibold">{dict.message.notFound}</p>
            <Button
                onClick={() => router.back()}
                className="text-foreground"
                variant="outline"
            >
                {dict.action.back}
            </Button>
        </div>
    );
}
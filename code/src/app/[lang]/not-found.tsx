"use client";

import { useDictionary } from "hooks/useDictionary";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dictionary } from "types/dictionary";
import Button from "ui/interaction/button";

export default function NotFound() {
    const dict: Dictionary = useDictionary();
    const router = useRouter();
    return (
        <div className="fixed z-50 inset-0 left-0 top-0 bg-gradient-to-b from-background via-muted to-primary flex min-h-screen items-center justify-center flex-col space-y-4">
            <h1 className="scroll-m-20 text-6xl md:text-8xl font-extrabold tracking-tight lg:text-9xl mt-8 mb-8 text-destructive underline">
                404
            </h1>
            <p className="text-foreground">{dict.message.notFound}</p>
            <Button
                onClick={() => router.back()}
                className="text-foreground"
                variant="link"
            >
                {dict.action.back}
            </Button>
            <Button variant="outline">
                <Link href="/">{dict.action.backHome}</Link>
            </Button>
        </div>
    );
}
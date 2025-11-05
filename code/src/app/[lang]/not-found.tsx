"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "ui/interaction/button";

export default function NotFound() {
    const router = useRouter();
    return (
        <div className="fixed z-50 inset-0 left-0 top-0 bg-gradient-to-b from-background via-muted to-primary flex min-h-screen items-center justify-center flex-col space-y-4">
            <h1 className="scroll-m-20 text-6xl md:text-8xl font-extrabold tracking-tight lg:text-[13rem] mt-8 mb-8 text-destructive underline">
                404
            </h1>
            <p className="text-foreground">This page could not be found</p>
            <Button
                onClick={() => router.back()}
                className="text-foreground"
                variant="link"
            >
                Back
            </Button>
            <Button variant="outline">
                <Link href="/">Go back home</Link>
            </Button>
        </div>
    );
}
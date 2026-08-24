import type { LucideIcon } from "lucide-react";

export type ToastType = "success" | "error" | "loading" | "default";

export type ToastConfig = {
    bg: string;
    border: string;
    text: string;
    icon: LucideIcon;
    title?: string;
    animate?: string;
};

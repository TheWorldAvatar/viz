export type ToastType = "success" | "error" | "loading" | "default";

export type ToastConfig = {
    bg: string;
    border: string;
    text: string;
    icon: string;
    title?: string;
    animate?: string;
};

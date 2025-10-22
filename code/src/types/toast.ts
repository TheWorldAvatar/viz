export type ToastType = "success" | "error" | "loading";

export type ToastConfig = {
    bg: string;
    border: string;
    text: string;
    icon: string;
    title?: string;
    animate?: string;
};

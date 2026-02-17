import { Routes } from "io/config/routes";
import { redirect } from "next/navigation";

/**
 * Redirects back to home page if visited.
 * 
 */
export default function InaccessiblePage() {
    redirect(Routes.HOME);
}

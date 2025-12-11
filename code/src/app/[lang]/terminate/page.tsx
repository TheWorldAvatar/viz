import { redirect } from 'next/navigation';

import { Routes } from 'io/config/routes';

/**
 * Redirects back to home page if visited.
 * 
 */
export default function InaccessiblePage() {
    redirect(Routes.HOME);
}

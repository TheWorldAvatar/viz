"use client";

import Link from 'next/link';
import styles from './keycloak-user-button.module.css';
import { useUserDisplayName } from 'hooks/auth/useUserDisplayName';


/**
 * This component renders a widget that displays the user and a log out button.
*
*/
export default function KeycloakUserButton() {
    const userDisplayName = useUserDisplayName();
    return (
        <div id="keycloakSession" className={styles.keycloakSession}>
            <span id="userName" className={styles.dropbtn}>{userDisplayName}</span>
            <div className={styles.dropdownContent}>
                <Link prefetch={false} href="/logout">Log Out</Link>
            </div>
        </div>
    );
};
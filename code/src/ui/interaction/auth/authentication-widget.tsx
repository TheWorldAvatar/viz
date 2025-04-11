"use client";

import Link from 'next/link';
import styles from './authentication-widget.module.css';
import { useUserDisplayName } from 'utils/auth/SessionContext';


const userDisplayName = useUserDisplayName();
/**
 * This component renders a widget that displays the user and a log out button.
 *
 */
export default function KeycloakUserButton() {
    return (
        <div id="keycloakSession" className={styles.keycloakSession}>
            <span id="userName" className={styles.dropbtn}>{userDisplayName}</span>
            <div className={styles.dropdownContent}>
                <Link prefetch={false} href="/logout">Log Out</Link>
            </div>
        </div>
    );
};
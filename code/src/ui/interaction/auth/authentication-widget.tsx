"use client";

import Link from 'next/link';
import styles from './authentication-widget.module.css';


interface AuthenticationWidgetProps {
    user: string;
}
/**
 * This component renders a widget that displays the user and a log out button.
 *
 * @param {string} user The user name to display.
 */
export default function AuthenticationWidget(props: Readonly<AuthenticationWidgetProps>) {
    return (
        <div id="keycloakSession" className={styles.keycloakSession}>
            <span id="userName" className={styles.dropbtn}>{props.user}</span>
            <div className={styles.dropdownContent}>
                <Link prefetch={false} href="/logout">Log Out</Link>
            </div>
        </div>
    );
};
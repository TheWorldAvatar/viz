"use client";

import Link from 'next/link';
import styles from './keycloak-user-button.module.css';
import { useUserDisplayName } from 'hooks/auth/useUserDisplayName';
import PopoverActionButton from '../action/popover/popover-button';


/**
 * This component renders a widget that displays the user and a log out button.
*
*/
export default function KeycloakUserButton() {
    // const userDisplayName = useUserDisplayName();
        const userDisplayName: string = "Plamen Dochev";
        const userInitial: string = userDisplayName.charAt(0).toUpperCase();

 

    return (

        <PopoverActionButton
            label={userInitial}
            tooltipText="User"
            tooltipPosition="bottom"
            isHoverableDisabled={true}
            isTransparent={true}
            styling={{ text: styles.text}}
            placement="bottom-end"
            className={styles.userMenuButton}
            >
                <div className={styles.userMenuContainer}>
                            <span>{userDisplayName}</span>
                   <div className={styles.seperationLine}></div>
                      <Link prefetch={false} href="/logout">Log Out</Link>
                </div>
             </PopoverActionButton>
    );
};
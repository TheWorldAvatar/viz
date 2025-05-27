"use client";

import Link from "next/link";
import styles from "./keycloak-user-button.module.css";
import { useUserDisplayName } from "hooks/auth/useUserDisplayName";
import PopoverActionButton from "../action/popover/popover-button";

/**
 * This component renders a widget that displays the user and a log out button.
 *
 */
export default function KeycloakUserButton() {
  const userDisplayName = useUserDisplayName();

  return (
    <PopoverActionButton
      icon={"person"}
      isHoverableDisabled={true}
      isTransparent={true}
      styling={{ text: styles.text }}
      placement="bottom-end"
      className={styles.userMenuButton}
    >
      <div className={styles.userMenuContainer}>
        <div className={styles.userButtons}>
          <span>{userDisplayName}</span>
        </div>
        <div className={styles.userButtons}>
          <Link prefetch={false} href="/logout">
            Log Out
          </Link>
        </div>
      </div>
    </PopoverActionButton>
  );
}

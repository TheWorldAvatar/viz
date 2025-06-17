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
      styling={{ text: styles.text }}
      isHoverableDisabled={true}
      isTransparent={true}
      placement="bottom"
      className={styles.userMenuButton}
    >
      <div className="flex flex-col justify-center items-center p-1">
        <div className="p-2">
          <span className="text-md font-bold">{userDisplayName}</span>
        </div>
        <hr className="w-full border-t border-border my-1" />
        <div className="p-2">
          <Link
            className="py-2 px-8 rounded-md transition-colors duration-200 hover:bg-gray-300"
            prefetch={false}
            href="/logout"
          >
            Log Out
          </Link>
        </div>
      </div>
    </PopoverActionButton>
  );
}

"use client";

import Link from "next/link";
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
      leftIcon="person"
      size="icon"
      variant="primary"
      placement="bottom"
      className="w-12 h-12 !rounded-full mr-6 transition-all duration-200 hover:scale-110 hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-muted"
    >
      <div className="flex flex-col justify-center items-center p-1">
        <div className="p-2">
          <span className="text-md font-bold">{userDisplayName}</span>
        </div>
        <hr className="w-full border-t border-border my-1" />
        <div className="p-2">
          <Link
            className="py-2 px-8 rounded-md transition-colors duration-200 hover:bg-ring"
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

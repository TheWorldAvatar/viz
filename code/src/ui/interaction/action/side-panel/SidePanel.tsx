import React, { useEffect, useRef, useCallback, useState } from "react";

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function SidePanel({
  isOpen,
  onClose,
  children,
}: SidePanelProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Close side panel on Escape key press
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  // Close side panel when clicking outside
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        sheetRef.current &&
        !sheetRef.current.contains(event.target as Node)
      ) {
        // Cast event.target to Node
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    let openTimer: NodeJS.Timeout;
    let closeTimer: NodeJS.Timeout;

    if (isOpen) {
      setIsVisible(true);
      // Small delay to ensure the component is mounted before starting animation
      openTimer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      setIsAnimating(false);
      // Delay hiding the component to allow animation to complete
      closeTimer = setTimeout(() => {
        setIsVisible(false);
      }, 300); // Match the transition duration
    }

    return () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleKeyDown, handleClickOutside]);

  if (!isVisible) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      className={`fixed inset-0 z-50 flex items-end md:items-center md:justify-end bg-black/50 transition-opacity duration-300 ease-in-out ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Side panel container */}
      <div
        ref={sheetRef}
        className={`
          relative bg-gray-100 shadow-xl
          w-full md:w-96 lg:w-1/3 xl:w-1/4
          h-auto max-h-screen md:h-full
          rounded-t-lg md:rounded-t-none
          md:border-l border-gray-200
          transform transition-all duration-300 ease-out
          ${
            isAnimating
              ? "translate-y-0  translate-x-0"
              : "translate-y-full md:translate-y-0 translate-x-0 md:translate-x-full"
          }
        `}
        tabIndex={-1}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 rounded-full p-2"
          aria-label="Close sheet"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Side panel content */}
        <div className="py-4 overflow-y-auto max-h-[calc(100vh-64px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

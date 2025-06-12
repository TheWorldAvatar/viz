import React from "react";
import { ConfigProvider } from "antd";

interface AntDesignConfigProps {
  children: React.ReactNode;
}

const AntDesignConfig: React.FC<AntDesignConfigProps> = ({ children }) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "var(--text-color-links)",
          colorLink: "var(--text-color-links)",
          colorLinkHover: "var(--text-color-links-hover)",
          fontFamily: "var(--font-family-primary)",
          borderRadius: 4,
        },
        components: {
          Table: {
            padding: 8,
            paddingLG: 12,
            cellPaddingBlock: 8,
            borderRadius: 20,
            colorBorder: "var(--border)",
            lineWidth: 0.5, // Border width
            lineType: "solid", // Border style
            borderColor: "var(--border)",
            colorBgContainer: "var(--muted)",
            headerBg: "#e5e7eb",
            headerColor: "var(--foreground)",
            rowHoverBg: "#d1d5dc",
            bodySortBg: "transparent",
            headerSortActiveBg: "#d1d5dc",
            headerSortHoverBg: "#d1d5dc",
            // Filter-related customization
            filterDropdownBg: "var(--background)",
            filterDropdownMenuBg: "var(--background)",
            headerFilterHoverBg: "rgba(221, 233, 255, 0.85)",
          },
          Pagination: {
            colorText: "var(--foreground)",
            colorPrimary: "var(--foreground)",
            colorBgContainer: "var(--muted)",
            itemInputBg: "var(--background)",
          },
          Dropdown: {
            controlItemBgHover: "var(--background-tertiary)",
            controlItemBgActive: "var(--background-tertiary)",
            controlItemBgActiveHover: "var(--background-secondary)",
          },
          Select: {
            colorText: "var(--foreground)",
            optionSelectedBg: "var(--background)",
            selectorBg: "#e5e7eb",
            optionActiveBg: "#d1d5dc",
            colorBgElevated: "#e5e7eb",
            colorBorder: "var(--border)",
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};

export default AntDesignConfig;

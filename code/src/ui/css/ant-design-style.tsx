import React from 'react';
import { ConfigProvider } from 'antd';

interface AntDesignConfigProps {
    children: React.ReactNode;
}

const AntDesignConfig: React.FC<AntDesignConfigProps> = ({ children }) => {
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: 'var(--text-color-links)',
                    colorLink: 'var(--text-color-links)',
                    colorLinkHover: 'var(--text-color-links-hover)',
                    fontFamily: 'var(--font-family-primary)',
                    borderRadius: 4,
                },
                components: {
                    Table: {
                        padding: 8,
                        paddingLG: 12,
                        cellPaddingBlock: 8,
                        borderRadius: 20,
                        borderColor: 'var(--border-primary)',
                        colorBgContainer: 'var(--background-primary)',
                        headerBg: 'var(--text-color-links)',
                        headerColor: '#dde9ff',
                        rowHoverBg: '#f9f9f9',
                        bodySortBg: "transparent",
                        headerSortActiveBg: "#105564",
                        headerSortHoverBg: "#105564",
                    },
                    Pagination: {
                        colorText: 'var(--text-color-primary)',
                        colorPrimary: 'var(--text-color-links)',
                        colorBgContainer: 'var(--background-primary)',
                        itemInputBg: 'var(--background-secondary)',
                    },
                    Select: {
                        colorText: 'var(--text-color-primary)',
                        optionSelectedBg: 'var(--button-color-primary-active)',
                        selectorBg: 'var(--background-tertiary)',
                        colorBgElevated: 'var(--background-tertiary)',
                    },
                },
            }}
        >
            {children}
        </ConfigProvider>
    );
};

export default AntDesignConfig;
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
                    colorPrimary: '#146a7d',
                    colorLink: '#146a7d',
                    colorLinkHover: '#20aac9',
                    fontFamily: 'var(--font-family-primary)',
                    fontSize: 14,
                    borderRadius: 4,
                },
                components: {
                    Table: {
                        borderRadius: 20,
                        headerBg: '#146a7d',
                        headerColor: '#f9f9f9',
                        rowHoverBg: 'var(--background-secondary)',
                        colorBgContainer: 'var(--background-primary)',
                        borderColor: 'var(--border-primary)',
                        fontSize: 'var(--font-size-secondary-text)',
                        headerFontSize: 'var(--font-size-primary-text)',
                        padding: 8,
                        paddingLG: 12,
                        cellPaddingBlock: 8,
                    },
                    Pagination: {
                        colorText: 'var(--text-color-primary)',
                        colorPrimary: '#146a7d',
                        colorBgContainer: 'var(--background-primary)',
                    },
                },
            }}
        >
            {children}
        </ConfigProvider>
    );
};

export default AntDesignConfig;
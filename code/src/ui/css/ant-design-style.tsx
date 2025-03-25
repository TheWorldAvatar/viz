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
                },
                components: {
                    Table: {
                        borderRadius: 20,
                        headerBg: '#146a7d',
                        headerColor: '#f9f9f9',
                    },
                },
            }}
        >
            {children}
        </ConfigProvider>
    );
};

export default AntDesignConfig;
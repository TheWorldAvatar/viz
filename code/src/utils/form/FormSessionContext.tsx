"use client"

import React, { createContext, useState } from 'react';

export interface FormSessionState {
    id: string;
    accountType: string;
    fieldIdNameMapping: Record<string, string>;
    setFieldIdNameMapping: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const FormSessionContext = createContext<FormSessionState>(null);

export const FormSessionContextProvider = ({
    entityType,
    accountType,
    children,
}: {
    entityType: string;
    accountType?: string;
    children: React.ReactNode;
}) => {
    const formSessionId: string = `_form_${entityType}`;
    const [fieldIdNameMapping, setFieldIdNameMapping] = useState<Record<string, string>>({});

    return (
        <FormSessionContext.Provider value={{ id: formSessionId, accountType, fieldIdNameMapping, setFieldIdNameMapping }}>
            {children}
        </FormSessionContext.Provider>
    );
}

"use client"

import React, { createContext, useState } from 'react';

export interface FormSessionState {
    id: string;
    fieldIdNameMapping: Record<string, string>;
    setFieldIdNameMapping: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const FormSessionContext = createContext<FormSessionState>(null);

export const FormSessionContextProvider = ({
    entityType,
    children,
}: {
    entityType: string;
    children: React.ReactNode;
}) => {
    const formSessionId: string = `_form_${entityType}`;
    const [fieldIdNameMapping, setFieldIdNameMapping] = useState<Record<string, string>>({});

    return (
        <FormSessionContext.Provider value={{ id: formSessionId, fieldIdNameMapping, setFieldIdNameMapping }}>
            {children}
        </FormSessionContext.Provider>
    );
}

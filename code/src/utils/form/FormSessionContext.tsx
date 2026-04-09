"use client"

import React, { createContext, useState } from 'react';
import { FormType } from 'types/form';

export interface FormSessionState {
    id: string;
    accountType: string;
    formType: FormType;
    fieldIdNameMapping: Record<string, string>;
    setFieldIdNameMapping: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const FormSessionContext = createContext<FormSessionState>(null);

export const FormSessionContextProvider = ({
    formType,
    entityType,
    accountType,
    children,
}: {
    formType: FormType;
    entityType: string;
    accountType?: string;
    children: React.ReactNode;
}) => {
    const formSessionId: string = `_form_${entityType}`;
    const [fieldIdNameMapping, setFieldIdNameMapping] = useState<Record<string, string>>({});

    return (
        <FormSessionContext.Provider value={{ id: formSessionId, accountType, formType, fieldIdNameMapping, setFieldIdNameMapping }}>
            {children}
        </FormSessionContext.Provider>
    );
}

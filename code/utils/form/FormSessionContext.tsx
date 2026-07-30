"use client"

import React, { createContext, useState } from 'react';
import { FormType } from '@/types/form';

export interface FormSessionState {
    id: string;
    accountType: string;
    isContractForm: boolean;
    formType: FormType;
    fieldIdNameMapping: Record<string, string>;
    setFieldIdNameMapping: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    genFormSessionId: (_type: string) => string;
}

export const FormSessionContext = createContext<FormSessionState>(null);

export const FormSessionContextProvider = ({
    formType,
    entityType,
    accountType,
    isContractForm,
    children,
}: {
    formType: FormType;
    entityType: string;
    accountType?: string;
    isContractForm?: boolean;
    children: React.ReactNode;
}) => {
    const [fieldIdNameMapping, setFieldIdNameMapping] = useState<Record<string, string>>({});

    const genFormSessionId = (field: string): string => {
        return `_form_${field}`;
    };
    return (
        <FormSessionContext.Provider value={{
            id: genFormSessionId(entityType),
            accountType, isContractForm, formType, fieldIdNameMapping,
            setFieldIdNameMapping, genFormSessionId
        }}>
            {children}
        </FormSessionContext.Provider>
    );
}

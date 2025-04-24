"use client"
import React, { createContext } from 'react';
import { Dictionary } from 'types/dictionary';

export const DictionaryContext = createContext<Dictionary | null>(null);

export const DictionaryProvider = ({
    children,
    dictionary,
}: {
    children: React.ReactNode;
    dictionary: Dictionary;
}) => {
    return (
        <DictionaryContext.Provider value={dictionary}>
            {children}
        </DictionaryContext.Provider>
    );
};
"use client"
import React, { createContext, useContext } from 'react';
import { Dictionary } from 'types/dictionary';

const DictionaryContext = createContext<Dictionary | null>(null);

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

export const useDictionary = () => {
    const context = useContext(DictionaryContext);
    if (!context) {
        throw new Error('useDictionary must be used within a DictionaryProvider');
    }
    return context;
};

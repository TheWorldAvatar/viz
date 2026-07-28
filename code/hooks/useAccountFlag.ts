'use client';

import { useEffect, useState } from 'react';
import { AgentResponseBody, InternalApiIdentifierMap } from '@/types/backend-agent';
import { LifecycleStageMap } from '@/types/form';
import { SelectOptionType } from '@/ui/interaction/dropdown/simple-selector';
import { makeInternalRegistryAPIwithParams, queryInternalApi } from '@/utils/internal-api-services';


/**
 * Retrieves the account with the given name. The account filter API reports
 * a flagged account as a disabled option.
 *
 * @param {string} accountType The account type.
 * @param {string} accountName The account's display name.
 */
async function resolveAccount(accountType: string, accountName: string): Promise<SelectOptionType> {
    try {
        const response: AgentResponseBody = await queryInternalApi(makeInternalRegistryAPIwithParams(
            InternalApiIdentifierMap.FILTER,
            LifecycleStageMap.ACCOUNT,
            accountType,
            accountName,
        ));
        const options: SelectOptionType[] = response.data?.items as SelectOptionType[] ?? [];
        return options.find(option => option.label?.trim() === accountName?.trim());
    } catch (error) {
        console.error("Error retrieving the account", error);
    }
}

/**
 * A custom hook to retrieve the account with the given name. Its IRI is available as the option's
 * value, while a flagged account is reported as a disabled option.
 *
 * @param {string} accountType The account type.
 * @param {string} accountName The account's display name.
 * @returns {SelectOptionType} The account option or undefined until it has been retrieved.
 */
export default function useAccountFlag(accountType: string, accountName: string): SelectOptionType {
    const [account, setAccount] = useState<SelectOptionType>(undefined);

    useEffect(() => {
        if (!accountType || !accountName) {
            return;
        }
        let isActive: boolean = true;
        resolveAccount(accountType, accountName).then((result: SelectOptionType) => {
            if (isActive) {
                setAccount(result);
            }
        });
        // Prevent updating the state of a row that is no longer rendered
        return () => { isActive = false; };
    }, [accountType, accountName]);

    return account;
}

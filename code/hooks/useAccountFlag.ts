'use client';

import { useEffect, useState } from 'react';
import { AgentResponseBody, InternalApiIdentifierMap } from '@/types/backend-agent';
import { LifecycleStageMap } from '@/types/form';
import { SelectOptionType } from '@/ui/interaction/dropdown/simple-selector';
import { makeInternalRegistryAPIwithParams, queryInternalApi } from '@/utils/internal-api-services';

interface AccountDescriptor {
    accountIri: string | undefined;
    // Indicates if the account is flagged, and undefined until it has been retrieved.
    isFlagged: boolean | undefined;
}

/**
 * Retrieves the IRI and flag of the account with the given name. The account filter API reports
 * a flagged account as a disabled option.
 *
 * @param {string} accountType The account type.
 * @param {string} accountName The account's display name.
 */
async function resolveAccount(accountType: string, accountName: string): Promise<AccountDescriptor> {
    try {
        const response: AgentResponseBody = await queryInternalApi(makeInternalRegistryAPIwithParams(
            InternalApiIdentifierMap.FILTER,
            LifecycleStageMap.ACCOUNT,
            accountType,
            accountName,
        ));
        const options: SelectOptionType[] = response.data?.items as SelectOptionType[] ?? [];
        const match: SelectOptionType = options.find(option => option.label?.trim() === accountName?.trim());
        const account: AccountDescriptor = match
            ? { accountIri: match.value, isFlagged: !!match.disabled }
            : { accountIri: undefined, isFlagged: false };
        return account;
    } catch (error) {
        console.error("Error retrieving the account", error);
        return { accountIri: undefined, isFlagged: false };
    }
}

/**
 * A custom hook to retrieve the flag of the account with the given name.
 *
 * @param {string} accountType The account type.
 * @param {string} accountName The account's display name.
 * @returns {AccountDescriptor} The account IRI and flag.
 */
export default function useAccountFlag(accountType: string, accountName: string): AccountDescriptor {
    const [account, setAccount] = useState<AccountDescriptor>({ accountIri: undefined, isFlagged: undefined });

    useEffect(() => {
        if (!accountType || !accountName) {
            return;
        }
        let isActive: boolean = true;
        resolveAccount(accountType, accountName).then((result: AccountDescriptor) => {
            if (isActive) {
                setAccount(result);
            }
        });
        // Prevent updating the state of a row that is no longer rendered
        return () => { isActive = false; };
    }, [accountType, accountName]);

    return account;
}

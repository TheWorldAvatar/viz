"use client";
import { useEffect, useState } from 'react';
import { ContractDirectory } from 'types/backend-agent';
import { queryRegistryAttachmentAPI } from 'utils/internal-api-services';

/**
 * A custom hook to check if the attachment URL exists for the given contract.
 * 
 * @param {string} contract - The contract ID.
 */
export function useReadAttachments(
    contract: string,
): ContractDirectory {
    const [contractDirectory, setContractDirectory] = useState<ContractDirectory>(null);

    useEffect(() => {
        const readAttachments = async (): Promise<void> => {
            const response: ContractDirectory = await queryRegistryAttachmentAPI(contract);
            if (response != null) {
                setContractDirectory(response);
            }
        };
        if (contract && contract != "") {
            readAttachments();
        }
    }, [contract]);

    return contractDirectory;
};

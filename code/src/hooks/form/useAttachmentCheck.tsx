"use client";
import { useEffect, useState } from 'react';
import { UrlExistsResponse } from 'types/backend-agent';
import { registryAttachmentUrlExists } from 'utils/server-actions';

export interface UrlAttachmentState {
    attachmentUrl: string;
    hasAttachment: boolean;
}

/**
 * A custom hook to check if the attachment URL exists for the given contract.
 * 
 * @param {string} contract - The contract ID.
 */
export function useAttachmentCheck(
    contract: string,
): UrlAttachmentState {
    const [attachmentUrl, setAttachmentUrl] = useState<string>("");
    const [hasAttachment, setHasAttachment] = useState<boolean>(false);

    useEffect(() => {
        const checkUrlExists = async (): Promise<void> => {
            const response: UrlExistsResponse = await registryAttachmentUrlExists(contract);
            if (response != null) {
                setHasAttachment(response.exists);
                setAttachmentUrl(response.url);
            }
        };
        if (contract && contract != "") {
            checkUrlExists();
        }
    }, [contract]);

    return {
        attachmentUrl,
        hasAttachment,
    };
};

"use client";
import { useEffect, useState } from 'react';
import { buildUrl } from 'utils/client-utils';
import { urlExists } from 'utils/server-actions';

export interface UrlAttachmentState {
    attachmentUrl: string;
    hasAttachment: boolean;
}

/**
 * A custom hook to check if the attachment URL exists for the given contract.
 * 
 * @param {string} domainUrl - The domain of the attachment to be prefixed to the id.
 * @param {string} contract - The contract ID.
 */
export function useAttachmentCheck(
    domainUrl: string,
    contract: string,
): UrlAttachmentState {
    const [attachmentUrl, setAttachmentUrl] = useState<string>("");
    const [hasAttachment, setHasAttachment] = useState<boolean>(false);

    useEffect(() => {
        const checkUrlExists = async (): Promise<void> => {
            const url: string = buildUrl(domainUrl, contract, "");
            const hasUrl: boolean = await urlExists(url);
            setHasAttachment(hasUrl);
            setAttachmentUrl(url);
        };
        if (domainUrl && contract && contract != "") {
            checkUrlExists();
        }
    }, [contract]);

    return {
        attachmentUrl,
        hasAttachment,
    };
};

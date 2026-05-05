"use client";

import { useDictionary } from "hooks/useDictionary";
import { ContractDirectory } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import ExternalRedirectButton from "ui/interaction/action/redirect/external-redirect-button";

interface FileMenuProps {
    directory: ContractDirectory;
}

/**
 * This component renders a file menu component.
 *
 * @param {ContractDirectory} directory The directory contents
 */
export default function FileMenu(props: Readonly<FileMenuProps>) {
    const dict: Dictionary = useDictionary();
    return (
        <section role="dialog">
            <h3 className="text-base font-semibold px-4 py-1 my-1 border-b border-border">{dict.title.files}</h3>
            <ul>
                {
                    props.directory.files.map(file => {
                        return <li key={file.name} >
                            <ExternalRedirectButton
                                label={file.name}
                                variant="link"
                                size="md"
                                url={`${props.directory.url}/${file.name}`}
                            />
                        </li>
                    })
                }
            </ul>
        </section>
    )
}

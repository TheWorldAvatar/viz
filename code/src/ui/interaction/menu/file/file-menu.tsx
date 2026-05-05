"use client";

import { useDictionary } from "hooks/useDictionary";
import { Assets } from "io/config/assets";
import { ContractDirectory } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import IconComponent from "ui/graphic/icon/icon";
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
                        return <li key={file.name} className="flex w-full py-1.5">
                            <IconComponent
                                icon={getFileIcon(file.ext)}
                                classes="max-h-8 w-auto"
                            />
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

function getFileIcon(ext: string): string {
    switch (ext) {
        case ".doc":
        case ".docx":
            return Assets.FILE_DOC;
        case ".htm":
        case ".html":
            return Assets.FILE_HTML;
        case ".jpg":
            return Assets.FILE_JPG;
        case ".pdf":
            return Assets.FILE_PDF;
        case ".png":
            return Assets.FILE_PNG;
        case ".txt":
            return Assets.FILE_TXT;
        case ".xls":
        case ".xlsx":
            return Assets.FILE_XLS;
        default:
            return Assets.FILE_DEFAULT;

    }
}

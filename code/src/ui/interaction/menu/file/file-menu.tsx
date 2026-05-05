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
            <span className="flex justify-between items-center text-base font-semibold pl-4 pr-6 py-1 my-1 border-b border-border">
                <h3>
                    {dict.title.file}
                </h3>
                <h3>
                    {dict.title.size}
                </h3>
            </span>
            <ul className="max-h-[25vh] md:max-h-[75vh] overflow-y-auto">
                {
                    props.directory.files.map(file => {
                        return <li key={file.name} className="flex justify-between items-center w-full py-1.5 px-2">
                            <IconComponent
                                icon={getFileIcon(file.ext)}
                                classes="h-9 md:h-8 w-8"
                            />
                            <ExternalRedirectButton
                                label={file.name}
                                variant="link"
                                size="md"
                                className="block! text-left! truncate! max-w-50 "
                                url={`${props.directory.url}/${file.name}`}
                            />
                            <p>{file.size}</p>
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

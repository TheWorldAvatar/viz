import { useReadAttachments } from "@/hooks/form/useReadAttachments";
import { useDictionary } from "@/hooks/useDictionary";
import { ContractDirectory } from "@/types/backend-agent";
import { Dictionary } from "@/types/dictionary";
import PopoverActionButton from "@/ui/interaction/action/popover/popover-button";
import FileMenu from "@/ui/interaction/menu/file/file-menu";
import React from "react";

interface ViewAttachmentButtonProps {
    id: string;
    hideLabel?: boolean;
}

/**
 * This component renders a view attachment button.
 *
 * @param {string} id Task id.
 * @param {boolean} hideLabel Hides the text label for an icon only button.
 */
export default function ViewAttachmentButton(
    props: Readonly<ViewAttachmentButtonProps>
) {
    const [isAttachmentViewerOpen, setIsAttachmentViewerOpen] = React.useState<boolean>(false);
    const dict: Dictionary = useDictionary();
    const contractDirectory: ContractDirectory = useReadAttachments(props.id)

    if (contractDirectory?.files.length > 0) {
        return <PopoverActionButton
            placement="bottom-end"
            leftIcon="attach_file"
            variant="ghost"
            size={!!props.hideLabel ? "icon" : "md"}
            iconSize="medium"
            className="w-full justify-start"
            label={!!props.hideLabel ? "" : dict.action.viewAttachment}
            isOpen={isAttachmentViewerOpen}
            setIsOpen={setIsAttachmentViewerOpen}
            aria-label={`${dict.action.viewAttachment}, ${props.id}`}
        >
            <FileMenu directory={contractDirectory} />
        </PopoverActionButton>
    }

}
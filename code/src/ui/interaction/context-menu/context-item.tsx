"use client";

import Icon from "@mui/material/Icon";
import { ContextItemType } from "types/settings";
import Tooltip from "ui/interaction/tooltip/tooltip";

export interface ContextItemDefinition {
    name: string,
    description?: string,
    id: ContextItemType,
    toggled?: boolean,
    callback?: (_id: string) => void,
    className?: string
}

export default function ContextItem(props: Readonly<ContextItemDefinition>) {
    // Update state and fire callback
    const handleClick = () => {
        if (props.callback != null) props.callback(props.id);
    };

    return (
        <Tooltip text={props.description} placement="bottom-start">
            <div
                className={`w-full h-fit py-1 px-1 flex items-center gap-3 cursor-pointer hover:bg-ring ${props.className || ""}`}
                onClick={handleClick}
            >
                <span className="flex-1 text-sm">{props.name}</span>
                {props.toggled != null && (
                    <Icon className="material-symbols-outlined shrink-0">
                        {props.toggled ? "check_box" : "check_box_outline_blank"}
                    </Icon>
                )}
            </div>
        </Tooltip>
    );
}
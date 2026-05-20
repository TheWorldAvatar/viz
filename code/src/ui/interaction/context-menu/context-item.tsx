"use client";

import Icon from "@mui/material/Icon";
import { useScreenType } from "hooks/useScreenType";
import { ContextItemType, ScreenType, ScreenTypeMap } from "types/settings";
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
    const screenType: ScreenType = useScreenType();
    const isDesktop: boolean = screenType === ScreenTypeMap.DESKTOP;

    // Update state and fire callback
    const handleClick = () => {
        if (props.callback != null) props.callback(props.id);
    };

    const item = (
        <div
            className={`w-full h-9 px-1 flex justify-center items-center cursor-pointer align-middle hover:bg-ring ${props.className || ""}`}
            onClick={handleClick}
        >
            <span className="flex-1 text-sm">{props.name}</span>
            {props.toggled != null && (
                <Icon className="w-auto h-full  flex text-center justify-center items-center material-symbols-outlined">
                    {props.toggled ? "check_box" : "check_box_outline_blank"}
                </Icon>
            )}
        </div>
    );

    if (!isDesktop) {
        return item;
    }

    return (
        <Tooltip text={props.description} placement="bottom-start">
            {item}
        </Tooltip>
    );
}
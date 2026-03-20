"use client";

import Icon from '@mui/material/Icon';
import Tooltip from 'ui/interaction/tooltip/tooltip';

export interface ContextItemDefinition {
    name: string,
    description?: string,
    id: string
    toggled?: boolean,
    callback?: (id: string) => void
}

export default function ContextItem(props: Readonly<ContextItemDefinition>) {
    // Update state and fire callback
    const handleClick = () => {
        if (props.callback != null) props.callback(props.id);
    }

    // Return item for rendering
    return (
        <Tooltip text={props.description} placement="bottom-start">
            <div className="w-full h-9 px-1 flex justify-center items-center cursor-pointer align-middle hover:bg-ring" onClick={handleClick}>
                <span className="flex-1 text-sm">{props.name}</span>
                {props.toggled != null &&
                    <Icon className="w-auto h-full  flex text-center justify-center items-center material-symbols-outlined">
                        {props.toggled ? "check_box" : "check_box_outline_blank"}
                    </Icon>
                }
            </div>
        </Tooltip>
    );
}
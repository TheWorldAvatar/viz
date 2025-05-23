"use client";

import styles from './context-item.module.css';

import Icon from '@mui/material/Icon';
import Tooltip from 'ui/interaction/tooltip/tooltip';

export interface ContextItemDefinition {
    name: string,
    description?: string,
    id: string
    toggled?: boolean,
    callback?: (_id: string) => void
}

/**
 * 
 */
export default function ContextItem(props: Readonly<ContextItemDefinition>) {
    // CSS class
    const iconClass = ["material-symbols-outlined", styles.icon].join(" ");

    // Update state and fire callback
    const handleClick = () => {
        if (props.callback != null) props.callback(props.id);
    }

    // Return item for rendering
    return (
        <Tooltip text={props.description} placement="bottom-start">
            <div className={styles.menuItem} onClick={handleClick}>
                <span className={styles.text}>{props.name}</span>
                {props.toggled != null &&
                    <Icon className={iconClass}>
                        {props.toggled ? "check_box" : "check_box_outline_blank"}
                    </Icon>
                }
            </div>
        </Tooltip>
    );
}
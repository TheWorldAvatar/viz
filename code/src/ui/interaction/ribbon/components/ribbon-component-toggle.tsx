"use client";

import styles from './ribbon-component.module.css';

import React from 'react';
import Tooltip from 'ui/interaction/tooltip/tooltip';
import { useDispatch, useSelector } from 'react-redux';
import { getOption, setOption } from 'state/ribbon-component-slice';
import IconComponent from 'ui/graphic/icon/icon';

interface RibbonComponentToggleProps {
    id: string,
    icon?: string,
    text?: string,
    tooltip: string,
    initialState: boolean,
    children?: React.ReactNode,
    action: (_state: boolean) => void
}

export default function RibbonComponentToggle(props: Readonly<RibbonComponentToggleProps>) {
    const toggled = useSelector(getOption(props.id));
    const dispatch = useDispatch();

    const classNames = [styles.ribbonComponent];
    if (props.icon && toggled?.selection != null && toggled.selection === true) {
        classNames.push(styles.toggled);
    } else if (toggled?.selection == null && props.initialState) {
        classNames.push(styles.toggled);
    }

    const handleClick = () => {
        const selected = (toggled?.selection == null) ? !props.initialState : !toggled.selection;
        dispatch(setOption({
            id: props.id,
            selection: selected
        }));
        props.action(selected);
    }

    return (
        <Tooltip text={props.tooltip} placement="bottom-start">
            <div className={classNames.join(" ")} onClick={handleClick}>
                <div>
                    <div className={styles.ribbonComponentInner}>
                        {props.icon &&
                            <div className={styles.ribbonComponentIcon}>
                                <IconComponent icon={props.icon} />
                            </div>
                        }
                        {props.children}
                        {props.text &&
                            <div className={styles.ribbonComponentText}>
                                {props.text}
                            </div>}
                    </div>
                </div>
            </div>
        </Tooltip>
    );
}
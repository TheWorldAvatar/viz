import styles from './tooltip.module.css';

import { FloatingPortal, Placement } from "@floating-ui/react";
import { useTooltip } from 'hooks/float/useTooltip';

export interface TooltipProps {
    text: string;
    children: React.ReactNode;
    placement?: Placement;
}

/**
 * A floating component to render labels upon hovering or focus.
 * 
 * @param {string} text Tooltip text content.
 * @param {Placement} placement Position of tooltip.
 */
export default function Tooltip(props: Readonly<TooltipProps>) {
    const tooltip = useTooltip(props.placement);

    return (
        <>
            <div
                ref={tooltip.refs.setReference}
                {...tooltip.getReferenceProps()}
            >
                {props.children}
            </div>
            {// Render tooltip only if the text is provided and the tooltip is open
                props.text && tooltip.isOpen && <FloatingPortal>
                    <div
                        ref={tooltip.refs.setFloating}
                        style={{
                            ...tooltip.floatingStyles,
                            zIndex: 999999 // Highest z-index so it is above modal content
                        }}
                        className={styles.tooltip}
                        {...tooltip.getFloatingProps()}
                    >
                        {props.text}
                    </div>
                </FloatingPortal >}
        </>
    );
};

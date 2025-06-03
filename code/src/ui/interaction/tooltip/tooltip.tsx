import styles from "./tooltip.module.css";

import {
  FloatingPortal,
  Placement,
  useTransitionStyles,
} from "@floating-ui/react";
import { useTooltip } from "hooks/float/useTooltip";

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
  const transition = useTransitionStyles(tooltip.context, {
    duration: 200,
    initial: {
      opacity: 0,
      transform: "scale(0.9)",
    },
  });
  return (
    <>
      <div ref={tooltip.refs.setReference} {...tooltip.getReferenceProps()}>
        {props.children}
      </div>
      {
        // Render tooltip only if the text is provided and the tooltip is open
        props.text && tooltip.isOpen && transition.isMounted && (
          <FloatingPortal>
            <div
              ref={tooltip.refs.setFloating}
              style={{
                ...tooltip.floatingStyles,
                zIndex: 999999, // Highest z-index so it is above modal content
              }}
              {...tooltip.getFloatingProps()}
            >
              <div
                style={{
                  ...transition.styles,
                }}
                className="box-border p-2 w-max max-w-[calc(100vw - 1rem)] bg-primary text-sm text-foreground rounded-md shadow-sm"
              >
                {props.text}
              </div>
            </div>
          </FloatingPortal>
        )
      }
    </>
  );
}

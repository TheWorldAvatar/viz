import styles from './modal.module.css';

import { FloatingFocusManager, FloatingOverlay, FloatingPortal, useTransitionStyles } from '@floating-ui/react';
import React from 'react';

import { useDialog } from 'hooks/float/useDialog';
import { useDictionary } from 'hooks/useDictionary';
import { Dictionary } from 'types/dictionary';
import ClickActionButton from 'ui/interaction/action/click/click-button';
import { useRouter } from 'next/navigation';

interface ModalProps {
  isOpen: boolean,
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
  returnPrevPage?: boolean,
  styles?: string[],
  children: React.ReactNode;
}

/**
 * A reusable component for defining modals.
 * 
 * @param {boolean} isOpen Indicates if modal should be initially open.
 * @param  setIsOpen Sets the isOpen parameter.
 * @param {boolean} returnPrevPage Indicates if the modal should return to the previous page upon closing.
 * @param {string[]} styles Optional styling for the modal.
 */
export default function Modal(props: Readonly<ModalProps>) {
  const dict: Dictionary = useDictionary();
  const router = useRouter();
  const dialog = useDialog(props.isOpen, props.setIsOpen);
  const transition = useTransitionStyles(dialog.context, {
    duration: 400,
    initial: {
      opacity: 0,
      transform: "translateY(10vh)",
    },
  });
  return (
    <>
      {dialog.open && <FloatingPortal>
        <FloatingOverlay className={styles.overlay} lockScroll>
          <FloatingFocusManager context={dialog.context}>
            <div
              ref={dialog.refs.setFloating}
              style={{
                ...dialog.floatingStyles,
                zIndex: 999998 // Second highest z-index so it hides other content but is hidden before tooltips
              }}
              className={styles["content-container"]}
              {...dialog.getFloatingProps()}
            >
              <div
                style={{
                  ...transition.styles,
                }}
                className={`${styles.modal} ${props.styles?.join(" ")}`}
              >
                <ClickActionButton
                  icon={"close"}
                  className={styles.close}
                  tooltipText={dict.action.close}
                  tooltipPosition="top-end"
                  styling={{ text: styles["close-text"] }}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                    event.preventDefault();
                    props.setIsOpen(false);
                    if (props.returnPrevPage) {
                      router.back();
                    }
                  }}
                />
                {props.children}
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingOverlay>
      </FloatingPortal >
      }
    </>
  );
}
import styles from './modal.module.css';

import { FloatingFocusManager, FloatingOverlay, FloatingPortal } from '@floating-ui/react';
import React from 'react';

import { useDialog } from 'hooks/useDialog';
import { useDictionary } from 'hooks/useDictionary';
import { Dictionary } from 'types/dictionary';
import ClickActionButton from 'ui/interaction/action/click/click-button';

interface ModalProps {
  isOpen: boolean,
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
  styles?: string[],
  children: React.ReactNode;
}

/**
 * A reusable component for defining modals.
 * 
 * @param {boolean} isOpen Indicates if modal should be initially open.
 * @param  setIsOpen Sets the isOpen parameter.
 */
export default function Modal(props: Readonly<ModalProps>) {
  const dialog = useDialog(props.isOpen, props.setIsOpen);
  const dict: Dictionary = useDictionary();

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
              className={`${styles.modal} ${props.styles?.join(" ")}`}
              {...dialog.getFloatingProps()}
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
                }}
              />
              {props.children}
            </div>
          </FloatingFocusManager>
        </FloatingOverlay>
      </FloatingPortal >
      }
    </>
  );
}
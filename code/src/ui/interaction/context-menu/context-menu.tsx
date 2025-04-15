"use client";

import styles from './context-menu.module.css';

import { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { ReduxState } from 'app/store';
import { addItem, removeItem, toggleItem } from 'state/context-menu-slice';
import ContextItem, { ContextItemDefinition } from './context-item';

// Incoming properties type
interface ContextMenuProps {
  x: number,
  y: number,
  showContextMenu: boolean,
  items?: ContextItemDefinition[],
  addItem?: (_item: ContextItemDefinition) => void,
  toggleItem?: (_name: string) => void
}

// Time the RMB was pressed down
let rmbDownTime: number;

/**
 * Represents a component for a custom right-click menu, containing instances of the
 * ContextItem class to representing individual items. 
 * 
 * The definition (and current toggled state) of each ContextItem is stored within
 * the global Redux state so it that it persists across the application lifecycle.
 */
function ContextMenu(props: Readonly<ContextMenuProps>) {
  const [xPos, setXPos] = useState<string>(`${props.x}px`);
  const [yPos, setYPos] = useState<string>(`${props.y}px`);
  const [showMenu, setShowMenu] = useState<boolean>(props.showContextMenu);

  // On left-click
  const handleLeftClick = () => {
    if (showMenu) setShowMenu(false);
  }

  // On right-click
  const handleRightClick = (e: MouseEvent) => {
    e.preventDefault();
    setXPos(`${e.pageX}px`);
    setYPos(`${e.pageY}px`);
    setShowMenu(true);
  }


  // Executes the following when the component is first mounted
  useEffect(() => {
    // Add event listeners and actions
    document.addEventListener("click", handleLeftClick);

    document.onmousedown = (event) => {
      if (event.button === 2) rmbDownTime = Date.now();
    }

    document.onmouseup = (event) => {
      if (event.button === 2) {
        const duration = Date.now() - rmbDownTime;
        if (duration < 500) {
          handleRightClick(event);
        }
      }
    }
    // When component is unmounted, remove the following
    return () => {
      document.removeEventListener("click", handleLeftClick);
    };
  }, []);

  if (!showMenu || props.items == null || props.items.length === 0) {
    return null;
  }

  return (
    <div
      className={styles.menu}
      style={{
        position: "absolute",
        top: yPos,
        left: xPos
      }}>

      {props.items.map((item) => (
        <ContextItem
          key={item.id}
          name={item.name}
          id={item.id}
          description={item.description ?? ""}
          toggled={item.toggled}
          callback={(id: string) => {
            props.toggleItem(id);;
          }}
        />
      ))}
    </div>
  );
}

// Convert redux state to incoming props
const mapStateToProps = (state: ReduxState) => ({
  items: state.contextMenu.items
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatchToProps = (dispatch: any) => ({
  addItem: (item: ContextItemDefinition) => dispatch(addItem(item)),
  toggleItem: (id: string) => dispatch(toggleItem(id)),
  removeItem: (id: string) => dispatch(removeItem(id))
});
export default connect(mapStateToProps, mapDispatchToProps)(ContextMenu);
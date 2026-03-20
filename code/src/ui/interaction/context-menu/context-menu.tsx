"use client";

import styles from './context-menu.module.css';

import { useEffect } from 'react';
import { connect } from 'react-redux';

import { ReduxState } from 'app/store';
import { addItem, removeItem, toggleItem } from 'state/context-menu-slice';
import ContextItem, { ContextItemDefinition } from './context-item';

// Incoming properties type
interface ContextMenuProps {
  x: number,
  y: number,
  onClose: () => void,
  items?: ContextItemDefinition[],
  addItem?: (_item: ContextItemDefinition) => void,
  toggleItem?: (id: string) => void
}

/**
 * Represents a component for a custom right-click menu, containing instances of the
 * ContextItem class to representing individual items. 
 * 
 * The definition (and current toggled state) of each ContextItem is stored within
 * the global Redux state so it that it persists across the application lifecycle.
 */
function ContextMenu(props: Readonly<ContextMenuProps>) {
  useEffect(() => {
    const handleLeftClick = () => {
      props.onClose();
    };
    document.addEventListener("click", handleLeftClick);
    return () => {
      document.removeEventListener("click", handleLeftClick);
    };
  }, [props]);

  if (props.items == null || props.items.length === 0) {
    return null;
  }

  return (
    <div
      className={styles.menu}
      style={{
        position: "absolute",
        top: `${props.y}px`,
        left: `${props.x}px`,
      }}>
      {props.items.map((item) => (
        <ContextItem
          key={item.id}
          name={item.name}
          id={item.id}
          description={item.description ?? ""}
          toggled={item.toggled}
          callback={(id: string) => {
            props.toggleItem(id);
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
"use client";

import styles from './navbar-component.module.css';

import Icon from '@mui/material/Icon';
import Link from 'next/link';
import Tooltip from 'ui/interaction/tooltip/tooltip';

// Type definition for incoming parameters
export interface NavbarComponentProps {
  name: string,
  tooltip: string,
  icon: string,
  url: string,
  active?: boolean,
  callback?: (_name: string) => void
}

/**
 * This class represents an abstract navigation bar button.
 */
export default function NavbarComponent(props: Readonly<NavbarComponentProps>) {
  // Callback to bubble up to Toolbar
  const bubbleUp = () => {
    if (props.callback != null) {
      props.callback(props.name);
    }
  }
  return (
    <Tooltip
      text={props.tooltip}
      placement="bottom-start">
      <Link
        className={styles.navbarButton}
        onClick={bubbleUp}
        href={props.url}>
        <Icon
          className={`
            material-symbols-outlined
            ${styles.image}
            ${props.active ? styles.active : null}`
          }>
          {props.icon}
        </Icon>
      </Link>
    </Tooltip>
  );
}

"use client";

import styles from './ribbon-component.module.css';

import Tooltip from 'ui/interaction/tooltip/tooltip';

import IconComponent from 'ui/graphic/icon/icon';

interface RibbonComponentClickProps {
  id: string
  icon: string,
  text?: string,
  tooltip: string,
  action: () => void
}

export default function RibbonComponentClick(props: Readonly<RibbonComponentClickProps>) {
  return (
    <Tooltip text={props.tooltip} placement="bottom-start">
      <div className={styles.ribbonComponent} onClick={props.action}>
        <div>
          <div className={styles.ribbonComponentInner}>
            <div className={styles.ribbonComponentIcon}>
              <IconComponent icon={props.icon} />
            </div>
            {props.text &&

              <div className={styles.ribbonComponentText}>
                {props.text}
              </div>
            }
          </div>
        </div>
      </div>
    </Tooltip>
  );
}
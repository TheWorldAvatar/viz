import styles from './info-tree.module.css';

import React from 'react';

import { IconButtonWithIndex } from '@/ui/graphic/icon/icon-button';
import { ChartLine, List, type LucideIcon } from "lucide-react";

interface InfoTabsProps {
  tabs: {
    hasAttributes: boolean;
    hasTimeSeries: boolean;
  };
  activeTab: {
    index: number;
    setActiveTab: React.Dispatch<React.SetStateAction<number>>;
  }
}

interface InfoTabProps {
  icon: LucideIcon;
  activeTab: {
    index: number; // the index assigned to this tab
    state: number; // the current state of index
    setActiveTab: React.Dispatch<React.SetStateAction<number>>;
  };
}

/**
 * This component renders individual tabs depending on their availability.
 * 
 * @param {boolean} tabs.hasAttributes Indicates if the tabs should have a panel for displaying attributes.
 * @param {boolean} tabs.hasTimeSeries Indicates if the tabs should have a panel for displaying timeseries.
 * @param {number} activeTab.index The React state storing the current active index.
 * @param {React.Dispatch<React.SetStateAction<number>>} activeTab.setActiveTab A React function to set the current active index.
 */
export default function InfoTabs(props: Readonly<InfoTabsProps>) {
  return (
    <div className={styles["tab-container"]}>
      {props.tabs?.hasAttributes && (
        <InfoTab
          icon={List}
          activeTab={{
            index: 0,
            state: props.activeTab.index,
            setActiveTab: props.activeTab.setActiveTab,
          }}
        />
      )}
      {props.tabs?.hasTimeSeries && (
        <InfoTab
          icon={ChartLine}
          activeTab={{
            index: 1,
            state: props.activeTab.index,
            setActiveTab: props.activeTab.setActiveTab,
          }}
        />
      )}
    </div>
  );
}

/**
 * This component renders a tab for the parent component.
 * 
 * @param {LucideIcon} icon The lucide icon component to render.
 * @param {number} activeTab.index The index of this tab that will stay static.
 * @param {number} activeTab.state The React state storing the current active index.
 * @param {React.Dispatch<React.SetStateAction<number>>} activeTab.setActiveTab A React function to set the current active index.
 */
function InfoTab(props: Readonly<InfoTabProps>) {
  return (
    <IconButtonWithIndex
      index={props.activeTab.index}
      icon={props.icon}
      iconStyles={[styles["tab-icon"]]}
      onButtonClick={props.activeTab.setActiveTab}
      className={
        props.activeTab.state === props.activeTab.index
          ? `${styles.active} ${styles.tab}`
          : styles.tab
      }
    />
  );
}
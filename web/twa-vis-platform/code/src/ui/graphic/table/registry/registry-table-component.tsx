"use client"

import styles from './registry.table.module.css';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { getIsOpenState } from 'state/modal-slice';
import { parseWordsForLabels } from 'utils/client-utils';
import { getLabelledData } from 'utils/server-actions';
import RegistryTable from './registry-table';
import TableRibbon from './table-ribbon';
import { RegistryFieldValues } from 'types/form';

interface RegistryTableComponentProps {
  entityType: string;
  registryAgentApi: string;
  schedulerAgentApi: string;
}

/**
 * This component renders a registry table for the specified entity.
 * 
 * @param {string} entityType Type of entity for rendering.
 * @param {string} registryAgentApi The target endpoint for default registry agents.
 * @param {string} schedulerAgentApi The target endpoint for scheduler specific functionality.
 */
export default function RegistryTableComponent(props: Readonly<RegistryTableComponentProps>) {
  const isModalOpen: boolean = useSelector(getIsOpenState);
  const [currentInstances, setCurrentInstances] = useState<RegistryFieldValues[]>([]);

  // A hook that refetches all data when the dialogs are closed
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const instances: RegistryFieldValues[] = await getLabelledData(props.registryAgentApi, props.entityType);
        setCurrentInstances(instances);
      } catch (error) {
        console.error('Error fetching instances', error);
      }
    };

    if (!isModalOpen) {
      fetchData();
    }
  }, [isModalOpen]);

  return (
    <div className={styles["container"]}>
      <div className={styles["contents-container"]}>
        <h1 className={styles["title"]}>{parseWordsForLabels(props.entityType)}</h1>
        <TableRibbon
          entityType={props.entityType}
          registryAgentApi={props.registryAgentApi}
          schedulerAgentApi={props.schedulerAgentApi}
        />
        <div className={styles["table-contents"]}>
          <RegistryTable
            recordType={props.entityType}
            instances={currentInstances}
            limit={3}
          />
        </div>
      </div>
    </div>
  );
}
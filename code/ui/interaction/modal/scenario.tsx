"use client";

import styles from './scenario.module.css';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getScenarioDefinitions, setScenarioID, getScenarioID, setScenarioName, setScenarioType, setScenarioDefinitions } from '@/state/map-feature-slice';
import { ScenarioDefinition } from '@/types/scenario';
import IconComponent from '@/ui/graphic/icon/icon';
import Button from '@/ui/interaction/button';
import Modal from '@/ui/interaction/modal/modal';
import { getScenarios } from '@/utils/getScenarios';

interface ScenarioModalProperties {
  scenarioURL: string,
  scenarios: ScenarioDefinition[],
  show: boolean,
  setShowState: React.Dispatch<React.SetStateAction<boolean>>;
}

export function scenarioTypeIcon(scenarioType: string) {
  return scenarioType ? `/images/credo-misc/${scenarioType}.svg` : "/images/defaults/icons/about.svg";
}
/**
 * A modal component for users to select their scenario
 * 
 * @returns JSX for landing page.
 */
export default function ScenarioModal(props: Readonly<ScenarioModalProperties>) {
  const scenarioDefinitions = useSelector(getScenarioDefinitions);
  const scenarioUrl = props.scenarioURL;
  const dispatch = useDispatch();

  const handleChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    const scenarioID = event.currentTarget.value;
    const selectedScenario: ScenarioDefinition = (scenarioDefinitions.length > 0 ? scenarioDefinitions : props.scenarios).find(scenario => scenario.id === scenarioID);
    dispatch(setScenarioID(scenarioID));
    dispatch(setScenarioName(selectedScenario.name))
    dispatch(setScenarioType(selectedScenario.type))
    props.setShowState(false);
  };

  const onClick = async () => {
    const data = await getScenarios(scenarioUrl)
    dispatch(setScenarioDefinitions(data)); // can't do this in getsScenarios code bc server
  };

  const selectedScenario = useSelector(getScenarioID);

  return (
    <Modal
      isOpen={props.show}
      setIsOpen={props.setShowState}
      className="w-fit! h-fit! max-w-[80vw]! max-h-[70vh]! p-0! rounded-xl! overflow-hidden! bg-background!"
    >

      <div className={styles.globalContainer}>
        <div className={styles.headerContainer}>
          <div className={styles.header}>
            <h1>Select a scenario:</h1>
            <Button variant="ghost" className={`ml-auto ${styles.refreshButton}`} onClick={onClick}>Refresh</Button>
            {selectedScenario && <Button variant="ghost" className={`ml-2 ${styles.closeButton}`} onClick={() => props.setShowState(false)}>Close</Button>}
          </div>
        </div>
        <div className={styles.contentContainer}>
          {(scenarioDefinitions.length > 0 ? scenarioDefinitions : props.scenarios).map((scenario, index) => (
            <button key={scenario.name + index} value={scenario.id} className={styles.optionContainer} onClick={handleChange}>
              <div className={styles["icon-container"]}>
                <IconComponent icon={scenarioTypeIcon(scenario.type)} classes={styles.icon} />
              </div>
              <div className={styles.content}>
                <span className={styles.title}><b>{scenario.name}</b></span>
                <span className={styles.description}>{scenario.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

    </Modal>
  )
}
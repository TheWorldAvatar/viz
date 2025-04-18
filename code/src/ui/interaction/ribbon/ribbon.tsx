"use client"

import { Divider } from '@mui/material';
import { Map } from 'mapbox-gl';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import styles from './ribbon.module.css';

import { addItem, selectItem } from 'state/context-menu-slice';
import { getScenarioName, getScenarioType } from 'state/map-feature-slice';
import { Dictionary } from 'types/dictionary';
import { ImageryOption, MapSettings } from 'types/settings';
import IconComponent from 'ui/graphic/icon/icon';
import { ContextItemDefinition } from 'ui/interaction/context-menu/context-item';
import {
  getCameraPositions,
  getDefaultImageryOption,
  getImageryOptions,
  locateUser,
  resetCamera,
  set3DTerrain,
  setImagery,
  togglePlacenames
} from 'ui/map/map-helper';
import { closeFullscreen, openFullscreen } from 'utils/client-utils';
import { useDictionary } from 'hooks/useDictionary';
import { scenarioTypeIcon } from '../modal/scenario';
import RibbonComponentClick from './components/ribbon-component-click';
import RibbonComponentOptions from './components/ribbon-component-options';
import RibbonComponentToggle from './components/ribbon-component-toggle';

// Type definition for Ribbon parameters
export interface RibbonProps {
  map: Map,
  startingIndex: number,
  mapSettings: MapSettings,
  hasScenario: boolean,
  toggleScenarioSelection: React.Dispatch<React.SetStateAction<boolean>>;
}


/**
 * Ribbon containing visualisation controls.
*/
export default function Ribbon(props: Readonly<RibbonProps>) {
  // Definition of context menu item used to toggle map ribbon.
  const dict: Dictionary = useDictionary();
  const ribbonContextItem: ContextItemDefinition = useMemo(() => {
    return {
      name: dict.context.controlRibbon.title,
      description: dict.context.controlRibbon.tooltip,
      id: "ribbon",
      toggled: true,
    };
  }, []);
  const cameraDefault: string = props.mapSettings.camera.default;
  const ribbonState: ContextItemDefinition = useSelector(selectItem(ribbonContextItem.id));
  const [isRibbonToggled, setIsRibbonToggled] = useState<boolean>(ribbonState?.toggled);
  const cameraNames: string[] = getCameraPositions(props.mapSettings.camera);
  const imageryNames: string[] = getImageryOptions(props.mapSettings.imagery);
  const currentImagery: ImageryOption = getDefaultImageryOption(props.mapSettings.imagery);

  useEffect(() => {
    setIsRibbonToggled(ribbonState?.toggled);
  }, [ribbonState?.toggled])


  const currentScenarioName = useSelector(getScenarioName);
  const currentScenarioType = useSelector(getScenarioType);

  // State for map configuration settings
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(addItem(ribbonContextItem));   // Add context menu item
  }, [])

  if (isRibbonToggled) {
    return (
      <div className={styles.ribbon}>
        <RibbonComponentClick
          key="location" id="location"
          icon="my_location"
          tooltip={dict.map.tooltip.location}
          action={() => {
            locateUser(props.map);
          }}
        />
        <RibbonComponentOptions
          key="map-style" id="map-style"
          icon="palette"
          tooltip={dict.map.tooltip.mapStyle}
          options={imageryNames}
          initialOption={currentImagery?.name}
          iconClickable={false}
          action={() => {
            setImagery(props.mapSettings.imagery, props.map);
          }}
        />
        <RibbonComponentOptions
          key="reset" id="reset"
          icon="reset_focus"
          tooltip={dict.map.tooltip.resetCamera}
          options={cameraNames}
          initialOption={cameraDefault}
          action={() => {
            resetCamera(props.mapSettings.camera, props.map);
          }}
        />
        <RibbonComponentToggle
          key="placenames" id="placenames"
          icon="glyphs"
          tooltip={dict.map.tooltip.placenames}
          initialState={props.mapSettings.hideLabels}
          action={() => {
            togglePlacenames(props.mapSettings.imagery, props.map);
          }}
        />
        <RibbonComponentToggle
          key="terrain" id="terrain"
          icon="landscape_2"
          tooltip={dict.map.tooltip.terrain}
          initialState={false}
          action={state => {
            set3DTerrain(state, props.map);
          }}
        />
        <RibbonComponentToggle
          key="fullscreen" id="fullscreen"
          icon="open_in_full"
          tooltip={dict.map.tooltip.fullscreen}
          initialState={false}
          action={state => {
            if (state) {
              openFullscreen();
            } else {
              closeFullscreen();
            }
          }}
        />
        <Divider orientation="vertical" flexItem />
        {currentScenarioName &&
          <RibbonComponentToggle
            key="scenario" id="scenario"
            tooltip={dict.map.tooltip.selectScenario}
            initialState={false}
            action={props.toggleScenarioSelection}
          >
            <div className={styles.selectedScenarioDisplay}>
              <span className={styles.scenarioDisplayText}>{currentScenarioName}</span>
              <IconComponent icon={scenarioTypeIcon(currentScenarioType)} classes={styles.navbarScenarioIcon} />
            </div>
          </RibbonComponentToggle>
        }
      </div>)
  }
}

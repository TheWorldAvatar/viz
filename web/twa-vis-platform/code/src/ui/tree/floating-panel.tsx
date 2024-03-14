import { Icon, Tooltip } from '@mui/material';
import styles from './floating-panel.module.css';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getIndex, setIndex } from 'state/floating-panel-slice';
import { getQueryTrigger, getUrl, setQueryTrigger } from 'state/map-feature-slice';
import { useGetMetadataQuery } from 'utils/server-utils';
import { DataStore } from 'io/data/data-store';
import LayerTree from './layer/layer-tree';
import LegendTree from './legend/legend-tree';
import InfoTree from './info/info-tree';

// Incoming parameters for component.
type FloatingPanelContainerProps = {
  dataStore: DataStore;
  hideLegend?: boolean;
  hideInfo?: boolean;
};

/**
 * Floating panel that contains the layer tree and legend components.
 */
export default function FloatingPanelContainer(
  props: FloatingPanelContainerProps
) {
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [queriedData, setQueriedData] = useState(null);

  const showLegend = props.hideLegend == null || !props.hideLegend;
  const showInfo = props.hideInfo == null || !props.hideInfo;

  const dispatch = useDispatch();
  const activeIndex = useSelector(getIndex);
  const selectedUrl = useSelector(getUrl);
  const trigger = useSelector(getQueryTrigger);

  const buttonClass = styles.headButton;
  const buttonClassActive = [styles.headButton, styles.active].join(" ");

  // Execute API call
  const { data, error, isFetching } = useGetMetadataQuery(selectedUrl, { skip: !trigger });

  // Effect to display additional feature information retrieved from an agent only once it has been loaded
  useEffect(() => {
    if (isFetching) {
      // WIP: Add required functionality while data is still being fetched
    } else if (error) {
      console.error("Error fetching data:", error);
    } else {
      if (data) {
        setQueriedData(data);
        dispatch(setQueryTrigger(false));
      };
    };
  }, [isFetching]);

  const clickAction = (index: number) => {
    dispatch(
      setIndex({
        index: index,
      })
    );
  };

  return (
    <div className={styles.floatingPanelContainer}>
      <div className={styles.floatingPanelHead}>
        {/* Layer tree button */}
        <button
          className={activeIndex == 0 ? buttonClassActive : buttonClass}
          onClick={() => clickAction(0)}
        >
          <Tooltip
            title="Layer Selection"
            enterDelay={1000}
            leaveDelay={100}
            placement="bottom-start"
          >
            <Icon className="material-symbols-outlined">stacks</Icon>
          </Tooltip>
        </button>

        {/* Legend button */}
        {showLegend && (
          <button
            className={activeIndex == 1 ? buttonClassActive : buttonClass}
            onClick={() => clickAction(1)}
          >
            <Tooltip
              title="Key/Legend"
              enterDelay={1000}
              leaveDelay={100}
              placement="bottom-start"
            >
              <Icon className="material-symbols-outlined">key_vertical</Icon>
            </Tooltip>
          </button>
        )}

        {/* Info button */}
        {showInfo && (
          <button
            className={activeIndex == 2 ? buttonClassActive : buttonClass}
            onClick={() => clickAction(2)}
          >
            <Tooltip
              title="Information"
              enterDelay={1000}
              leaveDelay={100}
              placement="bottom-start"
            >
              <Icon className="material-symbols-outlined">info</Icon>
            </Tooltip>
          </button>
        )}

        {/* Toggle visibility button */}
        <button onClick={() => setIsPanelVisible(!isPanelVisible)}>
          <Tooltip
            title={isPanelVisible ? "Collapse Panel" : "Expand Panel"}
            enterDelay={500}
            leaveDelay={200}
          >
            <Icon className="material-symbols-outlined">
              {isPanelVisible ? "arrow_drop_up" : "arrow_drop_down"}
            </Icon>
          </Tooltip>
        </button>
      </div>

      {/* Conditionally render the panel's body */}
      {isPanelVisible && (
        <div className={styles.floatingPanelBody}>
          {activeIndex === 0 && <LayerTree dataStore={props.dataStore} />}
          {activeIndex === 1 && <LegendTree />}
          {activeIndex === 2 &&
            <InfoTree
              data={queriedData}
              isFetching={isFetching}
            />}
        </div>
      )}
    </div>
  );
}

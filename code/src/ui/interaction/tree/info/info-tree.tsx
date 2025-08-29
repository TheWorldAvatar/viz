import styles from './info-tree.module.css';

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getHasExistingData } from 'state/floating-panel-slice';
import { MapFeaturePayload } from 'state/map-feature-slice';
import { AttributeGroup } from 'types/attribute';
import { Dictionary } from 'types/dictionary';
import { TimeSeries } from 'types/timeseries';
import LoadingSpinner from 'ui/graphic/loader/spinner';
import FeatureSelector from 'ui/interaction/dropdown/feature-selector';
import { setSelectedFeature, highlightFeature } from 'utils/client-utils';
import { useDictionary } from 'hooks/useDictionary';
import AttributeRoot from './attribute-root';
import InfoTabs from './info-tabs';
import TimeSeriesPanel from './time-series-panel';
import { Map } from "mapbox-gl";
import { DataStore } from 'io/data/data-store';

interface InfoTreeProps {
  attributes: AttributeGroup;
  timeSeries: TimeSeries[];
  featureName: string;
  isFetching: boolean;
  isUpdating: boolean;
  activeTab: {
    index: number;
    setActiveTab: React.Dispatch<React.SetStateAction<number>>;
  };
  features: MapFeaturePayload[];
  map: Map;
  dataStore: DataStore;
}

/**
 * This component is responsible for displaying information about the selected geographic feature 
 * such as name, description, and IRI. Data is passed from the parent component so that 
 * the existing state is persisted even if this component is removed.
 * 
 * @param {AttributeGroup} attributes The processed attributes for user interaction.
 * @param {TimeSeries[]} timeSeries The processed time series for user interaction.
 * @param {string} featureName The name of the currently selected feature.
 * @param {boolean} isFetching An indicator if the query is still running.
 * @param {MapFeaturePayload[]} features A list of selected features.
 */
export default function InfoTree(props: Readonly<InfoTreeProps>) {
  const dispatch = useDispatch();
  const hasExistingData: boolean = useSelector(getHasExistingData);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const dict: Dictionary = useDictionary();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(scrollPosition, 0);
    }
  }, [scrollPosition]);

  useEffect(() => {
    // Update the active tab only if the time series is present but attributes are missing
    if (!props.attributes && props.timeSeries) {
      props.activeTab.setActiveTab(1);
    }
  }, [props.attributes, props.timeSeries]);

  // A function that renders the required contents for this panel
  const renderPanelContents: () => React.ReactElement = () => {
    // Render only the loading spinner if it is initially fetching data
    if (props.isFetching && !hasExistingData) {
      return <div className={styles.loading}>
        <LoadingSpinner isSmall={false} />
      </div>
    }

    // If there are multiple features clicked, activate feature selector to choose only one
    if (props.features.length > 1) {
      return <FeatureSelector features={props.features} map={props.map} dataStore={props.dataStore} />;
    } else if (props.features.length === 1) {
      // When only feature is available, set its properties
      setSelectedFeature(props.features[0], props.map, dispatch);
      highlightFeature(props.features[0], props.map, props.dataStore);
    }
    // If active tab is 0, render the Metadata Tree
    if (props.attributes && props.activeTab.index === 0) {
      return (
        <AttributeRoot attribute={props.attributes}
          scrollRef={scrollRef}
          setScrollPosition={setScrollPosition}
        />);
    }

    if (props.timeSeries && props.activeTab.index > 0) {
      return (
        <TimeSeriesPanel data={props.timeSeries} />
      );
    }
    // Placeholder text when there are no initial data or selected feature
    return <div className={styles.initialContent}>{dict.message.mapSelectFeature}</div>;
  }


  return (
    <div className={styles.infoPanelContainer}>
      <div className={styles.infoHeadSection}>
        {// Display the tabs only if there are both meta and time
          (props.attributes && props.timeSeries && (!props.isFetching || hasExistingData)) ? (
            <InfoTabs
              tabs={{
                hasAttributes: !!props.attributes,
                hasTimeSeries: !!props.timeSeries,
              }}
              activeTab={{
                index: props.activeTab.index,
                setActiveTab: props.activeTab.setActiveTab,
              }} />) : <div> </div>}
        {props.features.length === 0 &&
          (<div className={styles["feature-name-header"]}>{props.featureName ?? ""}</div>)
        }
      </div>
      <div ref={scrollRef} className={styles.infoSection}>
        {renderPanelContents()}
      </div>
    </div>
  );
}
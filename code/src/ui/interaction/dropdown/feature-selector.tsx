import { useDispatch } from 'react-redux';
import styles from './feature-selector.module.css';

import React from 'react';

import { MapFeaturePayload } from 'state/map-feature-slice';
import { Dictionary } from 'types/dictionary';
import GroupDropdownField from 'ui/interaction/dropdown/group-dropdown';
import { setSelectedFeature } from 'utils/client-utils';
import { useDictionary } from 'utils/dictionary/DictionaryContext';

interface FeatureSelectorProps {
  features: MapFeaturePayload[];
}

/**
 * This component prompts the user to select one feature and view their information when there are multiple features during a click event.
 * 
 * @param {MapFeaturePayload[]} features The closely positioned feature selections during the click event.
 */
export default function FeatureSelector(props: Readonly<FeatureSelectorProps>) {
  const dispatch = useDispatch();
  const dict: Dictionary = useDictionary();

  const handleSelectorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFeature: MapFeaturePayload = props.features.find((feature) => feature.name === event.target.value);
    setSelectedFeature(selectedFeature, dispatch);
  };

  return (
    <div className={styles["container"]}>
      <p>{dict.message.mapOverlapFeatures}</p>
      <div className={styles["select-container"]}>
        <GroupDropdownField
          placeholderText={dict.message.mapSelectInstruction}
          options={extractNames(props.features)}
          groups={extractGroups(props.features)}
          handleChange={handleSelectorChange}
        />
      </div>
    </div>
  );
}

function extractNames(features: MapFeaturePayload[]): string[] {
  return [...features.map(feature => feature.name)];
}

function extractGroups(features: MapFeaturePayload[]): string[] {
  return [...features.map(feature => feature.layer)];
}
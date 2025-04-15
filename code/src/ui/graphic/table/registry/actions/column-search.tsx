import { selectorStyles } from 'ui/css/selector-style';
import styles from './column-search.module.css';

import { Input } from 'antd';
import React, { useMemo, useState } from 'react';
import Select from 'react-select';

import { Dictionary } from 'types/dictionary';
import { FormOptionType, RegistryFieldValues } from 'types/form';
import ClickActionButton from 'ui/interaction/action/click/click-button';
import { extractResponseField, parseWordsForLabels } from 'utils/client-utils';
import { useDictionary } from 'utils/dictionary/DictionaryContext';

interface ColumnSearchComponentProps {
  instances: RegistryFieldValues[];
  setCurrentInstances: React.Dispatch<React.SetStateAction<RegistryFieldValues[]>>;
}

/**
 * A search component for the registry table to search and filter values in a column based on user input.
 * 
 * @param {RegistryFieldValues[]} instances The instances for the table.
 * @param setCurrentInstances A dispatch method to set the current instances after parsing the initial instances.
 */
export default function ColumnSearchComponent(props: Readonly<ColumnSearchComponentProps>) {
  const dict: Dictionary = useDictionary();
  const [searchText, setSearchText] = useState<string>("");
  const [searchColumn, setSearchColumn] = useState<FormOptionType>(null);

  // Generate search option from instances
  const columnSearchOptions: FormOptionType[] = useMemo(() => {
    if (props.instances.length === 0) return [];
    const options: FormOptionType[] = Object.keys(props.instances[0]).map(field => {
      return {
        value: field,
        label: parseWordsForLabels(field),
      }
    });
    setSearchColumn(options[0]);
    return options;
  }, [props.instances]);

  const handleClear = () => {
    setSearchText("");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleUpdate = () => {
    const searchableInput: string = searchText.trim().toLowerCase();
    if (searchableInput) {
      props.setCurrentInstances(props.instances.filter(instance => {
        return extractResponseField(instance, searchColumn.value, true).value
          .toLowerCase().includes(searchableInput);
      }));
    } else {
      props.setCurrentInstances(props.instances)
    }
  };

  return (
    <div className={styles["container"]} >
      <Select
        styles={selectorStyles}
        unstyled
        options={columnSearchOptions}
        value={searchColumn}
        onChange={(selectedOption) => setSearchColumn(selectedOption as FormOptionType)}
        isLoading={false}
        isMulti={false}
        isSearchable={true}
      />
      <Input
        placeholder={dict.action.search}
        value={searchText}
        onChange={handleSearch}
        prefix={<span className="material-symbols-outlined">search</span>}
        style={{ width: 200 }}
      />
      <div className={styles["button-container"]} >
        <ClickActionButton
          icon="filter_list_alt"
          tooltipText={dict.action.update}
          onClick={handleUpdate}
        />
        <ClickActionButton
          icon="replay"
          tooltipText={dict.action.clear}
          onClick={handleClear}
        />
      </div>
    </div>
  );
}
import { selectorStyles } from 'ui/css/selector-style';
import styles from './column-search.module.css';

import React, { useMemo, useState } from 'react';
import Select from 'react-select';

import { autoUpdate, flip, FloatingFocusManager, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole, } from '@floating-ui/react';
import { useDictionary } from 'hooks/useDictionary';
import { Dictionary } from 'types/dictionary';
import { RegistryFieldValues } from 'types/form';
import ClickActionButton from 'ui/interaction/action/click/click-button';
import { SelectOption } from 'ui/interaction/dropdown/simple-selector';
import { extractResponseField, parseWordsForLabels } from 'utils/client-utils';

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
  const [searchColumn, setSearchColumn] = useState<SelectOption>(null);
  // WIP: Separate the Floating UI code and trigger
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { refs, floatingStyles, context } = useFloating({
    placement: 'bottom-start',
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(-5), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  // Generate search option from instances
  const columnSearchOptions: SelectOption[] = useMemo(() => {
    if (props.instances.length === 0) return [];
    const options: SelectOption[] = Object.keys(props.instances[0]).map(field => {
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
    props.setCurrentInstances(props.instances)
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
    <>
      <div ref={refs.setReference} {...getReferenceProps()}>
        <ClickActionButton
          icon="filter_alt"
          tooltipText={dict.action.filter}
          isTransparent={true}
        />
      </div>
      {isOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <div className={styles["container"]}
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            <Select
              styles={selectorStyles}
              unstyled
              options={columnSearchOptions}
              value={searchColumn}
              onChange={(selectedOption) => setSearchColumn(selectedOption)}
              isLoading={false}
              isMulti={false}
              isSearchable={true}
            />
            <input
              type="text"
              className={styles["search-input"]}
              placeholder={dict.action.search}
              onChange={handleSearch}
              value={searchText}
              readOnly={false}
              aria-label={"Filter Search"}
            />
            <div className={styles["button-container"]} >
              <ClickActionButton
                icon="search"
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
        </FloatingFocusManager>
      )}
    </>
  );
}
import React, { useMemo, useState } from "react";

import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import { RegistryFieldValues } from "types/form";
import PopoverActionButton from "ui/interaction/action/popover/popover-button";
import SimpleSelector, {
  SelectOption,
} from "ui/interaction/dropdown/simple-selector";
import { extractResponseField, parseWordsForLabels } from "utils/client-utils";
import Button from "ui/interaction/button";

interface ColumnSearchComponentProps {
  instances: RegistryFieldValues[];
  setCurrentInstances: React.Dispatch<
    React.SetStateAction<RegistryFieldValues[]>
  >;
}

/**
 * A search component for the registry table to search and filter values in a column based on user input.
 *
 * @param {RegistryFieldValues[]} instances The instances for the table.
 * @param setCurrentInstances A dispatch method to set the current instances after parsing the initial instances.
 */
export default function ColumnSearchComponent(
  props: Readonly<ColumnSearchComponentProps>
) {
  const dict: Dictionary = useDictionary();
  const [searchText, setSearchText] = useState<string>("");
  const [searchColumn, setSearchColumn] = useState<string>(null);

  // Generate search option from instances
  const columnSearchOptions: SelectOption[] = useMemo(() => {
    if (props.instances.length === 0) return [];
    const options: SelectOption[] = Object.keys(props.instances[0]).map(
      (field) => {
        return {
          value: field,
          label: parseWordsForLabels(field),
        };
      }
    );
    setSearchColumn(options[0]?.value);
    return options;
  }, [props.instances]);

  const handleClear = () => {
    setSearchText("");
    props.setCurrentInstances(props.instances);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleUpdate = () => {
    const searchableInput: string = searchText.trim().toLowerCase();
    if (searchableInput) {
      props.setCurrentInstances(
        props.instances.filter((instance) => {
          return extractResponseField(instance, searchColumn, true)
            .value.toLowerCase()
            .includes(searchableInput);
        })
      );
    } else {
      props.setCurrentInstances(props.instances);
    }
  };

  return (
    <PopoverActionButton
      placement="bottom-start"
      icon="search"
      tooltipText={dict.action.filter}
      isTransparent={true}
    >
      <SimpleSelector
        options={columnSearchOptions}
        defaultVal={searchColumn}
        onChange={(selectedOption) => {
          if (selectedOption && "value" in selectedOption) {
            setSearchColumn(selectedOption?.value);
          }
        }}
      />
      <input
        type="text"
        className="w-full h-8 max-w-none p-1 bg-background text-sm text-foreground border-1 border-border rounded-lg"
        placeholder={dict.action.search}
        onChange={handleSearch}
        value={searchText}
        readOnly={false}
        aria-label={"Filter Search"}
      />
      <div className="flex justify-evenly">
        <Button
          size="icon"
          leftIcon="search"
          tooltipText={dict.action.update}
          onClick={handleUpdate}
        />
        <Button
          size="icon"
          leftIcon="replay"
          tooltipText={dict.action.clear}
          onClick={handleClear}
        />
      </div>
    </PopoverActionButton>
  );
}

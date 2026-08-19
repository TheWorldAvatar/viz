import { useState } from 'react';
import { parseWordsForLabels } from "@/utils/client-utils";
import Button from "@/ui/interaction/button";
import styles from "./simple.module.css"

export type SearchConfigValue = string | number;

export type SearchConfig = Record<string, SearchConfigValue[]>;

export type SimpleSearchFormProps = {
  search: SearchConfig;
  onSubmit: (filters: Record<string, SearchConfigValue>) => void;
};

export default function SimpleSearchForm(
  props: Readonly<SimpleSearchFormProps>
) {
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, SearchConfigValue>
  >(
    Object.fromEntries(
      Object.entries(props.search).map(([key, values]) => [key, values[0]])
    )
  );

  const handleChange = (key: string, value: string) => {
    const selectedValue = props.search[key].find(
      (option) => String(option) === value
    );

    setSelectedFilters((current: Record<string, SearchConfigValue>) => ({
      ...current,
      [key]: selectedValue ?? value,
    }));
  };

  const handleSubmit = () => {
    props.onSubmit(selectedFilters);
  };

  return (
    <div className="flex flex-col w-full gap-4">
      {Object.entries(props.search).map(([key, values]) => (
        <div key={key} className="flex flex-col w-full">
          <label htmlFor={key}>
            <span className="text-lg font-semibold">
              {parseWordsForLabels(key)}
            </span>
          </label>
          <select
            id={key}
            className={styles["simple-form-select-value"]}
            value={String(selectedFilters[key])}
            onChange={(event) => handleChange(key, event.target.value)}
          >
            {values.map((value) => (
              <option key={String(value)} value={String(value)}>
                {String(value)}
              </option>
            ))}
          </select>
        </div>
      ))}

      <Button
        leftIcon="search"
        label="Search"
        onClick={handleSubmit}
      />
    </div>
  );
}
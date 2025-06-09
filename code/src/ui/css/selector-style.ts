import { GroupBase, StylesConfig } from "react-select";

import { SelectOption } from "ui/interaction/dropdown/simple-selector";

// Selector styles for react select
export const selectorStyles: StylesConfig<
  SelectOption,
  false,
  GroupBase<SelectOption>
> = {
  control: (provided, { isDisabled }) => ({
    ...provided,
    outline: "1px solid var(--border-primary)",
    height: "1.8rem",
    width: "100%",
    maxWidth: "none",
    padding: "0.2rem",
    margin: "0",
    borderRadius: "0.5rem",

    cursor: isDisabled ? "not-allowed !important" : "default",
    backgroundColor: "var(--muted)",
    opacity: isDisabled ? "0.75" : "1",
  }),
  dropdownIndicator: (provided, { isDisabled }) => ({
    ...provided,
    marginRight: "0.5rem",
    color: isDisabled
      ? "var(--background-secondary)"
      : "var(--text-color-primary)",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "var(--muted)",
    boxShadow: " 0 0 0.3rem rgba(0, 0, 0, 0.1)",
    borderRadius: "0.5rem !important",
    margin: "0.25rem 0",
    minWidth: "100%",
    width: "fit-content",
    border: "1px solid var(--border-primary)",
    zIndex: 99999,
    overflow: "hidden",
  }),
  noOptionsMessage: (provided) => ({
    ...provided,
    padding: "0.25rem 0.5rem",
    backgroundColor: "var(--background-muted)",
    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
    color: "var(--background-inverse-primary)",
    fontSize: "var(--font-size-primary)",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "var(--text-color-primary)",
    fontSize: "var(--font-size-primary-text)",
    marginLeft: "0.5rem",
  }),
  singleValue: (provided, { isDisabled }) => ({
    ...provided,
    color: isDisabled
      ? "var(--text-color-primary)"
      : "var(--text-color-primary)",
    fontSize: "var(--font-size-primary)",
    marginLeft: "0.25rem",
  }),
  input: (provided) => ({
    ...provided,
    color: "var(--text-color-primary)",
    fontSize: "var(--font-size-tertiary-text)",
  }),
  group: (provided) => ({
    ...provided,
  }),
  groupHeading: (provided) => ({
    ...provided,
    color: "var(--text-color-primary)",
    textTransform: "none",
    textWrap: "nowrap",
    fontWeight: "600",
    fontSize: "var(--font-size-primary)",
    padding: "0.25rem 0.5rem",
    borderBottom: "1px solid var(--border-secondary)",
    borderTop: "1px solid var(--border-secondary)",
    cursor: "text",
  }),
  option: (provided, { isDisabled, isSelected }) => {
    return {
      ...provided,

      backgroundColor: isSelected
        ? "var(--background-secondary)"
        : "var(--background-muted)",
      color: "var(--text-color-primary)",
      fontWeight: isSelected ? "600" : "400",
      cursor: isDisabled ? "not-allowed" : "default",
      fontSize: "var(--font-size-primary)",
      "&:hover": {
        color: "var(--text-color-primary)",
        backgroundColor: isSelected
          ? "var(--background-secondary)"
          : "var(--background-tertiary)",
      },
      padding: "0.25rem 0.5rem",
      textWrap: "nowrap",
      minWidth: "100%",
      width: "fit-content",
    };
  },
};

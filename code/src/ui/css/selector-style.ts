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
    boxShadow: " 0 0 0.3rem rgba(0, 0, 0, 0.1)",
    cursor: isDisabled ? "not-allowed !important" : "default",
    border: isDisabled ? "1px solid var(--border-border)" : "none",
    backgroundColor: "var(--background-muted)",
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
    backgroundColor: "var(--background-muted)",
    boxShadow: " 0 0 0.3rem rgba(0, 0, 0, 0.1)",
    borderRadius: "0.5rem",
    margin: "0.25rem 0",
    minWidth: "100%",
    width: "fit-content",
    border: "1px solid var(--border-primary)",

    zIndex: 99999,
  }),
  noOptionsMessage: (provided) => ({
    ...provided,
    padding: "0.25rem 0.5rem",
    backgroundColor: "var(--background-tertiary)",
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
      ? "var(--text-color-secondary)"
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
    backgroundColor: "var(--background-tertiary)",
  }),
  groupHeading: (provided) => ({
    ...provided,
    color: "var(--text-color-primary)",
    textTransform: "none",
    textWrap: "nowrap",
    fontWeight: "600",
    fontSize: "var(--font-size-primary)",
    padding: "0.25rem 0.5rem",
    borderTop: "1px solid  var(--border-secondary)",
    borderBottom: "1px solid  var(--border-secondary)",
  }),
  option: (provided, { isDisabled, isSelected }) => {
    return {
      ...provided,

      backgroundColor: "var(--background-muted)",
      color: isSelected
        ? "var(--text-color-secondary)"
        : "var(--text-color-primary)",
      cursor: isDisabled ? "not-allowed" : "default",
      fontSize: "var(--font-size-primary)",
      "&:hover": {
        color: isSelected
          ? "var(--text-color-secondary)"
          : "var(--text-color-primary)",
        backgroundColor: isSelected
          ? "var(--background-secondary)"
          : "var(--background-tertiary)",
      },
      padding: "0.25rem 0.5rem",
      textWrap: "nowrap",
      minWidth: "100%",
      width: "fit-content",
      marginTop: "0.25rem",
      marginBottom: "0.25rem",
    };
  },
};

import { GroupBase, StylesConfig } from "react-select";

import { SelectOption } from "ui/interaction/dropdown/simple-selector";

// Selector styles for react select
export const selectorStyles: StylesConfig<
  SelectOption,
  boolean,
  GroupBase<SelectOption>
> = {
  control: (provided, { isDisabled, isFocused }) => ({
    ...provided,
    border: isFocused ? "1px solid var(--border)" : "1px solid var(--border)",
    height: "2.72rem",
    width: "100%",
    maxWidth: "none",
    padding: "0.2rem",
    margin: "0",
    borderRadius: "0.4rem",
    cursor: isDisabled ? "not-allowed !important" : "default",
    backgroundColor: "var(--muted)",
    opacity: isDisabled ? "0.75" : "1",
    boxShadow: isFocused ? "0 0 0 2px var(--border)" : "none",
    "&:hover": {
      backgroundColor: "var(--background)",
    },
  }),
  dropdownIndicator: (provided, { isDisabled }) => ({
    ...provided,
    marginRight: "0.5rem",
    color: isDisabled ? "var(--background-secondary)" : "var(--foreground)",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "var(--muted)",
    boxShadow: " 0 0 0.3rem rgba(0, 0, 0, 0.1)",
    borderRadius: "0.5rem !important",
    margin: "0.25rem 0",
    minWidth: "100%",
    border: "1px solid var(--border)",
    zIndex: 99999,
    overflow: "auto",
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
    fontSize: "var(--font-size-primary)",
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
  option: (provided, { isDisabled, isSelected, isFocused }) => {
    return {
      ...provided,
      backgroundColor: isFocused
        ? "var(--background-tertiary)"
        : isSelected
        ? "var(--background-muted)"
        : "var(--background-muted)",
      color: "var(--foreground)",
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
      "&::before": isSelected
        ? {
            content: "'✓'",
            color: "var(--text-color-primary)",
            fontWeight: "bold",
            marginRight: "0.5rem",
            fontSize: "0.875rem",
          }
        : {
            content: "''",
            marginRight: "1rem",
          },
    };
  },
};

export const checkboxInputsSelectorStyles: StylesConfig<
  SelectOption,
  boolean,
  GroupBase<SelectOption>
> = {
  control: (provided, { isDisabled, isFocused }) => ({
    ...provided,
    border: "1px solid var(--border)",
    height: "fit-content",
    width: "100%",
    maxWidth: "none",
    padding: "0.2rem",
    margin: "0",
    borderRadius: "0.4rem",
    cursor: isDisabled ? "not-allowed" : "default",
    backgroundColor: "var(--background)",
    opacity: isDisabled ? "0.75" : "1",
    boxShadow: isFocused ? "0 0 0 2px var(--border)" : "none",
    "&:hover": {
      backgroundColor: "var(--muted)",
      cursor: "pointer",
      border: "1px solid var(--border)",
      boxShadow: "none",
    },
  }),
  dropdownIndicator: (provided, { isDisabled }) => ({
    ...provided,
    marginRight: "0.5rem",
    color: isDisabled ? "var(--background-secondary)" : "var(--foreground)",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "var(--background)",
    boxShadow: " 0 0 0.3rem rgba(0, 0, 0, 0.1)",
    borderRadius: "0.5rem !important",
    margin: "0.25rem 0",
    minWidth: "100%",
    width: "fit-content",
    border: "1px solid var(--border)",
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
    fontSize: "var(--font-size-primary)",
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
  clearIndicator: (provided) => ({
    ...provided,
    color: "var(--destructive)",
    "&:hover": {
      color: "var(--destructive)",
      opacity: 0.8,
      transition: "color 0.2s ease",
    },
  }),
  option: (provided, { isDisabled, isSelected, isFocused }) => {
    return {
      ...provided,
      backgroundColor: isFocused
        ? "var(--background-tertiary)"
        : isSelected
        ? "var(--background)"
        : "var(--background)",
      color: "var(--foreground)",
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

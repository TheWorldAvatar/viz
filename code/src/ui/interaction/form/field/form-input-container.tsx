import styles from "./field.module.css";

import React, { useState } from "react";
import { FieldError } from "react-hook-form";
import { Icon } from "@mui/material";

import { OntologyConcept, PropertyShape, VALUE_KEY } from "types/form";
import FormErrorComponent from "ui/text/error/form-error";
import { parseWordsForLabels } from "utils/client-utils";
import ActionButton from 'ui/interaction/action/action';

export interface FormInputContainerProps {
  field: PropertyShape;
  error: FieldError;
  children: React.ReactNode;
  instance?: {
    entityType: string;
    currentOption: string;
  },
  formatLabel?: string;
  labelStyles?: string[];
  selectedOption?: OntologyConcept;

  onViewDetails?: () => void;
}

/**
 * This component acts as a container with duplicate elements for a form input.
 *
 * @param {PropertyShape} field The SHACL shape property for this field.
 * @param {FieldError} error A react-hook-form error object if an error is present.
 * @param {React.ReactNode} children Children elements for the container.
 * @param {OntologyConcept} selectedOption Optional selected option description.
 * @param {string[]} labelStyles Optional styles for the label element.
 */
export default function FormInputContainer(
  props: Readonly<FormInputContainerProps>
) {
  const [showDescription, setShowDescription] = useState<boolean>(false);
  const labelClassNames: string = props.labelStyles?.join(" ");
  const label: string = props.field.name[VALUE_KEY];

  const toggleDescription = () => {
    setShowDescription(!showDescription);
  };

  return (
    <>
      <label className={labelClassNames} htmlFor={props.field.fieldId}>
        <span className={styles["field-text"]}>
          {parseWordsForLabels(label)}
          {props.error && "*"}
        </span>
        {props.formatLabel && (
          <span className={styles["format-label"]}>{props.formatLabel}</span>
        )}
      </label>
      {props.children}
      {props.field.description[VALUE_KEY] != "" && (
        <div style={{ position: 'relative' }}>  {/* This is a comment, not code */}
          <p className={`${styles["info-text"]} ${styles["info-text-show"]}`}>
            <b className={styles["field-text"]}>Description:&nbsp;</b>{" "}
            {props.field.description[VALUE_KEY]}
            {props.selectedOption && (
              <>
                <br />
                <br />
                <b className={styles["field-text"]}>
                  {props.selectedOption?.label.value}:
                </b>{" "}
                {props.selectedOption?.description.value}
              </>
            )}
          </p>
          {props.onViewDetails && (
            <ActionButton
              icon="arrow_forward"
              className={styles["info-navigate-button"]}
              onClick={props.onViewDetails}
              isHoverableDisabled={false}
            />
          )}
        </div>
      )}
      <FormErrorComponent error={props.error} />
    </>
  );
}

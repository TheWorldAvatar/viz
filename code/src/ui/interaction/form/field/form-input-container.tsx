import styles from "./field.module.css";

import React from "react";
import { FieldError } from "react-hook-form";

import { OntologyConcept, PropertyShape, VALUE_KEY } from "types/form";
import ClickActionButton from "ui/interaction/action/click/click-button";
import RedirectButton from "ui/interaction/action/redirect/redirect-button";
import FormErrorComponent from "ui/text/error/form-error";
import { parseWordsForLabels } from "utils/client-utils";

export interface FormInputContainerProps {
  field: PropertyShape;
  error: FieldError;
  children: React.ReactNode;
  formatLabel?: string;
  labelStyles?: string[];
  selectedOption?: OntologyConcept;
  redirectOptions?: {
    addUrl?: string;
    view?: React.MouseEventHandler<HTMLButtonElement>;
  };
}

/**
 * This component acts as a container with duplicate elements for a form input.
 *
 * @param {PropertyShape} field The SHACL shape property for this field.
 * @param {FieldError} error A react-hook-form error object if an error is present.
 * @param {React.ReactNode} children Children elements for the container.
 * @param {OntologyConcept} selectedOption Optional selected option description.
 * @param {string[]} labelStyles Optional styles for the label element.
 * @param redirectOptions Optional redirect options for adding a new entity or viewing an existing entity.
 */
export default function FormInputContainer(
  props: Readonly<FormInputContainerProps>
) {
  const labelClassNames: string = props.labelStyles?.join(" ");
  const label: string = props.field.name[VALUE_KEY];

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
        {props.redirectOptions?.addUrl && (
          <RedirectButton
            icon="add"
            url={props.redirectOptions.addUrl}
            isActive={false}
            className={styles["transparent-button"]}
            styling={{
              text: styles["transparent-button-text"],
            }}
          />
        )}
      </label>
      {props.children}
      {props.field.description[VALUE_KEY] != "" && (
        <div className={styles["info-text-container"]}>
          <p className={styles["info-text"]}>
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
          {props.redirectOptions?.view && (
            <ClickActionButton
              icon={"arrow_forward"}
              onClick={props.redirectOptions.view}
              className={styles["info-text-redirect-button"]}
            />
          )}
        </div>
      )}
      <FormErrorComponent error={props.error} />
    </>
  );
}

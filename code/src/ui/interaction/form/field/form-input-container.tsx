import { FieldError } from "react-hook-form";
import { Dictionary } from "types/dictionary";

import { OntologyConcept, PropertyShape, VALUE_KEY } from "types/form";
import ClickActionButton from "ui/interaction/action/click/click-button";
import RedirectButton from "ui/interaction/action/redirect/redirect-button";
import FormErrorComponent from "ui/text/error/form-error";
import { parseWordsForLabels } from "utils/client-utils";
import { useDictionary } from "hooks/useDictionary";
import { Icon } from "@mui/material";
import Tooltip from "ui/interaction/tooltip/tooltip";

export interface FormInputContainerProps {
  field: PropertyShape;
  error: FieldError;
  children: React.ReactNode;
  formatLabel?: string;
  labelStyles?: string[];
  selectedOption?: OntologyConcept;
  redirectOptions?: FormInputContainerRedirectOptions;
}

export interface FormInputContainerRedirectOptions {
  addUrl?: string;
  view?: React.MouseEventHandler<HTMLButtonElement>;
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
  const dict: Dictionary = useDictionary();

  const description =
    props.field.description[VALUE_KEY] != ""
      ? `${dict.title.description}: ${props.field.description[VALUE_KEY]}${
          props.selectedOption
            ? `\n\n${props.selectedOption?.label.value}: ${props.selectedOption?.description.value}`
            : ""
        }`
      : "";

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between  ">
        <label className={`${labelClassNames} `} htmlFor={props.field.fieldId}>
          <span className="text-lg font-semibold flex gap-4">
            {parseWordsForLabels(label)}
            {props.error && "*"}
            <Tooltip text={description} placement="right">
              <Icon className="material-symbols-outlined">{"info"}</Icon>
            </Tooltip>
          </span>
          {props.formatLabel && (
            <span className=" text-gray-600 text-sm">{props.formatLabel}</span>
          )}
        </label>
        <div className="flex items-center  gap-2">
          {props.redirectOptions?.addUrl && (
            <RedirectButton
              label="Add"
              icon="add"
              url={props.redirectOptions.addUrl}
              isActive={false}
            />
          )}
          {props.redirectOptions?.view && (
            <ClickActionButton
              icon="arrow_forward"
              label="View"
              onClick={props.redirectOptions.view}
            />
          )}
        </div>
      </div>
      <div>{props.children}</div>

      <FormErrorComponent error={props.error} />
    </>
  );
}

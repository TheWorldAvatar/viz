import { FieldError } from "react-hook-form";
import { FormType, FormTypeMap, OntologyConcept, PropertyShape, VALUE_KEY } from "types/form";
import FormErrorComponent from "ui/text/error/form-error";
import { parseWordsForLabels } from "utils/client-utils";
import { Icon } from "@mui/material";
import Tooltip from "ui/interaction/tooltip/tooltip";
import useFormSession from "hooks/form/useFormSession";

export interface FormInputContainerProps {
  field: PropertyShape;
  error: FieldError;
  children: React.ReactNode;
  formatLabel?: string;
  labelStyles?: string[];
  selectedOption?: OntologyConcept;
}

/**
 * This component acts as a container with duplicate elements for a form input.
 *
 * @param {PropertyShape} field The SHACL shape property for this field.
 * @param {FieldError} error A react-hook-form error object if an error is present.
 * @param {React.ReactNode} children Children elements for the container.
 * @param {string} formatLabel Optional format label texts.
 * @param {string[]} labelStyles Optional styles for the label element.
 * @param {OntologyConcept} selectedOption Optional selected option description.
 */
export default function FormInputContainer(
  props: Readonly<FormInputContainerProps>
) {
  const { formType } = useFormSession();

  if (formType === FormTypeMap.MASS_EDIT) {
    return props.children;
  }

  const labelClassNames: string = props.labelStyles?.join(" ");
  const label: string = props.field.name[VALUE_KEY];

  const description =
    props.field.description[VALUE_KEY] != ""
      ? `${props.field.description[VALUE_KEY]}${props.selectedOption
        ? `\n\n${props.selectedOption?.label.value}: ${props.selectedOption?.description.value}`
        : ""
      }`
      : "";

  return (
    <>
      <div className="flex flex-wrap items-center justify-between">
        <label className={`${labelClassNames} `} htmlFor={props.field.fieldId}>
          <span className="text-lg font-semibold flex items gap-1.5">
            {parseWordsForLabels(label)}
            {props.error && "*"}
            <Tooltip text={description} placement="right">
              <Icon className="material-symbols-outlined ">{"info"}</Icon>
            </Tooltip>
          </span>
          {props.formatLabel && (
            <span className="text-muted-foreground text-sm">{props.formatLabel}</span>
          )}
        </label>
      </div>
      <div>{props.children}</div>

      <FormErrorComponent error={props.error} />
    </>
  );
}

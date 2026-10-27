import useFormSession from "@/hooks/form/useFormSession";
import { FieldError } from "react-hook-form";
import { FormTypeMap, OntologyConcept, PropertyShape, VALUE_KEY } from "@/types/form";
import InfoHint from "@/ui/interaction/tooltip/info-hint";
import FormErrorComponent from "@/ui/text/error/form-error";
import { parseWordsForLabels } from "@/utils/client-utils";

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
    return <div onClick={(e) => e.stopPropagation()}>{props.children}</div>;
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
    <div className="flex flex-col w-full">
      <div className="flex flex-wrap items-center justify-between">
        <div className={labelClassNames}>
          <div className="flex items-center gap-1.5">
            <label className="text-lg font-semibold" htmlFor={props.field.fieldId}>
              {parseWordsForLabels(label)}
              {props.error && "*"}
            </label>
            <InfoHint text={description} />
          </div>
          {props.formatLabel && (
            <label className="block text-muted-foreground text-sm" htmlFor={props.field.fieldId}>
              {props.formatLabel}
            </label>
          )}
        </div>
      </div>
      <div>{props.children}</div>
      <FormErrorComponent error={props.error} />
    </div>
  );
}

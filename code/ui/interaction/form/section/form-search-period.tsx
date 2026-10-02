import { UseFormReturn } from "react-hook-form";

import { Dictionary } from "@/types/dictionary";
import { useDictionary } from '@/hooks/useDictionary';
import FormFieldComponent from "../field/form-field";
import { FORM_STATES } from "../form-utils";

interface FormSearchPeriodProps {
  form: UseFormReturn;
}

/**
 * This component renders a form section displaying the search period.
 *
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 */
export default function FormSearchPeriod(
  props: Readonly<FormSearchPeriodProps>
) {
  const dict: Dictionary = useDictionary();
  return (
    <fieldset className="border border-border px-4 pb-4 space-y-4">
      <legend className="px-1 font-bold text-sm">{dict.title.searchPeriod}</legend>
      <FormFieldComponent
        field={{
          "@id": "string",
          "@type": "http://www.w3.org/ns/shacl#PropertyShape",
          name: { "@value": "from" },
          fieldId: FORM_STATES.START_TIME_PERIOD,
          datatype: "dateTime",
          description: {
            "@value": dict.form.searchStartTimeDesc,
          },
          order: 0,
        }}
        form={props.form}
      />
      <FormFieldComponent
        field={{
          "@id": "string",
          "@type": "http://www.w3.org/ns/shacl#PropertyShape",
          name: { "@value": "to" },
          fieldId: FORM_STATES.END_TIME_PERIOD,
          datatype: "dateTime",
          description: {
            "@value": dict.form.searchEndTimeDesc,
          },
          order: 0,
        }}
        form={props.form}
      />
    </fieldset>
  );
}

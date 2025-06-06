import { useEffect, useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";

import { useDictionary } from "hooks/useDictionary";
import { Paths } from "io/config/routes";
import { Dictionary } from "types/dictionary";
import {
  FormFieldOptions,
  RegistryFieldValues,
  SEARCH_FORM_TYPE,
} from "types/form";
import LoadingSpinner from "ui/graphic/loader/spinner";
import SimpleSelector from "ui/interaction/dropdown/simple-selector";
import {
  extractResponseField,
  parseStringsForUrls,
  parseWordsForLabels,
} from "utils/client-utils";
import { sendGetRequest } from "utils/server-actions";
import FormCheckboxField from "../field/form-checkbox-field";
import FormFieldComponent from "../field/form-field";
import { FORM_STATES, getDefaultVal } from "../form-utils";
import Tooltip from "ui/interaction/tooltip/tooltip";
import { Icon } from "@mui/material";

interface FormScheduleProps {
  fieldId: string;
  agentApi: string;
  form: UseFormReturn;
  options?: FormFieldOptions;
}

export const daysOfWeek: string[] = [
  FORM_STATES.SUN,
  FORM_STATES.MON,
  FORM_STATES.TUES,
  FORM_STATES.WED,
  FORM_STATES.THURS,
  FORM_STATES.FRI,
  FORM_STATES.SAT,
];

/**
 * This component renders a form schedule as a form section.
 *
 * @param {string} fieldId Field name.
 * @param {string} agentApi The target agent endpoint for any registry related functionalities.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {FormFieldOptions} options Configuration options for the field.
 */
export default function FormSchedule(props: Readonly<FormScheduleProps>) {
  const formType: string = props.form.getValues(FORM_STATES.FORM_TYPE);
  const dict: Dictionary = useDictionary();
  const daysOfWeekLabel: string[] = [
    dict.form.sun,
    dict.form.mon,
    dict.form.tue,
    dict.form.wed,
    dict.form.thu,
    dict.form.fri,
    dict.form.sat,
  ];
  const singleService: string = dict.form.singleService;
  const regularService: string = dict.form.regularService;
  const alternateService: string = dict.form.alternateService;
  const isDisabledOption: { disabled: boolean } = {
    disabled: formType == Paths.REGISTRY || formType == Paths.REGISTRY_DELETE,
  };
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Define the state to store the selected value
  const [selectedServiceOption, setSelectedServiceOption] = useState<string>(
    props.form.getValues(FORM_STATES.RECURRENCE) == 0
      ? singleService
      : props.form.getValues(FORM_STATES.RECURRENCE) == -1
      ? alternateService
      : regularService
  );

  useEffect(() => {
    const getAndSetScheduleDefaults = async (): Promise<void> => {
      const response: string = await sendGetRequest(
        `${props.agentApi}/contracts/schedule/${props.form.getValues("id")}`
      );
      const jsonResponse: RegistryFieldValues = JSON.parse(response);

      // Retrieve recurrence and selected service option
      const recurrence: number = getDefaultVal(
        FORM_STATES.RECURRENCE,
        extractResponseField(jsonResponse, FORM_STATES.RECURRENCE, true).value,
        formType
      ) as number;
      setSelectedServiceOption(
        recurrence == 0
          ? singleService
          : recurrence == -1
          ? alternateService
          : regularService
      );
      props.form.setValue(FORM_STATES.RECURRENCE, recurrence);

      props.form.setValue(
        FORM_STATES.START_DATE,
        getDefaultVal(
          FORM_STATES.START_DATE,
          extractResponseField(
            jsonResponse,
            parseStringsForUrls(FORM_STATES.START_DATE),
            true
          ).value,
          formType
        )
      );
      props.form.setValue(
        FORM_STATES.END_DATE,
        getDefaultVal(
          FORM_STATES.END_DATE,
          extractResponseField(
            jsonResponse,
            parseStringsForUrls(FORM_STATES.END_DATE),
            true
          ).value,
          formType
        )
      );
      props.form.setValue(
        FORM_STATES.TIME_SLOT_START,
        getDefaultVal(
          FORM_STATES.TIME_SLOT_START,
          extractResponseField(jsonResponse, "start_time", true).value,
          formType
        )
      );
      props.form.setValue(
        FORM_STATES.TIME_SLOT_END,
        getDefaultVal(
          FORM_STATES.TIME_SLOT_END,
          extractResponseField(jsonResponse, "end_time", true).value,
          formType
        )
      );
      daysOfWeek.forEach((dayOfWeek) => {
        props.form.setValue(
          dayOfWeek,
          getDefaultVal(
            dayOfWeek,
            extractResponseField(jsonResponse, dayOfWeek, true).value,
            formType
          )
        );
      });
      setIsLoading(false);
    };
    if (formType == Paths.REGISTRY_ADD || formType == SEARCH_FORM_TYPE) {
      props.form.setValue(FORM_STATES.RECURRENCE, 1);
      setIsLoading(false);
    } else {
      getAndSetScheduleDefaults();
    }
  }, []);

  // Updates the service description whenever the service option changes
  const serviceDescription = useMemo((): string => {
    if (selectedServiceOption === singleService) {
      return dict.form.singleServiceDesc;
    } else if (selectedServiceOption === alternateService) {
      return dict.form.alternateServiceDesc;
    } else {
      return dict.form.regularServiceDesc;
    }
  }, [selectedServiceOption]);

  // Combined description for tooltip
  const combinedDescription = `${dict.title.description}: ${serviceDescription}`;

  // Handle change event for the select input
  const handleServiceChange = (value: string) => {
    if (value === singleService) {
      props.form.setValue(FORM_STATES.RECURRENCE, 0);
    } else if (value === alternateService) {
      props.form.setValue(FORM_STATES.RECURRENCE, -1);
    } else {
      props.form.setValue(FORM_STATES.RECURRENCE, 1);
    }
    setSelectedServiceOption(value);
  };

  return (
    <fieldset className="p-3 md:p-8 bg-background border-1 border-border rounded-lg m-4 space-y-4">
      <legend className="text-lg font-bold">
        {parseWordsForLabels(props.fieldId)}
      </legend>
      {isLoading && <LoadingSpinner isSmall={true} />}
      {!isLoading && (
        <>
          <div className="flex flex-col w-full gap-4">
            <label
              className="text-lg font-bold flex gap-4"
              htmlFor="select-input"
            >
              {dict.title.serviceType}
              <Tooltip text={combinedDescription} placement="right">
                <Icon className="material-symbols-outlined">{"info"}</Icon>
              </Tooltip>
            </label>
            <SimpleSelector
              options={[
                { label: singleService, value: singleService },
                { label: regularService, value: regularService },
                { label: alternateService, value: alternateService },
              ]}
              defaultVal={selectedServiceOption}
              onChange={(selectedOption) => {
                if (selectedOption && "value" in selectedOption) {
                  handleServiceChange(selectedOption?.value);
                }
              }}
              isDisabled={
                formType == Paths.REGISTRY || formType == Paths.REGISTRY_DELETE
              }
            />
          </div>
          <FormFieldComponent
            field={{
              "@id": "string",
              "@type": "http://www.w3.org/ns/shacl#PropertyShape",
              name: { "@value": FORM_STATES.START_DATE },
              fieldId: FORM_STATES.START_DATE,
              datatype: "date",
              description: { "@value": dict.form.startDateDesc },
              order: 0,
            }}
            form={props.form}
            options={isDisabledOption}
          />
          {selectedServiceOption != singleService && (
            <FormFieldComponent
              field={{
                "@id": "string",
                "@type": "http://www.w3.org/ns/shacl#PropertyShape",
                name: { "@value": FORM_STATES.END_DATE },
                fieldId: FORM_STATES.END_DATE,
                datatype: "date",
                description: { "@value": dict.form.endDateDesc },
                order: 0,
              }}
              form={props.form}
              options={isDisabledOption}
            />
          )}
          {selectedServiceOption === regularService && (
            <div className="w-full mt-6 ">
              <div>
                <span className="text-lg">{dict.form.repeatEvery}</span>
                <input
                  id={FORM_STATES.RECURRENCE}
                  type={"number"}
                  disabled={props.options?.disabled}
                  className={`w-12 text-center mx-4 p-2 bg-background text-foreground border-1 border-border rounded-lg ${
                    props.options?.disabled && "cursor-not-allowed"
                  }`}
                  step={"1"}
                  readOnly={
                    formType == Paths.REGISTRY ||
                    formType == Paths.REGISTRY_DELETE
                  }
                  aria-label={FORM_STATES.RECURRENCE}
                  {...props.form.register(FORM_STATES.RECURRENCE)}
                />
                <span className="text-lg">{dict.form.week}</span>
              </div>
              <div className="flex justify-center items-center flex-wrap gap-4 mb-10 mt-10 ">
                {daysOfWeek.map((dayOfWeek, index) => {
                  return (
                    <FormCheckboxField
                      key={dayOfWeek + index}
                      field={dayOfWeek}
                      label={daysOfWeekLabel[index]}
                      form={props.form}
                      options={isDisabledOption}
                    />
                  );
                })}
              </div>
            </div>
          )}
          <div className="w-full mt-8 ">
            <h1 className="text-xl font-bold mb-2">{dict.form.timeSlot}</h1>
            <FormFieldComponent
              field={{
                "@id": "string",
                "@type": "http://www.w3.org/ns/shacl#PropertyShape",
                name: { "@value": "from" },
                fieldId: FORM_STATES.TIME_SLOT_START,
                datatype: "time",
                description: { "@value": dict.form.fromTimeSlotDesc },
                order: 0,
              }}
              form={props.form}
              options={isDisabledOption}
            />
            <FormFieldComponent
              field={{
                "@id": "string",
                "@type": "http://www.w3.org/ns/shacl#PropertyShape",
                name: { "@value": "to" },
                fieldId: FORM_STATES.TIME_SLOT_END,
                datatype: "time",
                description: { "@value": dict.form.toTimeSlotDesc },
                order: 1,
              }}
              form={props.form}
              options={isDisabledOption}
            />
          </div>
        </>
      )}
    </fieldset>
  );
}

import { useEffect, useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";

import { Icon } from "@mui/material";
import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import { FormFieldOptions, FormType, FormTypeMap, RegistryFieldValues } from "types/form";
import LoadingSpinner from "ui/graphic/loader/spinner";
import SimpleSelector from "ui/interaction/dropdown/simple-selector";
import DateInput from "ui/interaction/input/date-input";
import Tooltip from "ui/interaction/tooltip/tooltip";
import {
  extractResponseField,
  extractResponseFieldArray,
  parseStringsForUrls,
  parseWordsForLabels,
} from "utils/client-utils";
import { makeInternalRegistryAPIwithParams } from "utils/internal-api-services";
import FormCheckboxField from "../field/form-checkbox-field";
import FormFieldComponent from "../field/form-field";
import { FORM_STATES, getDefaultVal } from "../form-utils";
import SelectedDatesDisplay from "./selected-dates-display";

interface FormScheduleProps {
  fieldId: string;
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
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 * @param {FormFieldOptions} options Configuration options for the field.
 */
export default function FormSchedule(props: Readonly<FormScheduleProps>) {
  const formType: FormType = props.form.getValues(FORM_STATES.FORM_TYPE);
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
  const perpetualService: string = dict.form.perpetualService;
  const fixedService: string = dict.form.fixedService;
  const isDisabledOption: { disabled: boolean } = {
    disabled: formType == FormTypeMap.VIEW || formType == FormTypeMap.DELETE,
  };
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fixedDates, setFixedDates] = useState<Date[]>([new Date()]);
  // Define the state to store the selected value
  const [selectedServiceOption, setSelectedServiceOption] = useState<string>(
    props.form.getValues(FORM_STATES.ENTRY_DATES)?.length > 0
      ? fixedService
      : props.form.getValues(FORM_STATES.RECURRENCE) == null
        ? perpetualService
        : props.form.getValues(FORM_STATES.RECURRENCE) > 0
          ? regularService
          : props.form.getValues(FORM_STATES.RECURRENCE) == -1
            ? alternateService
            : singleService
  );

    // Sync fixedDates with form's entry_date values (loaded from storage)
    useEffect(() => {
      const formEntryDates = props.form.getValues(FORM_STATES.ENTRY_DATES);
      if (Array.isArray(formEntryDates) && formEntryDates.length > 0) {
        // Ensure all items are Date objects
        const validDates = formEntryDates.filter((date) => date instanceof Date);
        if (validDates.length > 0) {
          setFixedDates(validDates);
          setSelectedServiceOption(fixedService);
        }
      }
    }, [props.form.formState.isLoading]);

  useEffect(() => {
    const getAndSetScheduleDefaults = async (): Promise<void> => {
      // Set defaults
      let recurrence: number = 0;
      let defaultTimeSlotStart: string = "00:00";
      let defaultTimeSlotEnd: string = "23:59";

      // Fetch existing values and update them according
      if (formType != FormTypeMap.ADD && formType != FormTypeMap.SEARCH) {
        const fields: RegistryFieldValues = await fetch(
          makeInternalRegistryAPIwithParams(
            "schedule",
            props.form.getValues("id")
          ),
          {
            cache: "no-store",
            credentials: "same-origin",
          }
        ).then((res) => res.json());

        // Check if this is a fixed service (has entry_date field)
        const entryDates = extractResponseFieldArray(
          fields,
          FORM_STATES.ENTRY_DATES
        );
        if (entryDates.length > 0) {
          // This is a fixed service - extract dates
          const parsedDates: Date[] = entryDates
            .filter((entry) => entry?.value)
            .map((entry) => new Date(entry.value));
          setFixedDates(parsedDates);
          setSelectedServiceOption(fixedService);
          props.form.setValue(FORM_STATES.ENTRY_DATES, parsedDates);
        } else {
          // Retrieve recurrence and selected service option
          recurrence = getDefaultVal(
            FORM_STATES.RECURRENCE,
            extractResponseField(fields, FORM_STATES.RECURRENCE, true)?.value,
            formType
          ) as number;
          setSelectedServiceOption(
            recurrence == null
              ? perpetualService
              : recurrence == 0
                ? singleService
                : recurrence == -1
                  ? alternateService
                  : regularService
          );
        }

        defaultTimeSlotStart = getDefaultVal(
          FORM_STATES.TIME_SLOT_START,
          extractResponseField(fields, "start_time", true)?.value,
          formType
        ).toString();

        defaultTimeSlotEnd = getDefaultVal(
          FORM_STATES.TIME_SLOT_END,
          extractResponseField(fields, "end_time", true)?.value,
          formType
        ).toString();

        props.form.setValue(
          FORM_STATES.START_DATE,
          getDefaultVal(
            FORM_STATES.START_DATE,
            extractResponseField(
              fields,
              parseStringsForUrls(FORM_STATES.START_DATE),
              true
            )?.value,
            formType
          )
        );
        props.form.setValue(
          FORM_STATES.END_DATE,
          getDefaultVal(
            FORM_STATES.END_DATE,
            extractResponseField(
              fields,
              parseStringsForUrls(FORM_STATES.END_DATE),
              true
            )?.value,
            formType
          )
        );

        daysOfWeek.forEach((dayOfWeek) => {
          props.form.setValue(
            dayOfWeek,
            getDefaultVal(
              dayOfWeek,
              extractResponseField(fields, dayOfWeek, true)?.value,
              formType
            )
          );
        });
      }

      props.form.setValue(FORM_STATES.RECURRENCE, recurrence);
      props.form.setValue(FORM_STATES.TIME_SLOT_START, defaultTimeSlotStart);
      props.form.setValue(FORM_STATES.TIME_SLOT_END, defaultTimeSlotEnd);

      setIsLoading(false);
    };

    getAndSetScheduleDefaults();
  }, []);

  // Updates the service description whenever the service option changes
  const serviceDescription = useMemo((): string => {
    if (selectedServiceOption === perpetualService) {
      return dict.form.perpetualServiceDesc;
    } else if (selectedServiceOption === singleService) {
      return dict.form.singleServiceDesc;
    } else if (selectedServiceOption === alternateService) {
      return dict.form.alternateServiceDesc;
    } else if (selectedServiceOption === fixedService) {
      return dict.form.fixedServiceDesc;
    } else {
      return dict.form.regularServiceDesc;
    }
  }, [selectedServiceOption]);

  // Handle change event for the select input
  const handleServiceChange = (value: string) => {
    if (value === fixedService) {
      // Ensure at least today's date is set for fixed service
      const datesToSet: Date[] = fixedDates.length > 0 ? fixedDates : [new Date()];
      if (fixedDates.length === 0) setFixedDates(datesToSet);
      props.form.setValue(FORM_STATES.ENTRY_DATES, datesToSet);
    } else {
      // Clear entry dates for all non-fixed services
      props.form.setValue(FORM_STATES.ENTRY_DATES, undefined);

      if (value === perpetualService) {
        props.form.setValue(FORM_STATES.RECURRENCE, null);
      } else if (value === singleService) {
        props.form.setValue(FORM_STATES.RECURRENCE, 0);
      } else if (value === alternateService) {
        props.form.setValue(FORM_STATES.RECURRENCE, -1);
      } else {
        props.form.setValue(FORM_STATES.RECURRENCE, 1);
      }
    }
    setSelectedServiceOption(value);
  };

  // Wrapper to sync fixedDates with form state
  const handleFixedDatesChange: React.Dispatch<React.SetStateAction<Date[]>> = (value) => {
    const newDates = typeof value === "function" ? value(fixedDates) : value;
    setFixedDates(newDates);
    props.form.setValue(FORM_STATES.ENTRY_DATES, newDates);
  };


  return (
    <div className="p-3 md:p-8 bg-background border-2 md:border-1 border-border rounded-lg my-4 mx-auto space-y-4">
      <h2 className="text-xl md:text-2xl  font-bold">
        {parseWordsForLabels(props.fieldId)}
      </h2>
      {isLoading && <LoadingSpinner isSmall={true} />}
      {!isLoading && (
        <>
          <div className="flex flex-col w-full gap-4">
            <label
              className="text-lg font-bold flex gap-2"
              htmlFor="select-input"
            >
              {parseWordsForLabels(dict.title.scheduleType)}
              <Tooltip text={serviceDescription} placement="right">
                <Icon className="material-symbols-outlined">{"info"}</Icon>
              </Tooltip>
            </label>
            <SimpleSelector
              options={[
                { label: singleService, value: singleService },
                { label: regularService, value: regularService },
                { label: alternateService, value: alternateService },
                { label: perpetualService, value: perpetualService },
                { label: fixedService, value: fixedService },
              ]}
              defaultVal={selectedServiceOption}
              onChange={(selectedOption) => {
                if (selectedOption && "value" in selectedOption) {
                  handleServiceChange(selectedOption?.value);
                }
              }}
              isDisabled={formType == FormTypeMap.VIEW || formType == FormTypeMap.DELETE}
            />
          </div>
          {selectedServiceOption === fixedService && (
            <div className="flex flex-col w-full gap-4">
              <label className="text-lg font-bold flex gap-4">
                {dict.form.selectDates}
                <Tooltip text={dict.form.selectDatesDesc} placement="right">
                  <Icon className="material-symbols-outlined">{"info"}</Icon>
                </Tooltip>
              </label>
              <DateInput
                mode="multiple"
                selectedDate={fixedDates}
                setSelectedDates={handleFixedDatesChange}
                disabled={formType === FormTypeMap.VIEW || formType === FormTypeMap.DELETE}
              />
              {fixedDates.length > 0 && (
                <SelectedDatesDisplay
                  dates={fixedDates}
                  onDatesChange={handleFixedDatesChange}
                  disabled={formType === FormTypeMap.VIEW || formType === FormTypeMap.DELETE}
                />
              )}
            </div>
          )}
          {selectedServiceOption !== fixedService && (
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
          )}
          {selectedServiceOption != singleService &&
            selectedServiceOption != perpetualService &&
            selectedServiceOption != fixedService && (
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
                  className={`w-12 text-center mx-4 p-2 bg-background text-foreground border-1 border-border rounded-lg ${props.options?.disabled && "cursor-not-allowed"
                    }`}
                  step={"1"}
                  readOnly={formType == FormTypeMap.VIEW || formType == FormTypeMap.DELETE}
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
          <div className="w-full mt-8">
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
    </div>
  );
}

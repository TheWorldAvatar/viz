import { usePathname, useRouter } from "next/navigation";
import React, { ReactNode, useState } from "react";
import { FieldValues, useForm, UseFormReturn } from "react-hook-form";
import { useDispatch } from "react-redux";

import { useDictionary } from "hooks/useDictionary";
import { setFilterFeatureIris, setFilterTimes } from "state/map-feature-slice";
import { AgentResponseBody } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import {
  FormTemplateType,
  FormType,
  ID_KEY,
  PROPERTY_GROUP_TYPE,
  PROPERTY_SHAPE_TYPE,
  PropertyGroup,
  PropertyShape,
  PropertyShapeOrGroup,
  TYPE_KEY,
  VALUE_KEY,
} from "types/form";
import LoadingSpinner from "ui/graphic/loader/spinner";
import { getAfterDelimiter } from "utils/client-utils";
import { makeInternalRegistryAPIwithParams } from "utils/internal-api-services";
import FormArray from "./field/array/array";
import FormFieldComponent from "./field/form-field";
import { FORM_STATES, parseBranches, parsePropertyShapeOrGroupList } from "./form-utils";
import BranchFormSection from "./section/branch-form-section";
import { DependentFormSection } from "./section/dependent-form-section";
import FormGeocoder from "./section/form-geocoder";
import FormSchedule, { daysOfWeek } from "./section/form-schedule";
import FormSearchPeriod from "./section/form-search-period";
import FormSection from "./section/form-section";

import { toast } from "ui/interaction/action/toast/toast";

interface FormComponentProps {
  formRef: React.RefObject<HTMLFormElement>;
  formType: FormType;
  entityType: string;
  id?: string;
  primaryInstance?: string;
  isPrimaryEntity?: boolean;
  additionalFields?: PropertyShapeOrGroup[];
  setShowSearchModalState?: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * This component renders a dynamic form component that generates inputs based on its inputs.
 *
 * @param { React.MutableRefObject<HTMLFormElement>} formRef Reference to the form element.
 * @param {FormType} formType The type of submission based on enum.
 * @param {string} entityType The type of entity.
 * @param {string} id An optional identifier input.
 * @param {string} primaryInstance An optional instance for the primary entity.
 * @param {boolean} isPrimaryEntity An optional indicator if the form is targeting a primary entity.
 * @param {PropertyShapeOrGroup[]} additionalFields Additional form fields to render if required.
 * @param setShowSearchModalState An optional dispatch method to close the search modal after a successful search.
 */
export function FormComponent(props: Readonly<FormComponentProps>) {
  const id: string = props.id ?? getAfterDelimiter(usePathname(), "/");
  const router = useRouter();
  const dispatch = useDispatch();
  const dict: Dictionary = useDictionary();
  const [formTemplate, setFormTemplate] = useState<FormTemplateType>(null);

  // Sets the default value with the requested function call
  const form: UseFormReturn = useForm({
    defaultValues: async (): Promise<FieldValues> => {
      // All forms will require an ID to be assigned
      const initialState: FieldValues = {
        formType: props.formType, // Store form type for easy access and reduce need to pass parameters to child
        id: id,
      };
      // Retrieve template from APIs
      let template: FormTemplateType;
      // For add form, get a blank template
      if (props.formType == "add" || props.formType == "search") {
        template = await fetch(
          makeInternalRegistryAPIwithParams("form", props.entityType),
          {
            cache: "no-store",
            credentials: "same-origin",
          }
        ).then(async (res) => {
          const body: AgentResponseBody = await res.json();
          return body.data?.items?.[0] as FormTemplateType;
        });
      } else {
        // For edit and view, get template with values
        template = await fetch(
          makeInternalRegistryAPIwithParams("form", props.entityType, id),
          {
            cache: "no-store",
            credentials: "same-origin",
          }
        ).then(async (res) => {
          const body: AgentResponseBody = await res.json();
          return body.data?.items?.[0] as FormTemplateType;
        });
      }
      if (props.additionalFields) {
        props.additionalFields.forEach((field) =>
          template.property.push(field)
        );
      }

      if (props.formType == "add") {
        const hasScheduleField: boolean = template.property.some(
          (field) =>
            (field as PropertyShape)?.class?.[ID_KEY] ===
            "https://spec.edmcouncil.org/fibo/ontology/FND/DatesAndTimes/FinancialDates/RegularSchedule"
        );

        if (hasScheduleField) {
          initialState.recurrence = 0;
        }
      }

      setFormTemplate({
        ...template,
        node: parseBranches(initialState, template.node, props.formType != "add"),
        property: parsePropertyShapeOrGroupList(initialState, template.property),
      });
      return initialState;
    },
  });

  // A function to initiate the form submission process
  const onSubmit = form.handleSubmit(async (formData: FieldValues) => {
    let pendingResponse: AgentResponseBody;
    // For perpetual service
    if (formData[FORM_STATES.RECURRENCE] == null) {
      formData = {
        ...formData,
        recurrence: "",
        "end date": "",
      };
      // For single service
    } else if (formData[FORM_STATES.RECURRENCE] == 0) {
      const startDate: string = formData[FORM_STATES.START_DATE];
      const dateObject: Date = new Date(startDate);
      const dayOfWeek = daysOfWeek[dateObject.getUTCDay()];

      formData = {
        ...formData,
        recurrence: "P1D",
        "end date": startDate, // End date must correspond to start date
        [dayOfWeek]: true, // Ensure the corresponding day of week is true
      };
      // For alternate day service
    } else if (formData[FORM_STATES.RECURRENCE] == -1) {
      formData = {
        ...formData,
        recurrence: "P2D",
      };
      // For regular service
    } else if (formData[FORM_STATES.RECURRENCE]) {
      formData = {
        ...formData,
        recurrence: `P${formData[FORM_STATES.RECURRENCE] * 7}D`,
      };
    }

    // Remove form type state before sending to backend
    delete formData[FORM_STATES.FORM_TYPE];

    switch (props.formType) {
      case "add": {
        // Add entity via API route
        const res = await fetch(
          makeInternalRegistryAPIwithParams("instances", props.entityType),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            credentials: "same-origin",
            body: JSON.stringify({ ...formData }),
          }
        );
        pendingResponse = await res.json();

        // For registry's primary entity, a draft lifecycle must also be generated
        if (props.isPrimaryEntity && res.ok) {
          const draftRes = await fetch(
            makeInternalRegistryAPIwithParams("instances", "contracts/draft"),
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              cache: "no-store",
              credentials: "same-origin",
              body: JSON.stringify({
                contract: pendingResponse.data?.id,
                ...formData,
              }),
            }
          );
          pendingResponse = await draftRes.json();
        }
        break;
      }
      case "delete": {
        // Delete entity via API route
        const res = await fetch(
          makeInternalRegistryAPIwithParams(
            "instances",
            props.entityType,
            "false",
            formData[FORM_STATES.ID]
          ),
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            credentials: "same-origin",
          }
        );
        pendingResponse = await res.json();
        break;
      }
      case "edit": {
        // Update entity via API route
        const res = await fetch(
          makeInternalRegistryAPIwithParams(
            "instances",
            props.entityType,
            "false",
            formData.id
          ),
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            credentials: "same-origin",
            body: JSON.stringify(formData),
          }
        );
        pendingResponse = await res.json();

        if (props.isPrimaryEntity && res.ok) {
          const draftRes = await fetch(
            makeInternalRegistryAPIwithParams("instances", "contracts/draft"),
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              cache: "no-store",
              credentials: "same-origin",
              body: JSON.stringify({
                ...formData,
                contract: props.primaryInstance,
              }),
            }
          );
          pendingResponse = await draftRes.json();
        }
        break;
      }
      case "search": {
        Object.keys(formData).forEach((field) => {
          if (
            Object.prototype.hasOwnProperty.call(formData, `min ${field}`) &&
            Object.prototype.hasOwnProperty.call(formData, `max ${field}`) &&
            (formData[`min ${field}`] != undefined ||
              formData[`max ${field}`] != undefined)
          ) {
            formData = {
              ...formData,
              [field]: "range",
            };
          }
        });

        const res = await fetch(
          makeInternalRegistryAPIwithParams(
            "instances",
            props.entityType,
            "false",
            "search"
          ),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            credentials: "same-origin",
            body: JSON.stringify({
              ...formData,
            }),
          }
        );
        pendingResponse = await res.json();

        if (res.ok) {
          if (pendingResponse.data?.items?.length === 0) {
            pendingResponse.data.message = dict.message.noMatchFeature;
          } else {
            dispatch(
              setFilterFeatureIris(pendingResponse.data?.items as string[])
            );
            pendingResponse.data.message = dict.message.matchedFeatures;
          }

          if (
            formData[FORM_STATES.START_TIME_PERIOD] &&
            formData[FORM_STATES.END_TIME_PERIOD]
          ) {
            // Only display this message if there is no features based on static meta data but the search period is required
            if (pendingResponse.data?.items?.length === 0) {
              pendingResponse.data.message = dict.message.noMatchMetaWithTime;
            }
            // Convert date to UNIX Epoch Timestamp
            const startTime: number = Math.floor(
              new Date(formData[FORM_STATES.START_TIME_PERIOD]).getTime() / 1000
            );
            const endTime: number = Math.floor(
              new Date(formData[FORM_STATES.END_TIME_PERIOD]).getTime() / 1000
            );
            dispatch(setFilterTimes([startTime, endTime]));
          }
        }
        break;
      }
      default:
        break;
    }
    toast(
      pendingResponse?.data?.message || pendingResponse?.error?.message,
      pendingResponse?.error ? "error" : "success"
    );
    if (!pendingResponse?.error) {
      setTimeout(() => {
        // Close search modal on success
        if (props.formType === "search") {
          props.setShowSearchModalState(false);
        } else {
          // Redirect back for other types (add and edit) as users will want to see their changes
          router.back();
        }
      }, 2000);
    }
  });

  return (
    <form ref={props.formRef} onSubmit={onSubmit}>
      {form.formState.isLoading && <LoadingSpinner isSmall={false} />}
      {!form.formState.isLoading &&
        renderFormField(
          props.entityType,
          formTemplate.property.find(
            (node) =>
              node[TYPE_KEY].includes(PROPERTY_SHAPE_TYPE) &&
              (node as PropertyShape).name[VALUE_KEY] === "id"
          ),
          form,
          -1
        )}
      {!form.formState.isLoading && formTemplate.node?.length > 0 && (
        <BranchFormSection
          entityType={props.entityType}
          node={formTemplate.node}
          form={form}
        />
      )}
      {!form.formState.isLoading &&
        formTemplate.property
          .filter(
            (node) =>
              !(
                node[TYPE_KEY].includes(PROPERTY_SHAPE_TYPE) &&
                (node as PropertyShape).name[VALUE_KEY] === "id"
              )
          )
          .map((field, index) =>
            renderFormField(props.entityType, field, form, index)
          )}
    </form>
  );
}

/**
 * Renders a form field based on the provided field configuration.
 *
 * This function dynamically generates the appropriate form field component (e.g., text input, dropdown, etc.)
 * based on the structure of the `field` parameter.
 *
 * @param entityType The type of entity being edited.
 * @param field      The configuration object defining the form field.
 * @param form       A `react-hook-form` object providing methods and state for managing the form.
 * @param currentIndex An index used to generate a unique key for the rendered form field element.
 */
export function renderFormField(
  entityType: string,
  field: PropertyShapeOrGroup,
  form: UseFormReturn,
  currentIndex: number
): ReactNode {
  const formType: FormType = form.getValues(FORM_STATES.FORM_TYPE);
  const disableAllInputs: boolean =
    formType === "view" || formType === "delete";

  if (field[TYPE_KEY].includes(PROPERTY_GROUP_TYPE)) {
    const fieldset: PropertyGroup = field as PropertyGroup;

    return (
      <FormSection
        key={fieldset[ID_KEY] + currentIndex}
        entityType={entityType}
        group={fieldset}
        form={form}
        options={{
          disabled: disableAllInputs,
        }}
      />
    );
  } else {
    const fieldProp: PropertyShape = field as PropertyShape;
    // If this is a hidden field, hide the field
    if (fieldProp.maxCount && parseInt(fieldProp.maxCount[VALUE_KEY]) === 0) {
      return;
    }
    const disableId: boolean =
      formType === "edit" && fieldProp.name[VALUE_KEY] === FORM_STATES.ID
        ? true
        : disableAllInputs;
    // Use form array when multiple values is possible for the same property ie no max count or at least more than 1 value
    if (
      !fieldProp.maxCount ||
      (fieldProp.maxCount && parseInt(fieldProp.maxCount?.[VALUE_KEY]) > 1)
    ) {
      return (
        <FormArray
          key={fieldProp.name[VALUE_KEY] + currentIndex}
          fieldId={fieldProp.name[VALUE_KEY]}
          minSize={parseInt(fieldProp.minCount?.[VALUE_KEY])}
          maxSize={parseInt(fieldProp.maxCount?.[VALUE_KEY])}
          fieldConfigs={[fieldProp]}
          form={form}
          options={{
            disabled: disableAllInputs,
          }}
        />
      );
    }
    if (fieldProp.class) {
      if (
        fieldProp.class[ID_KEY] ===
        "https://spec.edmcouncil.org/fibo/ontology/FND/DatesAndTimes/FinancialDates/RegularSchedule"
      ) {
        return (
          <FormSchedule
            key={fieldProp.name[VALUE_KEY] + currentIndex}
            fieldId={fieldProp.name[VALUE_KEY]}
            form={form}
            options={{
              disabled: disableAllInputs,
            }}
          />
        );
      }
      if (
        fieldProp.class[ID_KEY] ===
        "https://spec.edmcouncil.org/fibo/ontology/FND/Places/Locations/PhysicalLocation"
      ) {
        return (
          <FormGeocoder
            key={fieldProp.name[VALUE_KEY] + currentIndex}
            field={fieldProp}
            form={form}
          />
        );
      }
      if (
        formType === "search" &&
        fieldProp.class[ID_KEY] ===
        "https://www.theworldavatar.com/kg/ontotimeseries/TimeSeries"
      ) {
        return (
          <FormSearchPeriod
            key={fieldProp.name[VALUE_KEY] + currentIndex}
            form={form}
          />
        );
      }
      return (
        <DependentFormSection
          key={fieldProp.name[VALUE_KEY] + currentIndex}
          dependentProp={fieldProp}
          form={form}
        />
      );
    }
    return (
      <FormFieldComponent
        key={fieldProp.name[VALUE_KEY] + currentIndex}
        field={fieldProp}
        form={form}
        options={{
          disabled: disableId,
        }}
      />
    );
  }
}

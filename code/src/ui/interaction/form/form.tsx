import { usePathname, useRouter } from "next/navigation";
import React, { ReactNode, useState } from "react";
import { FieldValues, useForm, UseFormReturn } from "react-hook-form";
import { useDispatch } from "react-redux";

import { useDictionary } from "hooks/useDictionary";
import { setFilterFeatureIris, setFilterTimes } from "state/map-feature-slice";
import { AgentResponseBody, InternalApiIdentifierMap } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import {
  BillingEntityTypes,
  FormTemplateType,
  FormType,
  FormTypeMap,
  ID_KEY,
  LifecycleStageMap,
  PROPERTY_GROUP_TYPE,
  PROPERTY_SHAPE_TYPE,
  PropertyGroup,
  PropertyShape,
  PropertyShapeOrGroup,
  TYPE_KEY,
  VALUE_KEY,
} from "types/form";
import { buildUrl, getAfterDelimiter, getId, getNormalizedDate } from "utils/client-utils";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";
import FormArray from "./field/array/array";
import FormFieldComponent from "./field/form-field";
import { FORM_STATES, parseBranches, parsePropertyShapeOrGroupList } from "./form-utils";
import BranchFormSection from "./section/branch-form-section";
import { DependentFormSection } from "./section/dependent-form-section";
import FormGeocoder from "./section/form-geocoder";
import FormSchedule, { daysOfWeek } from "./section/form-schedule";
import FormSearchPeriod from "./section/form-search-period";
import FormSection from "./section/form-section";

import useOperationStatus from "hooks/useOperationStatus";
import { Routes } from "io/config/routes";
import { browserStorageManager } from "state/browser-storage-manager";
import { closeDrawer } from "state/drawer-component-slice";
import { toast } from "ui/interaction/action/toast/toast";
import { EVENT_KEY } from "utils/constants";
import FormSkeleton from "./skeleton/form-skeleton";

interface FormComponentProps {
  formRef: React.RefObject<HTMLFormElement>;
  formType: FormType;
  entityType: string;
  id?: string;
  primaryInstance?: string;
  accountType?: string;
  pricingType?: string;
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
 * @param {string} accountType Optionally indicates the type of account.
 * @param {string} pricingType Optionally indicates the type of pricing.
 * @param {boolean} isPrimaryEntity An optional indicator if the form is targeting a primary entity.
 * @param {PropertyShapeOrGroup[]} additionalFields Additional form fields to render if required.
 * @param setShowSearchModalState An optional dispatch method to close the search modal after a successful search.
 */
export function FormComponent(props: Readonly<FormComponentProps>) {
  const id: string = props.id ?? getAfterDelimiter(usePathname(), "/");
  const router = useRouter();
  const dispatch = useDispatch();
  const dict: Dictionary = useDictionary();
  const { startLoading, stopLoading } = useOperationStatus();
  const [formTemplate, setFormTemplate] = useState<FormTemplateType>(null);
  const [billingParams, setBillingParams] = useState<BillingEntityTypes>(null);

  // Sets the default value with the requested function call
  const form: UseFormReturn = useForm({
    defaultValues: async (): Promise<FieldValues> => {
      // All forms will require an ID to be assigned
      const initialState: FieldValues = {
        formType: props.formType, // Store form type for easy access and reduce need to pass parameters to child
        id: id,
      };
      // Retrieve template from APIs
      let url: string;
      // For add form, get a blank template
      if (props.formType == FormTypeMap.ADD || props.formType == FormTypeMap.SEARCH ||
        props.formType == FormTypeMap.ADD_BILL || props.formType == FormTypeMap.ADD_PRICE) {
        url = makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.FORM, props.entityType);
      } else if (props.formType == FormTypeMap.ASSIGN_PRICE || props.formType == FormTypeMap.ADD_INVOICE) {
        url = makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.FORM, props.formType, id);
      } else {
        // For edit and view, get template with values
        url =
          makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.FORM, props.entityType, id);
      }
      const body: AgentResponseBody = await queryInternalApi(url);
      const template: FormTemplateType = body.data?.items?.[0] as FormTemplateType;
      if (!template) {
        return initialState;
      }

      if (props.additionalFields) {
        props.additionalFields.forEach((field) =>
          template.property.push(field)
        );
      }

      if (props.formType == FormTypeMap.ADD) {
        const hasScheduleField: boolean = template.property.some(
          (field) =>
            (field as PropertyShape)?.class?.[ID_KEY] ===
            "https://spec.edmcouncil.org/fibo/ontology/FND/DatesAndTimes/FinancialDates/RegularSchedule"
        );

        if (hasScheduleField) {
          initialState[FORM_STATES.RECURRENCE] = 0;
        }
      }
      const billingParamsStore: BillingEntityTypes = {
        account: props.accountType,
        accountField: props.accountType,
        pricing: props.pricingType,
        pricingField: props.pricingType
      };
      setFormTemplate({
        ...template,
        node: parseBranches(initialState, template.node, props.formType != FormTypeMap.ADD, billingParamsStore),
        property: parsePropertyShapeOrGroupList(initialState, template.property, billingParamsStore),
      });
      setBillingParams(billingParamsStore)
      return initialState;
    },
  });

  // A function to initiate the form submission process
  const onSubmit = form.handleSubmit(async (formData: FieldValues) => {
    startLoading();
    let pendingResponse: AgentResponseBody;

    // Check for fixed service (has entry_dates)
    const entryDates: Date[] | undefined = formData[FORM_STATES.ENTRY_DATES];
    if (entryDates?.length > 0) {
      // Sort dates to find earliest and latest
      const sortedDates: Date[] = [...entryDates].sort((a, b) => a.getTime() - b.getTime());

      formData = {
        ...formData,
        "schedule entry": entryDates.map((date) => ({
          "schedule entry date": getNormalizedDate(date),
        })),
        "start date": getNormalizedDate(sortedDates[0]),
        "end date": getNormalizedDate(sortedDates.at(-1)),
        recurrence: "",
      };
      // Remove the internal fields
      delete formData[FORM_STATES.ENTRY_DATES];
      delete formData[FORM_STATES.RECURRENCE];
    } else if (formData[FORM_STATES.RECURRENCE] == null) {
      // For perpetual service
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
    // Ensure entry_dates is removed if not used
    delete formData[FORM_STATES.ENTRY_DATES];

    switch (props.formType) {
      case FormTypeMap.ADD: {
        // Add entity via API route
        pendingResponse = await queryInternalApi(
          makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.INSTANCES, props.entityType),
          "POST",
          JSON.stringify(formData));

        // For registry's primary entity, a draft lifecycle must also be generated
        if (props.isPrimaryEntity && !pendingResponse.error) {
          pendingResponse = await queryInternalApi(
            makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.INSTANCES, "contracts/draft"),
            "POST",
            JSON.stringify({
              contract: pendingResponse.data?.id,
              ...formData,
            }));
          if (!pendingResponse.error && formData[billingParams.pricingField]) {
            pendingResponse = await queryInternalApi(
              makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.BILL, FormTypeMap.ASSIGN_PRICE),
              "PUT",
              JSON.stringify({
                ...formData,
                pricing: formData[billingParams.pricingField],
                contract: pendingResponse.data?.id,
              }));
          }
        }
        break;
      }
      case FormTypeMap.ADD_BILL: {
        formData["type"] = props.entityType;
        pendingResponse = await queryInternalApi(
          makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.BILL, LifecycleStageMap.ACCOUNT),
          "POST",
          JSON.stringify(formData));
        break;
      }
      case FormTypeMap.ADD_PRICE: {
        formData["type"] = props.entityType;
        formData["account"] = decodeURIComponent(getId(formData[billingParams.accountField]));
        pendingResponse = await queryInternalApi(
          makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.BILL, LifecycleStageMap.PRICING),
          "POST",
          JSON.stringify(formData));
        break;
      }
      case FormTypeMap.ADD_INVOICE: {
        pendingResponse = await queryInternalApi(
          makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.BILL, FormTypeMap.ADD_INVOICE),
          "POST",
          JSON.stringify({
            ...formData,
            event: browserStorageManager.get(EVENT_KEY)
          }));
        break;
      }
      case FormTypeMap.ASSIGN_PRICE: {
        formData["pricing"] = formData[props.entityType.replace("_", " ")];
        pendingResponse = await queryInternalApi(
          makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.BILL, FormTypeMap.ASSIGN_PRICE),
          "PUT",
          JSON.stringify(formData));
        break;
      }
      case FormTypeMap.DELETE: {
        // Delete entity via API route
        pendingResponse = await queryInternalApi(makeInternalRegistryAPIwithParams(
          InternalApiIdentifierMap.INSTANCES,
          props.entityType,
          "false",
          formData[FORM_STATES.ID],
          null,
          null,
          null,
          null,
          null,
          formData["branch_delete"]
        ), "DELETE");
        break;
      }
      case FormTypeMap.EDIT: {
        // Update entity via API route
        pendingResponse = await queryInternalApi(
          makeInternalRegistryAPIwithParams(
            InternalApiIdentifierMap.INSTANCES,
            props.entityType,
            "false",
            formData.id
          ), "PUT", JSON.stringify(formData));
        if (props.isPrimaryEntity && !pendingResponse.error) {
          pendingResponse = await queryInternalApi(
            makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.INSTANCES, "contracts/draft"),
            "PUT",
            JSON.stringify({
              ...formData,
              contract: props.primaryInstance,
            }));
          if (!pendingResponse.error && formData[billingParams.pricingField]) {
            pendingResponse = await queryInternalApi(
              makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.BILL, FormTypeMap.ASSIGN_PRICE),
              "PUT",
              JSON.stringify({
                ...formData,
                pricing: formData[billingParams.pricingField],
                contract: pendingResponse.data?.id,
              }));
          }
        }
        break;
      }
      case FormTypeMap.SEARCH: {
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
        pendingResponse = await queryInternalApi(
          makeInternalRegistryAPIwithParams(
            InternalApiIdentifierMap.INSTANCES,
            props.entityType,
            "false",
            "search"
          ), "POST", JSON.stringify(formData));

        if (!pendingResponse.error) {
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
    stopLoading();
    toast(
      pendingResponse?.data?.message || pendingResponse?.error?.message,
      pendingResponse?.error ? "error" : "success"
    );
    if (!pendingResponse?.error) {
      // For assign price only, move to the next step to gen invoice
      if (props.formType === FormTypeMap.ASSIGN_PRICE) {
        router.push(buildUrl(Routes.BILLING_ACTIVITY_TRANSACTION, id))
      } else if (props.formType === FormTypeMap.ADD_INVOICE) {
        router.push(buildUrl(Routes.BILLING_ACTIVITY))
      } else {
        setTimeout(() => {
          // Close search modal on success
          if (props.formType === FormTypeMap.SEARCH) {
            props.setShowSearchModalState(false);
          } else {
            // Redirect back for other types (add and edit) as users will want to see their changes
            router.back();
          }
        }, 2000);
      }
      // always close drawer with a timeout
      setTimeout(() => {
        dispatch(closeDrawer());
      }, 2000);
    }
  });

  return (
    <form ref={props.formRef} onSubmit={onSubmit}>
      {form.formState.isLoading && <FormSkeleton />}
      {!form.formState.isLoading &&
        renderFormField(
          props.entityType,
          formTemplate?.property.find(
            (node) =>
              node[TYPE_KEY].includes(PROPERTY_SHAPE_TYPE) &&
              (node as PropertyShape).name[VALUE_KEY] === "id"
          ),
          form,
          -1,
          billingParams
        )}
      {!form.formState.isLoading && formTemplate?.node?.length > 0 && (
        <BranchFormSection
          entityType={props.entityType}
          node={formTemplate?.node}
          form={form}
          billingStore={billingParams}
        />
      )}
      {!form.formState.isLoading &&
        formTemplate?.property
          .filter(
            (node) =>
              !(
                node[TYPE_KEY].includes(PROPERTY_SHAPE_TYPE) &&
                (node as PropertyShape).name[VALUE_KEY] === "id"
              )
          )
          .map((field, index) =>
            renderFormField(props.entityType, field, form, index, billingParams)
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
 * @param {BillingEntityTypes} billingParams Optionally indicates the type of account and pricing.
 */
export function renderFormField(
  entityType: string,
  field: PropertyShapeOrGroup,
  form: UseFormReturn,
  currentIndex: number,
  billingParams: BillingEntityTypes,
): ReactNode {
  const formType: FormType = form.getValues(FORM_STATES.FORM_TYPE);
  const disableAllInputs: boolean =
    formType === FormTypeMap.VIEW || formType === FormTypeMap.DELETE;

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
        billingStore={billingParams}
      />
    );
  } else {
    const fieldProp: PropertyShape = field as PropertyShape;
    // If this is a hidden field, hide the field
    if (fieldProp.maxCount && parseInt(fieldProp.maxCount[VALUE_KEY]) === 0) {
      return;
    }
    const disableId: boolean =
      formType === FormTypeMap.EDIT && fieldProp.name[VALUE_KEY] === FORM_STATES.ID
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
          billingStore={billingParams}
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
        formType === FormTypeMap.SEARCH &&
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
          billingStore={billingParams}
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

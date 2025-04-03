import { usePathname } from 'next/navigation';
import React, { ReactNode, useState } from 'react';
import { FieldValues, useForm, UseFormReturn } from 'react-hook-form';
import { useDispatch } from 'react-redux';

import { Paths } from 'io/config/routes';
import { setFilterFeatureIris, setFilterTimes } from 'state/map-feature-slice';
import { Dictionary } from 'types/dictionary';
import { FormTemplate, ID_KEY, PROPERTY_GROUP_TYPE, PropertyGroup, PropertyShape, PropertyShapeOrGroup, SEARCH_FORM_TYPE, TYPE_KEY, VALUE_KEY } from 'types/form';
import LoadingSpinner from 'ui/graphic/loader/spinner';
import { getAfterDelimiter } from 'utils/client-utils';
import { useDictionary } from 'utils/dictionary/DictionaryContext';
import { addEntity, deleteEntity, getFormTemplate, getMatchingInstances, HttpResponse, updateEntity } from 'utils/server-actions';
import FormFieldComponent from './field/form-field';
import { FORM_STATES, parsePropertyShapeOrGroupList } from './form-utils';
import BranchFormSection from './section/branch-form-section';
import { DependentFormSection } from './section/dependent-form-section';
import FormGeocoder from './section/form-geocoder';
import FormSchedule, { daysOfWeek } from './section/form-schedule';
import FormSearchPeriod from './section/form-search-period';
import FormSection from './section/form-section';

interface FormComponentProps {
  formRef: React.RefObject<HTMLFormElement>;
  entityType: string;
  formType: string;
  agentApi: string;
  setResponse: React.Dispatch<React.SetStateAction<HttpResponse>>;
  id?: string;
  primaryInstance?: string;
  isPrimaryEntity?: boolean;
  additionalFields?: PropertyShapeOrGroup[];
}

/**
 * This component renders a dynamic form component that generates inputs based on its inputs.
 * 
 * @param { React.MutableRefObject<HTMLFormElement>} formRef Reference to the form element.
 * @param {string} entityType The type of entity.
 * @param {string} formType The type of submission. Valid inputs include add and update.
 * @param {string} agentApi The target agent endpoint for any registry related functionalities.
 * @param {React.Dispatch<React.SetStateAction<HttpResponse>>} setResponse A dispatch function for setting the response after submission.
 * @param {string} id An optional identifier input.
 * @param {string} primaryInstance An optional instance for the primary entity.
 * @param {boolean} isPrimaryEntity An optional indicator if the form is targeting a primary entity.
 * @param {PropertyShapeOrGroup[]} additionalFields Additional form fields to render if required.
 */
export function FormComponent(props: Readonly<FormComponentProps>) {
  const id: string = props.id ?? getAfterDelimiter(usePathname(), "/");
  const dispatch = useDispatch();
  const dict: Dictionary = useDictionary();
  const [formTemplate, setFormTemplate] = useState<FormTemplate>(null);

  // Sets the default value with the requested function call
  const form: UseFormReturn = useForm({
    defaultValues: async (): Promise<FieldValues> => {
      // All forms will require an ID to be assigned
      const initialState: FieldValues = {
        formType: props.formType, // Store form type for easy access and reduce need to pass parameters to child
        id: id,
      };
      // Retrieve template from APIs
      let template: FormTemplate;
      // For add form, get a blank template
      if (props.formType == Paths.REGISTRY_ADD || props.formType == SEARCH_FORM_TYPE) {
        template = await getFormTemplate(props.agentApi, props.entityType);
      } else {
        // For edit and view, get template with values
        template = await getFormTemplate(props.agentApi, props.entityType, id);
      }
      if (props.additionalFields) {
        props.additionalFields.forEach(field => template.property.push(field));
      }
      const updatedProperties: PropertyShapeOrGroup[] = parsePropertyShapeOrGroupList(initialState, template.property);
      setFormTemplate({
        ...template,
        property: updatedProperties
      });
      return initialState;
    }
  });

  // A function to initiate the form submission process
  const onSubmit = form.handleSubmit(async (formData: FieldValues) => {
    let pendingResponse: HttpResponse;
    // For single service
    if (formData[FORM_STATES.RECURRENCE] == 0) {
      const startDate: string = formData[FORM_STATES.START_DATE];
      const dateObject: Date = new Date(startDate);
      const dayOfWeek = daysOfWeek[dateObject.getUTCDay()];

      formData = {
        ...formData,
        recurrence: "P1D",
        "end date": startDate, // End date must correspond to start date
        [dayOfWeek]: true, // Ensure the corresponding day of week is true
      }
      // For alternate day service
    } else if (formData[FORM_STATES.RECURRENCE] == -1) {
      formData = {
        ...formData,
        recurrence: "P2D",
      }
      // For regular service
    } else if (formData[FORM_STATES.RECURRENCE]) {
      formData = {
        ...formData,
        recurrence: `P${formData[FORM_STATES.RECURRENCE] * 7}D`,
      }
    }
    // Removes the last row in the form array
    for (const key in formData) {
      const field = formData[key];
      if (Array.isArray(field)) {
        field.pop();
      }
    }

    // Remove form type state before sending to backend
    delete formData[FORM_STATES.FORM_TYPE];

    switch (props.formType.toLowerCase()) {
      case Paths.REGISTRY_ADD: {
        pendingResponse = await addEntity(props.agentApi, formData, props.entityType);
        // For registry's primary entity, a draft lifecycle must also be generated
        if (props.isPrimaryEntity && pendingResponse.success) {
          pendingResponse = await addEntity(props.agentApi, {
            contract: pendingResponse.iri,
            ...formData
          }, "contracts/draft");
        }
        break;
      }
      case Paths.REGISTRY_DELETE: {
        pendingResponse = await deleteEntity(props.agentApi, formData[FORM_STATES.ID], props.entityType);
        break;
      }
      case Paths.REGISTRY_EDIT: {
        pendingResponse = await updateEntity(`${props.agentApi}/${props.entityType}/${formData.id}`,
          JSON.stringify({
            ...formData,
            entity: props.entityType,
          })
        );
        if (props.isPrimaryEntity && pendingResponse.success) {
          pendingResponse = await updateEntity(`${props.agentApi}/contracts/draft`, JSON.stringify({
            ...formData,
            contract: props.primaryInstance,
          }));
        }
        break;
      }
      case SEARCH_FORM_TYPE: {
        // For interacting with min and max fields in the search form
        Object.keys(formData).forEach(field => {
          // Append range key to field if they have min and max fields and values in either their min or max field
          // eslint-disable-next-line no-prototype-builtins
          if (formData.hasOwnProperty(`min ${field}`) && formData.hasOwnProperty(`max ${field}`) &&
            (formData[`min ${field}`] != undefined || formData[`max ${field}`] != undefined)) {
            formData = {
              ...formData,
              [field]: "range",
            }
          }
        });

        pendingResponse = await getMatchingInstances(props.agentApi, props.entityType, formData);
        if (pendingResponse.success) {
          if (pendingResponse.message === "[]") {
            pendingResponse.success = false;
            pendingResponse.message = dict.message.noMatchFeature;
          } else {
            dispatch(setFilterFeatureIris(JSON.parse(pendingResponse.message)));
            pendingResponse.message = dict.message.matchedFeatures;
          }
          if (formData[FORM_STATES.START_TIME_PERIOD] && formData[FORM_STATES.END_TIME_PERIOD]) {
            // Only display this message if there is no features based on static meta data but the search period is required
            if (!pendingResponse.success) {
              pendingResponse.success = true;
              pendingResponse.message = dict.message.noMatchMetaWithTime;
            }
            // Convert date to UNIX Epoch Timestamp
            const startTime: number = Math.floor(new Date(formData[FORM_STATES.START_TIME_PERIOD]).getTime() / 1000);
            const endTime: number = Math.floor(new Date(formData[FORM_STATES.END_TIME_PERIOD]).getTime() / 1000);
            dispatch(setFilterTimes([startTime, endTime]));
          }
        }
        break;
      }
      default:
        break;
    }
    props.setResponse(pendingResponse);
  });

  return (
    <form ref={props.formRef} onSubmit={onSubmit}>
      {form.formState.isLoading && <LoadingSpinner isSmall={false} />}
      {!form.formState.isLoading && formTemplate.property.map((field, index) => {
        return renderFormField(props.entityType, props.agentApi, field, form, index);
      })}
      {!form.formState.isLoading && formTemplate.node.length > 0 && <BranchFormSection
        entityType={props.entityType}
        agentApi={props.agentApi}
        node={formTemplate.node}
        form={form}
      />}
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
 * @param agentApi   The target agent API endpoint. 
 * @param field      The configuration object defining the form field.
 * @param form       A `react-hook-form` object providing methods and state for managing the form.
 * @param currentIndex An index used to generate a unique key for the rendered form field element.
 */
export function renderFormField(
  entityType: string,
  agentApi: string,
  field: PropertyShapeOrGroup,
  form: UseFormReturn,
  currentIndex: number): ReactNode {
  const formType: string = form.getValues(FORM_STATES.FORM_TYPE);
  const disableAllInputs: boolean = formType === Paths.REGISTRY || formType === Paths.REGISTRY_DELETE;
  if (field[TYPE_KEY].includes(PROPERTY_GROUP_TYPE)) {
    const fieldset: PropertyGroup = field as PropertyGroup;
    return <FormSection
      key={fieldset[ID_KEY] + currentIndex}
      entityType={entityType}
      agentApi={agentApi}
      group={fieldset}
      form={form}
      options={{
        disabled: disableAllInputs,
      }}
    />
  } else {
    const fieldProp: PropertyShape = field as PropertyShape;
    // If this is a hidden field, hide the field
    if (fieldProp.maxCount && parseInt(fieldProp.maxCount[VALUE_KEY]) === 0) {
      return;
    }
    const disableId: boolean = formType === Paths.REGISTRY_EDIT && fieldProp.name[VALUE_KEY] === FORM_STATES.ID ? true : disableAllInputs;
    if (fieldProp.class) {
      if (fieldProp.class[ID_KEY] === "https://spec.edmcouncil.org/fibo/ontology/FND/DatesAndTimes/FinancialDates/RegularSchedule") {
        return <FormSchedule
          key={fieldProp.name[VALUE_KEY] + currentIndex}
          fieldId={fieldProp.name[VALUE_KEY]}
          agentApi={agentApi}
          form={form}
          options={{
            disabled: disableAllInputs,
          }}
        />
      }
      if (fieldProp.class[ID_KEY] === "https://spec.edmcouncil.org/fibo/ontology/FND/Places/Locations/PhysicalLocation") {
        return <FormGeocoder
          key={fieldProp.name[VALUE_KEY] + currentIndex}
          agentApi={agentApi}
          field={fieldProp}
          form={form}
        />;
      }
      if (formType === SEARCH_FORM_TYPE && fieldProp.class[ID_KEY] === "https://www.theworldavatar.com/kg/ontotimeseries/TimeSeries") {
        return <FormSearchPeriod
          key={fieldProp.name[VALUE_KEY] + currentIndex}
          form={form}
        />;
      }
      return <DependentFormSection
        key={fieldProp.name[VALUE_KEY] + currentIndex}
        agentApi={agentApi}
        dependentProp={fieldProp}
        form={form}
      />
    }
    return <FormFieldComponent
      key={fieldProp.name[VALUE_KEY] + currentIndex}
      agentApi={agentApi}
      field={fieldProp}
      form={form}
      options={{
        disabled: disableId,
      }}
    />
  }
}
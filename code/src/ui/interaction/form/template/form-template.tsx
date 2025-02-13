import React, { useState } from 'react';
import { FieldValues, SubmitHandler, useForm, UseFormReturn } from 'react-hook-form';

import { Paths } from 'io/config/routes';
import { ID_KEY, PROPERTY_GROUP_TYPE, PropertyGroup, PropertyShape, PropertyShapeOrGroup, TYPE_KEY, VALUE_KEY } from 'types/form';
import LoadingSpinner from 'ui/graphic/loader/spinner';
import { initFormField, updateDependentProperty } from '../form-utils';
import FormFieldComponent from '../field/form-field';
import { DependentFormSection } from '../section/dependent-form-section';
import FormSection from '../section/form-section';

interface FormComponentProps {
  agentApi: string;
  entityType: string;
  formRef: React.MutableRefObject<HTMLFormElement>;
  fields: PropertyShapeOrGroup[];
  submitAction: SubmitHandler<FieldValues>;
}

/**
 * This component renders a simple form template with only field inputs.
 * 
 * @param {string} agentApi The target agent endpoint for any registry related functionalities.
 * @param {string} entityType The type of entity.
 * @param {React.MutableRefObject<HTMLFormElement>} formRef Reference to the form element.
 * @param {PropertyShapeOrGroup[]} fields The fields to render.
 * @param {SubmitHandler<FieldValues>} submitAction Action to be taken when submitting the form.
 */
export function FormTemplate(props: Readonly<FormComponentProps>) {
  const [formFields, setFormFields] = useState<PropertyShapeOrGroup[]>([]);

  // Sets the default value with the requested function call if any
  const form: UseFormReturn = useForm({
    defaultValues: async (): Promise<FieldValues> => {
      // All forms will require an ID to be assigned
      const initialState: FieldValues = {
        formType: Paths.REGISTRY_EDIT, // DEFAULT TO EDIT TYPE
      };
      const fields: PropertyShapeOrGroup[] = props.fields.map(field => {
        if (field[TYPE_KEY].includes(PROPERTY_GROUP_TYPE)) {
          const fieldset: PropertyGroup = field as PropertyGroup;
          // Ignore id for any groups
          const properties: PropertyShape[] = fieldset.property.filter(field => field.name[VALUE_KEY] != "id").map(fieldProp => {
            const updatedProp: PropertyShape = updateDependentProperty(fieldProp, props.fields);
            return initFormField(updatedProp, initialState, updatedProp.name[VALUE_KEY])
          })
          return {
            ...fieldset,
            property: properties,
          }
        } else {
          const updatedProp: PropertyShape = updateDependentProperty(field as PropertyShape, props.fields);
          return initFormField(updatedProp, initialState, updatedProp.name[VALUE_KEY])
        }
      });
      setFormFields(fields);
      return initialState;
    }
  });

  return (
    <form ref={props.formRef} onSubmit={form.handleSubmit(props.submitAction)}>
      {form.formState.isLoading ?
        <LoadingSpinner isSmall={false} /> :
        formFields.map((formField, index) => {
          if (formField[TYPE_KEY].includes(PROPERTY_GROUP_TYPE)) {
            const fieldset: PropertyGroup = formField as PropertyGroup;
            return <FormSection
              key={fieldset[ID_KEY] + index}
              entityType={props.entityType}
              agentApi={props.agentApi}
              group={fieldset}
              form={form}
            />
          }
          const field: PropertyShape = formField as PropertyShape;
          if (field.class) {
            return <DependentFormSection
              key={field.name[VALUE_KEY] + index}
              agentApi={props.agentApi}
              dependentProp={field}
              form={form}
            />
          }
          return <FormFieldComponent
            key={field.name[VALUE_KEY] + index}
            entityType={props.entityType}
            agentApi={props.agentApi}
            field={field}
            form={form}
          />
        })}
    </form>
  );
}
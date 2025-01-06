import React, { useState } from 'react';
import { FieldValues, SubmitHandler, useForm, UseFormReturn } from 'react-hook-form';

import { Paths } from 'io/config/routes';
import { ID_KEY, PropertyShape, VALUE_KEY } from 'types/form';
import LoadingSpinner from 'ui/graphic/loader/spinner';
import { initFormField } from '../form-utils';
import FormFieldComponent from '../field/form-field';
import { DependentFormSection } from '../section/dependent-form-section';

interface FormComponentProps {
  agentApi: string;
  entityType: string;
  formRef: React.MutableRefObject<HTMLFormElement>;
  fields: PropertyShape[];
  submitAction: SubmitHandler<FieldValues>;
}

/**
 * This component renders a simple form template with only field inputs.
 * 
 * @param {string} agentApi The target agent endpoint for any registry related functionalities.
 * @param {string} entityType The type of entity.
 * @param {React.MutableRefObject<HTMLFormElement>} formRef Reference to the form element.
 * @param {PropertyShape[]} fields The fields to render.
 * @param {SubmitHandler<FieldValues>} submitAction Action to be taken when submitting the form.
 */
export function FormTemplate(props: Readonly<FormComponentProps>) {
  const [formFields, setFormFields] = useState<PropertyShape[]>([]);
  const [shapeToFieldName, setShapeToFieldName] = useState<Map<string, string>>(new Map<string, string>());

  // Sets the default value with the requested function call if any
  const form: UseFormReturn = useForm({
    defaultValues: async (): Promise<FieldValues> => {
      // All forms will require an ID to be assigned
      const initialState: FieldValues = {
        formType: Paths.REGISTRY_EDIT, // DEFAULT TO EDIT TYPE
      };
      const fields: PropertyShape[] = props.fields.map(field => {
        // For property shapes with qualifiedValueShape but no node kind property
        // Add node shapes and their corresponding field name to the map to facilite parent dependencies links
        if (field.qualifiedValueShape && !field.nodeKind) {
          const tempMap: Map<string, string> = new Map<string, string>(shapeToFieldName);
          field.qualifiedValueShape?.map(nodeShape => tempMap.set(nodeShape[ID_KEY], field.name[VALUE_KEY]));
          setShapeToFieldName(tempMap);
        }
        return initFormField(field, initialState, field.name[VALUE_KEY])
      });
      setFormFields(fields);
      return initialState;
    }
  });

  return (
    <form ref={props.formRef} onSubmit={form.handleSubmit(props.submitAction)}>
      {form.formState.isLoading ?
        <LoadingSpinner isSmall={false} /> :
        formFields.map((field, index) => {
          if (field.class) {
            return <DependentFormSection
              key={field.name[VALUE_KEY] + index}
              agentApi={props.agentApi}
              dependentProp={field}
              form={form}
              shapeToFieldMap={shapeToFieldName}
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
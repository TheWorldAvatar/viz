import React, { useState } from 'react';
import { FieldValues, SubmitHandler, useForm, UseFormReturn } from 'react-hook-form';

import { Paths } from 'io/config/routes';
import { PropertyShapeOrGroup } from 'types/form';
import LoadingSpinner from 'ui/graphic/loader/spinner';
import { renderFormField } from '../form';
import { parsePropertyShapeOrGroupList } from '../form-utils';

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
      const fields: PropertyShapeOrGroup[] = parsePropertyShapeOrGroupList(initialState, props.fields);
      setFormFields(fields);
      return initialState;
    }
  });

  return (
    <form ref={props.formRef} onSubmit={form.handleSubmit(props.submitAction)}>
      {form.formState.isLoading ?
        <LoadingSpinner isSmall={false} /> :
        formFields.map((formField, index) => {
          return renderFormField(props.entityType, props.agentApi, formField, form, index)
        })}
    </form>
  );
}
import React, { useState } from 'react';
import { FieldValues, SubmitHandler, useForm, UseFormReturn } from 'react-hook-form';

import { PROPERTY_GROUP_TYPE, PropertyShape, PropertyShapeOrGroup, TYPE_KEY } from 'types/form';
import LoadingSpinner from 'ui/graphic/loader/spinner';
import { renderFormField } from '../form';
import { parsePropertyShapeOrGroupList } from '../form-utils';

interface FormComponentProps {
  entityType: string;
  formRef: React.RefObject<HTMLFormElement>;
  fields: PropertyShapeOrGroup[];
  submitAction: SubmitHandler<FieldValues>;
}

/**
 * This component renders a simple form template with only field inputs.
 * 
 * @param {string} entityType The type of entity.
 * @param {React.RefObject<HTMLFormElement>} formRef Reference to the form element.
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
        formType: 'edit', // DEFAULT TO EDIT TYPE
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
        formFields.filter(field => field[TYPE_KEY].includes(PROPERTY_GROUP_TYPE) || (field as PropertyShape).fieldId != "id")
          .map((formField, index) => {
            return renderFormField(props.entityType, formField, form, index)
          })}
    </form>
  );
}
import React, { useEffect, useState } from 'react';
import { FieldValues, SubmitHandler, useForm, UseFormReturn } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { browserStorageManager } from 'state/browser-storage-manager';
import { selectFormPersistenceEnabled } from 'state/form-persistence-slice';
import { PROPERTY_GROUP_TYPE, PropertyShape, PropertyShapeOrGroup, TYPE_KEY } from 'types/form';
import LoadingSpinner from 'ui/graphic/loader/spinner';
import { renderFormField } from '../form';
import { FORM_STATES, parsePropertyShapeOrGroupList } from '../form-utils';

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
  const formPersistenceEnabled: boolean = useSelector(selectFormPersistenceEnabled);
  const [formFields, setFormFields] = useState<PropertyShapeOrGroup[]>([]);

  // Load stored form values from session storage
  const loadStoredFormValues = (initialState: FieldValues): FieldValues => {
    const storedValues: FieldValues = { ...initialState };
    // Fields that should never be loaded from storage (always use from initialState)
    const excludedFields: string[] = [FORM_STATES.FORM_TYPE, FORM_STATES.ID];
    browserStorageManager.keys().forEach((key) => {
      // Skip the excluded fields
      if (excludedFields.includes(key)) {
        return;
      }
      const storedValue = browserStorageManager.get(key);
      storedValues[key] = storedValue;
    });
    return storedValues;
  };

  // Sets the default value with the requested function call if any
  const form: UseFormReturn = useForm({
    defaultValues: async (): Promise<FieldValues> => {
      // All forms will require an ID to be assigned
      const initialState: FieldValues = {
        formType: 'edit', // DEFAULT TO EDIT TYPE
      };
      const fields: PropertyShapeOrGroup[] = parsePropertyShapeOrGroupList(initialState, props.fields);
      setFormFields(fields);

      // Load stored values from session storage
      const storedState: FieldValues = loadStoredFormValues(initialState);
      return storedState;
    }
  });

  // Save form values to session storage when form persistence is enabled
  useEffect(() => {
    if (formPersistenceEnabled) {
      const values: FieldValues = form.getValues();
      const excludedFields: string[] = [FORM_STATES.FORM_TYPE, FORM_STATES.ID];
      Object.entries(values).forEach(([key, value]) => {
        if (value !== "" && !excludedFields.includes(key)) {
          browserStorageManager.set(key, value);
        }
      });
    }
  }, [formPersistenceEnabled]);



  return (
    <form ref={props.formRef} onSubmit={form.handleSubmit(props.submitAction)}>
      {form.formState.isLoading ?
        <LoadingSpinner isSmall={false} /> :
        formFields.filter(field => field[TYPE_KEY].includes(PROPERTY_GROUP_TYPE) || (field as PropertyShape).fieldId != "id")
          .map((formField, index) => {
            return renderFormField(props.entityType, formField, form, index, { account: "", accountField: "", pricing: "", pricingField: "" })
          })}
    </form>
  );
}
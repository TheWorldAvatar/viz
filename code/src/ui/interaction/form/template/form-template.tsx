import React, { useState } from 'react';
import { FieldValues, SubmitHandler, useForm, UseFormReturn } from 'react-hook-form';
import { browserStorageManager } from 'state/browser-storage-manager';
import { PROPERTY_GROUP_TYPE, PropertyShape, PropertyShapeOrGroup, TYPE_KEY } from 'types/form';
import LoadingSpinner from 'ui/graphic/loader/spinner';
import { renderFormField } from '../form';
import { FORM_STATES, parsePropertyShapeOrGroupList } from '../form-utils';
import { getUTCDate } from 'utils/client-utils';

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
  const [translatedFormFieldIds, setTranslatedFormFieldIds] = useState<Record<string, string>>({});

  const FORM_ENTITY_IDENTIFIER: string = `_form_${props.entityType}`;


  // Load stored form values from session storage
  const loadStoredFormValues = (initialState: FieldValues, translatedFormFieldIds: Record<string, string>): FieldValues => {
    const storedValues: FieldValues = { ...initialState };
    const excludedFields: string[] = [FORM_STATES.FORM_TYPE, FORM_STATES.ID];

    // Build reverse mapping
    // client -> client details client
    const reverseMapping: Record<string, string> = {};
    Object.entries(translatedFormFieldIds).forEach(([formKey, storageKey]) => {
      reverseMapping[storageKey] = formKey;
    });

    // Load the nested "datatype" fields from the FORM_ENTITY_IDENTIFIER
    const entityForm: string = browserStorageManager.get(FORM_ENTITY_IDENTIFIER);
    if (entityForm) {
      try {
        const nestedValues = JSON.parse(entityForm);
        Object.entries(nestedValues).forEach(([storageKey, value]) => {
          const formKey = reverseMapping[storageKey] ?? storageKey;
          if (!excludedFields.includes(storageKey)) {
            storedValues[formKey] = value;
          }
        });
      } catch (e) {
        console.error("Failed to parse nested form data for identifier:", FORM_ENTITY_IDENTIFIER, e);
      }
    }

    // Load individually saved non-datatype fields
    browserStorageManager.keys().forEach((key) => {
      // Skip excluded fields and the nested datatype identifier
      if (excludedFields.includes(key) || key.startsWith('_form_')) {
        return;
      }
      const storedValue = browserStorageManager.get(key);
      // If its a translated field, map it back to the original form key
      const formKey = reverseMapping[key] ?? key;

      // Convert entry_dates from ISO strings to Date objects
      // The date picker expects Date objects, not strings
      if (formKey === FORM_STATES.ENTRY_DATES && Array.isArray(storedValue)) {
        storedValues[formKey] = storedValue.map((dateString: string) =>
          getUTCDate(new Date(dateString))
        );
      } else {
        storedValues[formKey] = storedValue;
      }
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

      const fieldIdMapping: Record<string, string> = { formEntityType: FORM_ENTITY_IDENTIFIER };

      const fields: PropertyShapeOrGroup[] = parsePropertyShapeOrGroupList(initialState, props.fields, fieldIdMapping);
      setFormFields(fields);
      setTranslatedFormFieldIds(fieldIdMapping);

      // Load stored values from session storage
      const storedState: FieldValues = loadStoredFormValues(initialState, fieldIdMapping);
      return storedState;
    }
  });

  return (
    <form ref={props.formRef} onSubmit={form.handleSubmit(props.submitAction)}>
      {form.formState.isLoading ?
        <LoadingSpinner isSmall={false} /> :
        formFields.filter(field => field[TYPE_KEY].includes(PROPERTY_GROUP_TYPE) || (field as PropertyShape).fieldId != "id")
          .map((formField, index) => {
            return renderFormField(props.entityType, formField, form, index, { account: "", accountField: "", pricing: "", pricingField: "" }, translatedFormFieldIds)
          })}
    </form>
  );
}
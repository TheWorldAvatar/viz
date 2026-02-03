import React, { useState } from 'react';
import { FieldValues, SubmitHandler, useForm, UseFormReturn } from 'react-hook-form';
import { browserStorageManager } from 'state/browser-storage-manager';
import { PROPERTY_GROUP_TYPE, PropertyShape, PropertyShapeOrGroup, TYPE_KEY } from 'types/form';
import LoadingSpinner from 'ui/graphic/loader/spinner';
import { renderFormField } from '../form';
import { FORM_STATES, parsePropertyShapeOrGroupList } from '../form-utils';
import { JsonObject } from 'types/json';
import useFormPersistenceState from 'hooks/form/useFormPersistenceState';

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
  const { lockedFields, openFormCount, setLockedFieldsValue } = useFormPersistenceState();
  const [formFields, setFormFields] = useState<PropertyShapeOrGroup[]>([]);
  const [translatedFormFieldIds, setTranslatedFormFieldIds] = useState<Record<string, string>>({});
  const FORM_ENTITY_IDENTIFIER: string = `_form_${props.entityType}`;

  // Load stored form values from session storage
  const loadStoredFormValues = (initialState: FieldValues): FieldValues => {
    const excludedFields: string[] = [FORM_STATES.FORM_TYPE, FORM_STATES.ID];

    // Load the nested "datatype" fields from the FORM_ENTITY_IDENTIFIER
    const entityForm: string = browserStorageManager.get(FORM_ENTITY_IDENTIFIER);
    if (entityForm) {
      try {
        const nestedValues: JsonObject = JSON.parse(entityForm);
        Object.entries(nestedValues).forEach(([storageKey, value]) => {
          if (!excludedFields.includes(storageKey)) {
            initialState[storageKey] = value;
          }
        });
      } catch (e) {
        console.error("Failed to parse nested form data for identifier:", FORM_ENTITY_IDENTIFIER, e);
      }
    }

    return initialState;
  };


  // Sets the default value with the requested function call if any
  const form: UseFormReturn = useForm({
    defaultValues: async (): Promise<FieldValues> => {
      // All forms will require an ID to be assigned
      const initialState: FieldValues = {
        formType: 'edit', // DEFAULT TO EDIT TYPE
        lockField: [] // An array that stores all fields that should be locked (disabled)
      };

      const fieldIdMapping: Record<string, string> = { formEntityType: FORM_ENTITY_IDENTIFIER };

      const fields: PropertyShapeOrGroup[] = parsePropertyShapeOrGroupList(initialState, props.fields, fieldIdMapping);

      if (initialState.lockField.length > 0) {
        const tempLockedFields: Record<string, number> = { ...lockedFields };
        initialState.lockField.forEach((field: string) => {
          if (tempLockedFields[field] == undefined) {
            tempLockedFields[field] = openFormCount;
          }
        });
        setLockedFieldsValue(tempLockedFields);
      }

      delete initialState.lockField;

      setFormFields(fields);
      setTranslatedFormFieldIds(fieldIdMapping);

      // Load stored values from session storage
      return loadStoredFormValues(initialState);
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
import fieldStyles from '../field/field.module.css';
import styles from '../form.module.css';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Control, FieldValues, UseFormReturn, useWatch } from 'react-hook-form';

import { useDictionary } from 'hooks/useDictionary';
import { Dictionary } from 'types/dictionary';
import { defaultSearchOption, ID_KEY, PropertyShape, RegistryFieldValues, VALUE_KEY } from 'types/form';
import LoadingSpinner from 'ui/graphic/loader/spinner';
import { SelectOption } from 'ui/interaction/dropdown/simple-selector';
import { extractResponseField, getAfterDelimiter, parseStringsForUrls } from 'utils/client-utils';
import FormSelector from '../field/input/form-selector';
import { FORM_STATES } from '../form-utils';
import { makeInternalRegistryAPIwithParams } from 'utils/internal-api-services';

interface DependentFormSectionProps {
  dependentProp: PropertyShape;
  form: UseFormReturn;
}

/**
 * This component renders a form section that has dependencies on related entities.
 * 
 * @param {PropertyShape} dependentProp The dependent property's SHACL restrictions.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 */
export function DependentFormSection(props: Readonly<DependentFormSectionProps>) {
  const pathName: string = usePathname();
  const dict: Dictionary = useDictionary();

  const label: string = props.dependentProp.name[VALUE_KEY];
  const queryEntityType: string = parseStringsForUrls(label); // Ensure that all spaces are replaced with _
  const formType: string = props.form.getValues(FORM_STATES.FORM_TYPE);
  const control: Control = props.form.control;
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [selectElements, setSelectElements] = useState<SelectOption[]>([]);
  const parentField: string = props.dependentProp.dependentOn?.[ID_KEY] ?? "";

  const currentParentOption: string = useWatch<FieldValues>({
    control,
    name: parentField,
  });
  const currentOption: string = useWatch<FieldValues>({
    control,
    name: props.dependentProp.fieldId,
  });

  // A hook that fetches the list of dependent entities for the dropdown selector
  // If parent options are available, the list will be refetched on parent option change
  useEffect(() => {
    // Declare an async function to retrieve the list of dependent entities for the dropdown selector
    const getDependencies = async (entityType: string, field: PropertyShape, form: UseFormReturn) => {
      setIsFetching(true);
      let entities: RegistryFieldValues[] = [];
      // If there is supposed to be a parent element, retrieve the data associated with the selected parent option
      if (field.dependentOn) {
        if (currentParentOption) {
          entities = await fetch(
            makeInternalRegistryAPIwithParams(
              'instances', field.dependentOn.label,
              "false",
              getAfterDelimiter(currentParentOption, "/"),
              entityType),
            { cache: 'no-store', credentials: 'same-origin' }
          ).then(res => res.json());
        }
        // If there is no valid parent option, there should be no entity
      } else if ((formType === "view" || formType === "delete") && field.defaultValue) {
        // Retrieve only one entity to reduce query times as users cannot edit anything in view or delete mode
        // Note that the default value can be a null if the field is optional
        entities = await fetch(makeInternalRegistryAPIwithParams(
          'instances', entityType, "false",
          getAfterDelimiter(Array.isArray(field.defaultValue) ? field.defaultValue?.[0].value : field.defaultValue?.value, "/")),
          { cache: 'no-store', credentials: 'same-origin' }
        ).then((response) => response.json())

      } else {
        entities = await fetch(
          makeInternalRegistryAPIwithParams('instances', entityType),
          { cache: 'no-store', credentials: 'same-origin' }).then((res) => res.json())
      }

      // By default, id is empty
      let defaultId: string = "";
      // Only update the id if there are any entities and default value is not NA (ie null)
      if (entities.length > 0 && field.defaultValue) {
        defaultId = extractResponseField(entities[0], FORM_STATES.IRI)?.value;
        // If there is a default value, search and use the option matching the default instance's local name
        if (props.form.getValues(field.fieldId)) {
          const defaultValueId: string = getAfterDelimiter(props.form.getValues(field.fieldId), "/");
          const matchingEntity: RegistryFieldValues = entities.find(entity =>
            getAfterDelimiter(extractResponseField(entity, FORM_STATES.ID)?.value, "/") === defaultValueId
          );
          if (matchingEntity) {
            defaultId = extractResponseField(matchingEntity, FORM_STATES.IRI)?.value;
          }
        }
      }
      // Search form should always target default value
      if (props.form.getValues(FORM_STATES.FORM_TYPE) === "search") {
        defaultId = defaultSearchOption.type.value;
      }
      // Set the form value to the default value if available, else, default to the first option
      form.setValue(field.fieldId, defaultId);

      const formFields: SelectOption[] = [];

      // Retrieve and set the display field accordingly
      if (entities.length > 0) {
        const fields: string[] = Object.keys(entities[0]);
        let displayField: string;
        if (fields.includes("name")) {
          displayField = "name";
        } else if (fields.includes("street")) {
          displayField = "street";
        } else {
          displayField = Object.keys(fields).find((key => key != "id" && key != "iri"));
        }
        entities.forEach(entity => {
          const formOption: SelectOption = {
            value: extractResponseField(entity, FORM_STATES.IRI)?.value,
            label: extractResponseField(entity, displayField)?.value,
          };
          formFields.push(formOption);
        })
      }
      // Sort the fields by the labels
      formFields.sort((a, b) => {
        return a.label.localeCompare(b.label);
      });
      // Add the default search option only if this is the search form
      if (props.form.getValues(FORM_STATES.FORM_TYPE) === "search") {
        // Default option should only use empty string "" as the value
        formFields.unshift({
          label: defaultSearchOption.label.value,
          value: defaultSearchOption.type.value,
        });
      }
      // Update select options
      setSelectElements(formFields);
      setIsFetching(false);
    }

    if (parentField !== "" || currentParentOption !== null) {
      getDependencies(queryEntityType, props.dependentProp, props.form);
    }
  }, [currentParentOption]);

  // An event handler to generate the url to reach the required add form
  const genAddSubEntityUrl = (entityType: string): string => {
    let url: string = `../add/${entityType}`;
    if (formType != "add" || pathName.includes("registry")) {
      url = `../${url}`;
    }
    return (url);
  };

  // An event handler that will navigate to the required view form when clicked
  const openViewSubEntityModal: React.MouseEventHandler<HTMLButtonElement> = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    let url: string = `../view/${queryEntityType}/${getAfterDelimiter(currentOption, "/")}`;
    // Other form types will have an extra path for the entity id, except for ADD, and if it includes registry
    if (formType != "add" || pathName.includes("registry")) {
      url = `../${url}`;
    }
    window.open(url, "_blank");
  };

  // The fieldset should only be displayed if it either does not have parent elements (no dependentOn property) or 
  // the parent element has been queried and selected
  if (!props.dependentProp.dependentOn || (currentParentOption && parentField != "")) {
    return (
      <fieldset className={styles["form-dependent-fieldset"]}>
        {isFetching &&
          <div className={styles["loader-container"]}>
            <LoadingSpinner isSmall={true} />
          </div>
        }
        {!isFetching && (
          <div className={fieldStyles["form-input-container"]}>
            <FormSelector
              selectOptions={selectElements}
              field={props.dependentProp}
              form={props.form}
              redirectOptions={{
                addUrl: formType != "view" && formType != "delete" && formType != "search" ?
                  genAddSubEntityUrl(queryEntityType) : undefined,
                view: !isFetching && formType != "search" && selectElements.length > 0 ?
                  openViewSubEntityModal : undefined,
              }}
              noOptionMessage={dict.message.noInstances}
              options={{
                disabled: formType == "view" || formType == "delete",
                labelStyle: [fieldStyles["form-input-label-add"], fieldStyles["form-input-label"]],
              }}
            />
          </div>
        )}
      </fieldset>);
  }
}
import styles from '../form.module.css';
import fieldStyles from '../field/field.module.css';

import { useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import Select from 'react-select';

import { FormOptionType } from 'types/form';
import { selectorStyles } from 'ui/css/selector-style';
import { FORM_STATES } from '../form-utils';
import FormArray from '../field/array/array';
import FormFieldComponent from '../field/form-field';

interface FormBillingProps {
  id: string;
  agentApi: string;
  form: UseFormReturn;
}

/**
 * This component renders a form section for billing model.
 * 
 * @param {string} id Contract ID for billing association.
 * @param {string} agentApi The target agent endpoint for any registry related functionalities.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
 */
export default function FormBilling(props: Readonly<FormBillingProps>) {
  const flatFeeModel: string = "Flat Fee";
  const variablePricingModel: string = "Variable Pricing";
  const pricingType: string = "pricing";
  // Define the state to store the selected value
  const [selectedModel, setSelectedModel] = useState<string>(Object.hasOwn(props.form.getValues(), FORM_STATES.unitPrice)
    ? variablePricingModel : flatFeeModel);

  // Updates the pricing model description whenever the pricing model option changes
  const pricingModelDescription = useMemo((): string => {
    if (selectedModel === flatFeeModel) {
      return "Charges a single, fixed fee regardless of the time, resources, or usage involved";
    } else {
      return "Employs a flexible fee structure with optional fixed fees and variable charges based on metrics";
    }
  }, [selectedModel]);

  // Handle change event for the select input
  const handleModelChange = (value: string) => {
    if (value === flatFeeModel) {
      props.form.unregister(FORM_STATES.UNIT_PRICE);
    } else {
      props.form.setValue(FORM_STATES.UNIT_PRICE, [{ rate: 0.01, lowerBound: 0, upperBound: null }]);
    }
    setSelectedModel(value);
  };

  return (
    <div className={styles["form-fieldset-contents"]}>
      <div className={styles["section-selector-container"]}>
        <label className={fieldStyles["field-text"]} htmlFor="select-input">Pricing Model:</label>
        <Select
          styles={selectorStyles}
          unstyled
          options={[{ label: flatFeeModel, value: flatFeeModel }, { label: variablePricingModel, value: variablePricingModel }]}
          value={{ label: selectedModel, value: selectedModel }}
          onChange={(selectedOption) => handleModelChange((selectedOption as FormOptionType).value)}
          isLoading={false}
          isMulti={false}
          isSearchable={true}
          isDisabled={false}
        />
        <p className={fieldStyles["info-text"]}>
          <b className={fieldStyles["field-text"]}>Description: </b>
          {pricingModelDescription}
        </p>
      </div>
      {!props.form.formState.isLoading && <FormFieldComponent
        entityType={pricingType}
        field={{
          "@id": "string",
          "@type": "http://www.w3.org/ns/shacl#PropertyShape",
          name: { "@value": FORM_STATES.FLAT_FEE },
          fieldId: FORM_STATES.FLAT_FEE,
          datatype: "decimal",
          description: { "@value": "A fixed base fee for each service delivered. The input may be 0 when such fees are optional." },
          order: 0,
        }}
        form={props.form}
      />}
      {selectedModel != flatFeeModel && <FormArray
        field={{
          "@id": "string",
          "@type": "http://www.w3.org/ns/shacl#PropertyShape",
          name: { "@value": FORM_STATES.UNIT_PRICE },
          fieldId: FORM_STATES.UNIT_PRICE,
          datatype: "decimal",
          description: {
            "@value": "The cost per unit for each service; " +
              "Multiple price points can be set for different service volumes or usage tiers"
          },
          order: 0,
        }}
        arrayOptions={[
          { fieldId: "rate", label: FORM_STATES.UNIT_RATE, placeholder: "Add new rate" },
          { fieldId: "lowerBound", label: FORM_STATES.UNIT_LOWER_BOUND, placeholder: "Add new lower bound" },
          { fieldId: "upperBound", label: FORM_STATES.UNIT_UPPER_BOUND, placeholder: "Leave empty if w/o range" }
        ]}
        form={props.form}
      />}
    </div>
  );
}
import styles from './accordion.module.css';

import { parseWordsForLabels } from 'utils/client-utils';

interface AccordionFieldProps {
  name: string;
  value: string;
}

/**
 * This component renders a field display within an accordion's content.
 * 
 * @param {string} name The name of the field.
 * @param {string} value The value to render.
 */
export default function AccordionField(props: Readonly<AccordionFieldProps>) {
  return (
    <p className={`${styles["field-container"]} ${styles["field"]}`}>
      <span className={`${styles["field-key"]} ${styles["field"]}`}>{parseWordsForLabels(props.name)}:</span>
      {parseWordsForLabels(props.value)}
    </p>
  );
}
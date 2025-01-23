import styles from './accordion.module.css';

import { useState } from 'react';

import LoadingSpinner from 'ui/graphic/loader/spinner';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
}

/**
 * This component renders an accordion section container.
 * 
 * @param {string} title The title to display.
 * @param {React.ReactNode} children Children components to render.
 * @param {boolean} IsLoading Optional indicator to display a loading spinner over expansion or close icon if required.
 */
export default function Accordion(props: Readonly<AccordionProps>) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles["container"]}>
      <button className={`${styles["header"]} ${isOpen ? styles["active"] : ""}`} onClick={toggleAccordion}>
        <p>{props.title}</p>
        <span className={styles["icon"]}>
          {props.isLoading && <LoadingSpinner isSmall={true} />}
          {!props.isLoading && (isOpen ? <>&#x25B2;</> : <>&#x25BC;</>)}
        </span>
      </button>
      {isOpen && (
        <div className={styles["content"]}>{props.children}</div>
      )}
    </div >
  );
}
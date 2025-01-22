import styles from './accordion.module.css';

import { useState } from 'react';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
}

/**
 * This component renders an accordion section container.
 * 
 * @param {string} title The title to display.
 * @param {React.ReactNode} children Children components to render.
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
        <span className={styles["icon"]}>{isOpen ? <>&#x25B2;</> : <>&#x25BC;</>}</span>
      </button>
      {isOpen && (
        <div className={styles["content"]}>{props.children}</div>
      )}
    </div>
  );
}
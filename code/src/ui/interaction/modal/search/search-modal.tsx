"use client";
import styles from './search.modal.module.css';

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useDictionary } from 'hooks/useDictionary';
import { setFilterFeatureIris } from 'state/map-feature-slice';
import { CustomAgentResponseBody } from 'types/backend-agent';
import { Dictionary } from 'types/dictionary';
import { FormType } from 'types/form';
import LoadingSpinner from 'ui/graphic/loader/spinner';
import ClickActionButton from 'ui/interaction/action/click/click-button';
import { FormComponent } from 'ui/interaction/form/form';
import Modal from 'ui/interaction/modal/modal';
import ResponseComponent from 'ui/text/response/response';

interface SearchModalProps {
  id: string;
  show: boolean,
  setShowState: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SHOW_ALL_FEATURE_INDICATOR: string = "all";

/**
 * A modal component for users to interact with a form for search criterias while on the registry.
 */
export default function SearchModal(props: Readonly<SearchModalProps>) {
  const dispatch = useDispatch();
  const [response, setResponse] = useState<CustomAgentResponseBody>(null);
  const formRef: React.RefObject<HTMLFormElement> = useRef<HTMLFormElement>(null);
  const dict: Dictionary = useDictionary();
  // Show all features upon click
  const showAllFeatures: React.MouseEventHandler<HTMLButtonElement> = () => {
    dispatch(setFilterFeatureIris([SHOW_ALL_FEATURE_INDICATOR]));
    setTimeout(() => props.setShowState(false), 1000);
  };

  const onSubmit: React.MouseEventHandler<HTMLButtonElement> = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  // Closes the search modal only if response is successfull
  useEffect(() => {
    if (response?.success) {
      setTimeout(() => props.setShowState(false), 2000);
    }
  }, [response]);

  return (
    <Modal
      isOpen={props.show}
      setIsOpen={props.setShowState}
      styles={[styles["modal"]]}
    >
      <h1>{dict.title.searchCriteria}</h1>
      <section className={styles["section-contents"]}>
        <FormComponent
          formRef={formRef}
          entityType={props.id}
          formType={FormType.SEARCH}
          setResponse={setResponse}
        />
      </section>
      <section className={styles["section-footer"]}>
        {formRef.current?.formState?.isSubmitting && <LoadingSpinner isSmall={false} />}
        {!formRef.current?.formState?.isSubmitting && (<ResponseComponent response={response} />)}
        <div className={styles["footer-button-row"]}>
          <ClickActionButton
            icon={"search"}
            label={dict.action.search}
            onClick={onSubmit}
          />
          <ClickActionButton
            icon={"select_all"}
            label={dict.action.showAll}
            onClick={showAllFeatures}
          />
        </div>
      </section>
    </Modal>
  );
}
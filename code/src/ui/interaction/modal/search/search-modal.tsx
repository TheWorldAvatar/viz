"use client";
import styles from './search.modal.module.css';

import React, { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';

import { setFilterFeatureIris } from 'state/map-feature-slice';
import { SEARCH_FORM_TYPE } from 'types/form';
import LoadingSpinner from 'ui/graphic/loader/spinner';
import ClickActionButton from 'ui/interaction/action/click/click-button';
import { FormComponent } from 'ui/interaction/form/form';
import ResponseComponent from 'ui/text/response/response';
import { HttpResponse } from 'utils/server-actions';

interface SearchModalProps {
  id: string;
  stack: string;
  show: boolean,
  setShowState: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SHOW_ALL_FEATURE_INDICATOR: string = "all";

/**
 * A modal component for users to interact with a form for search criterias while on the registry.
 */
export default function SearchModal(props: Readonly<SearchModalProps>) {
  Modal.setAppElement("#globalContainer");
  const dispatch = useDispatch();
  const [response, setResponse] = useState<HttpResponse>(null);
  const formRef: React.RefObject<HTMLFormElement> = useRef<HTMLFormElement>(null);

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
      overlayClassName={styles.overlay}
      className={styles.modal}
    >
      <div className={styles.container}>
        <section className={styles["section-title"]}>
          <h1>SEARCH CRITERIA</h1>
          <ClickActionButton
            icon={"cancel"}
            onClick={() => props.setShowState(false)}
          />
        </section>
        <section className={styles["section-contents"]}>
          <FormComponent
            formRef={formRef}
            entityType={props.id}
            formType={SEARCH_FORM_TYPE}
            agentApi={`${props.stack}/vis-backend-agent`}
            setResponse={setResponse}
          />
        </section>
        <section className={styles["section-footer"]}>
          {formRef.current?.formState?.isSubmitting && <LoadingSpinner isSmall={false} />}
          {!formRef.current?.formState?.isSubmitting && (<ResponseComponent response={response} />)}
          <div className={styles["footer-button-row"]}>
            <ClickActionButton
              icon={"search"}
              label={"SEARCH"}
              onClick={onSubmit}
            />
            <ClickActionButton
              icon={"select_all"}
              label={"SHOW ALL"}
              onClick={showAllFeatures}
            />
          </div>
        </section>
      </div>
    </Modal>
  );
}
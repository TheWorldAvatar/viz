"use client";
import styles from "./search.modal.module.css";

import React, { useRef } from "react";
import { useDispatch } from "react-redux";

import { useDictionary } from "hooks/useDictionary";
import { setFilterFeatureIris } from "state/map-feature-slice";
import { Dictionary } from "types/dictionary";
import LoadingSpinner from "ui/graphic/loader/spinner";
import Button from "ui/interaction/button";
import { FormComponent } from "ui/interaction/form/form";
import Modal from "ui/interaction/modal/modal";

interface SearchModalProps {
  id: string;
  stack: string;
  show: boolean;
  setShowState: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SHOW_ALL_FEATURE_INDICATOR: string = "all";

/**
 * A modal component for users to interact with a form for search criterias while on the registry.
 */
export default function SearchModal(props: Readonly<SearchModalProps>) {
  const dispatch = useDispatch();
  const formRef: React.RefObject<HTMLFormElement> =
    useRef<HTMLFormElement>(null);
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
          formType={"search"}
          setShowSearchModalState={props.setShowState}
        />
      </section>
      <section className={styles["section-footer"]}>
        {formRef.current?.formState?.isSubmitting && (
          <LoadingSpinner isSmall={false} />
        )}
        <div className={styles["footer-button-row"]}>
          <Button
            leftIcon="search"
            label={dict.action.search}
            onClick={onSubmit}
          />
          <Button
            leftIcon="select_all"
            label={dict.action.showAll}
            onClick={showAllFeatures}
          />
        </div>
      </section>
    </Modal>
  );
}

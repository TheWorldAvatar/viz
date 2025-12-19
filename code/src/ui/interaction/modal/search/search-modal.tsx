"use client";

import React, { useRef } from "react";
import { useDispatch } from "react-redux";

import { useDictionary } from "hooks/useDictionary";
import { setFilterFeatureIris } from "state/map-feature-slice";
import { Dictionary } from "types/dictionary";
import { FormTypeMap } from "types/form";
import LoadingSpinner from "ui/graphic/loader/spinner";
import Button from "ui/interaction/button";
import { FormComponent } from "ui/interaction/form/form";
import Modal from "../modal";

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
      className="h-[90vh] w-[90vw]"
    >
      <h1 className="text-xl font-bold">{dict.title.searchCriteria}</h1>
      <section className={"overflow-y-auto overflow-x-hidden md:p-3 p-1 h-[60vh] max-h-[60vh]"}>
        <FormComponent
          formRef={formRef}
          entityType={props.id}
          formType={FormTypeMap.SEARCH}
          setShowSearchModalState={props.setShowState}
        />
      </section>
      <section className="flex items-start 2xl:items-center justify-between p-2 sticky bottom-0 shrink-0 mb-2.5 mt-2.5  2xl:mb-4 2xl:mt-4">
        {formRef.current?.formState?.isSubmitting && (
          <LoadingSpinner isSmall={false} />
        )}
        <div className="flex flex-wrap gap-2.5 2xl:gap-2">
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

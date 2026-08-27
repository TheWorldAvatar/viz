"use client";

import React, { useRef } from "react";
import { useDispatch } from "react-redux";

import { useDictionary } from "@/hooks/useDictionary";
import { setFilterFeatureIris } from "@/state/map-feature-slice";
import { Dictionary } from "@/types/dictionary";
import { FormTypeMap } from "@/types/form";
import LoadingSpinner from "@/ui/graphic/loader/spinner";
import Button from "@/ui/interaction/button";
import { FormComponent } from "@/ui/interaction/form/form";
import { FormSessionContextProvider } from "@/utils/form/FormSessionContext";
import Modal from "../modal";
import { Search, SquareSquare } from "lucide-react";

interface ApiSearchModalProps {
  search: string;
  show: boolean;
  setShowState: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SHOW_ALL_FEATURE_INDICATOR: string = "all";

/** A modal that searches registry features through the API-backed form. */
export default function ApiSearchModal(
  props: Readonly<ApiSearchModalProps>
) {
  const dispatch = useDispatch();
  const formRef: React.RefObject<HTMLFormElement> =
    useRef<HTMLFormElement>(null);
  const dict: Dictionary = useDictionary();

  const showAllFeatures: React.MouseEventHandler<HTMLButtonElement> = () => {
    dispatch(setFilterFeatureIris([SHOW_ALL_FEATURE_INDICATOR]));
    setTimeout(() => props.setShowState(false), 1000);
  };

  const onSubmit: React.MouseEventHandler<HTMLButtonElement> = () => {
    formRef.current?.requestSubmit();
  };

  return (
    <Modal
      isOpen={props.show}
      setIsOpen={props.setShowState}
      className="h-[90vh] w-[90vw]"
    >
      <FormSessionContextProvider
        formType={FormTypeMap.SEARCH}
        entityType={props.search}
      >
        <h1 className="text-xl font-bold">{dict.title.searchCriteria}</h1>
        <section className="overflow-y-auto overflow-x-hidden md:p-3 p-1 h-[60vh] max-h-[60vh]">
          <FormComponent
            formRef={formRef}
            entityType={props.search}
            setShowSearchModalState={props.setShowState}
          />
        </section>
        <section className="flex items-start 2xl:items-center justify-between p-2 sticky bottom-0 shrink-0 mb-2.5 mt-2.5 2xl:mb-4 2xl:mt-4">
          {formRef.current?.formState?.isSubmitting && (
            <LoadingSpinner size="xl" />
          )}
          <div className="flex flex-wrap gap-2.5 2xl:gap-2">
            <Button
              leftIcon={Search}
              label={dict.action.search}
              onClick={onSubmit}
            />
            <Button
              leftIcon={SquareSquare}
              label={dict.action.showAll}
              onClick={showAllFeatures}
            />
          </div>
        </section>
      </FormSessionContextProvider>
    </Modal>
  );
}

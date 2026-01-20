"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Icon } from "@mui/material";
import { usePermissionScheme } from "hooks/auth/usePermissionScheme";
import { useDrawerNavigation } from "hooks/drawer/useDrawerNavigation";
import { useTaskData } from "hooks/form/api/useTaskData";
import { useDictionary } from "hooks/useDictionary";
import useOperationStatus from "hooks/useOperationStatus";
import { PermissionScheme } from "types/auth";
import { Dictionary } from "types/dictionary";
import LoadingSpinner from "ui/graphic/loader/spinner";
import Button from "ui/interaction/button";
import NavigationDrawer from "ui/interaction/drawer/navigation-drawer";
import FormSkeleton from "ui/interaction/form/skeleton/form-skeleton";
import { getTranslatedStatusLabel } from "ui/text/status/status";
import { getAfterDelimiter, parseWordsForLabels } from "utils/client-utils";
import DateInput from "../input/date-input";
import Tooltip from "../tooltip/tooltip";
import { toast } from "../action/toast/toast";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";
import { AgentResponseBody, InternalApiIdentifierMap } from "types/backend-agent";



/**
 * Renders a task form container for intercept routes (modal).
 */
export function InterceptTaskRescheduleComponent() {
  return (
    <NavigationDrawer>
      <TaskFormContents />
    </NavigationDrawer>
  );
}

/**
 * Renders a task form container for full page.
 */
export function TaskRescheduleComponent() {
  return (
    <div className="flex flex-col w-full h-full mt-0 xl:w-[50vw] xl:h-[85vh] mx-auto justify-between py-4 px-4 md:px-8 bg-muted xl:border-1 xl:shadow-lg xl:border-border xl:rounded-xl xl:mt-4">
      <TaskFormContents />
    </div>
  );
}

/**
 * The internal content component for rescheduling a task.
 * Fetches task data from the URL ID and handles task rescheduling.
 */
function TaskFormContents() {
  const pathname = usePathname();
  const keycloakEnabled = process.env.KEYCLOAK === "true";
  const permissionScheme: PermissionScheme = usePermissionScheme();
  const dict: Dictionary = useDictionary();
  const router = useRouter();
  const { handleDrawerClose } = useDrawerNavigation();
  const id: string = getAfterDelimiter(pathname, "/");

  // State for form data
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const { task } = useTaskData(id, setIsFetching);
  const initialDate = task?.date ? new Date(task.date) : new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const { refreshFlag, triggerRefresh, isLoading, startLoading, stopLoading } = useOperationStatus();

  const unixTimeStampSelectedDate = Math.floor(selectedDate.getTime() / 1000);

  useEffect(() => {
    if (task?.date) {
      setSelectedDate(new Date(task.date));
    }
  }, [task?.date]);


  const taskSubmitAction = async (
    contract: string,
    date: string,
    rescheduledDate: number
  ) => {
    startLoading();

    const formData = {
      contract,
      date,
      "reschedule date": rescheduledDate
    };

    const response: AgentResponseBody = await queryInternalApi(
      makeInternalRegistryAPIwithParams(
        InternalApiIdentifierMap.EVENT,
        "service",
        "reschedule"
      ),
      "PUT",
      JSON.stringify(formData)
    );

    stopLoading();
    toast(
      response?.data?.message || response?.error?.message,
      response?.error ? "error" : "success"
    );

    if (response && !response?.error) {
      handleDrawerClose(() => {
        router.back();
      });
    }
  };

  return (
    <>
      {/* Header */}
      <section className="flex justify-between items-center text-nowrap text-foreground p-1 mt-10 mb-0.5 shrink-0">
        <h1 className="text-xl font-bold">
          {parseWordsForLabels(dict.title.actions)}
        </h1>
        {task?.date && (
          <h2 className="text-base md:text-lg md:mr-8">
            {task.date}: {getTranslatedStatusLabel(task?.status, dict)}
          </h2>
        )}
      </section>

      {/* Scrollable Content */}
      <section className="overflow-y-auto overflow-x-hidden md:p-3 p-1 flex-1 min-h-0">
        {task?.date && (
          <p className="text-lg mb-4 whitespace-pre-line">
            {`${dict.message.rescheduleInstruction} ${task.date}:`}
          </p>
        )}
        {(isFetching || refreshFlag) && <FormSkeleton />}
        {!(refreshFlag || isFetching) && (
          <div className="mt-8">
            <label className="text-lg font-bold flex gap-2 mb-1">
              {dict.form.rescheduleDate}
              <Tooltip text={dict.form.rescheduleDateDesc} placement="right">
                <Icon className="material-symbols-outlined">{"info"}</Icon>
              </Tooltip>
            </label>
            <DateInput
              mode="single"
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              placement="bottom"
              disableMobileView={true}
              disabled={isFetching || isLoading}
            />
          </div>
        )}
      </section >
      {/* Footer */}
      <section className="flex items-start 2xl:items-center justify-between p-2 sticky bottom-0 shrink-0 mb-2.5 mt-2.5 2xl:mb-4 2xl:mt-4" >
        <div className="flex gap-2.5">
          <Button
            leftIcon="cached"
            disabled={isFetching || isLoading}
            variant="outline"
            size="icon"
            onClick={triggerRefresh}
          />
        </div>
        {
          isLoading && (
            <LoadingSpinner isSmall={false} />
          )
        }
        <div className="flex flex-wrap gap-2.5 2xl:gap-2 justify-end items-center">
          <div className="flex-grow" />
          {/* Submit button */}
          {(!keycloakEnabled ||
            !permissionScheme ||
            (permissionScheme.hasPermissions.operation
            )) && (
              <Button
                leftIcon="send"
                label={dict.action.submit}
                tooltipText={dict.action.submit}
                disabled={isLoading || isFetching}
                onClick={() => {
                  taskSubmitAction(
                    task.contract,
                    task.date,
                    unixTimeStampSelectedDate
                  );
                }}
              />
            )}
        </div>
      </section >
    </>
  );
}

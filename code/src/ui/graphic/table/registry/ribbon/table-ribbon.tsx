"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import { usePermissionScheme } from "hooks/auth/usePermissionScheme";
import { useDictionary } from "hooks/useDictionary";
import { Routes } from "io/config/routes";
import { PermissionScheme } from "types/auth";
import { Dictionary } from "types/dictionary";
import { LifecycleStage, RegistryFieldValues } from "types/form";
import { DownloadButton } from "ui/interaction/action/download/download";
import RedirectButton from "ui/interaction/action/redirect/redirect-button";
import ReturnButton from "ui/interaction/action/redirect/return-button";
import Button from "ui/interaction/button";
import ColumnSearchComponent from "../actions/column-search";
import { DayPicker, DateRange, getDefaultClassNames } from "react-day-picker";
import { de, enGB } from "react-day-picker/locale";
import "react-day-picker/style.css";

interface TableRibbonProps {
  path: string;
  entityType: string;
  selectedDate: { from?: string; to?: string };
  lifecycleStage: LifecycleStage;
  instances: RegistryFieldValues[];
  setSelectedDate: React.Dispatch<
    React.SetStateAction<{ from?: string; to?: string }>
  >;
  setCurrentInstances: React.Dispatch<
    React.SetStateAction<RegistryFieldValues[]>
  >;
  triggerRefresh: () => void;
}

/**
 * Renders a ribbon for the view page
 *
 * @param {string} path The current path name after the last /.
 * @param {string} entityType The type of entity.
 * @param {object} selectedDate The selected date range object with 'from' and 'to' date strings.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {RegistryFieldValues[]} instances The target instances to export into csv.
 * @param setSelectedDate A dispatch method to update selected date range.
 * @param setCurrentInstances A dispatch method to set the current instances after parsing the initial instances.
 * @param triggerRefresh Method to trigger refresh.
 */
export default function TableRibbon(props: Readonly<TableRibbonProps>) {
  const dict: Dictionary = useDictionary();
  const keycloakEnabled = process.env.KEYCLOAK === "true";
  const permissionScheme: PermissionScheme = usePermissionScheme();
  const taskId: string = "task date";
  const [isDayPickerOpen, setIsDayPickerOpen] = useState(false);
  const dayPickerRef = useRef<HTMLDivElement>(null);
  const defaultDayPickerClassNames = getDefaultClassNames();

  // Format Date to 'YYYY-MM-DD' string
  const formatDateToYYYYMMDD = (date: Date): string => {
    if (!date || isNaN(date.getTime())) {
      throw new Error("Invalid date provided");
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const dayPickerSelectedRange: DateRange = {
    from: props.selectedDate?.from
      ? new Date(props.selectedDate.from)
      : undefined,
    to: props.selectedDate?.to ? new Date(props.selectedDate.to) : undefined,
  };

  const handleDateSelect = useCallback(
    (range: DateRange | undefined) => {
      props.setSelectedDate({
        from: range?.from ? formatDateToYYYYMMDD(range.from) : undefined,
        to: range?.to ? formatDateToYYYYMMDD(range.to) : undefined,
      });
    },
    [props.setSelectedDate]
  );

  const triggerRefresh: React.MouseEventHandler<HTMLButtonElement> = () => {
    props.triggerRefresh();
  };

  // Close DayPicker if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dayPickerRef.current &&
        !dayPickerRef.current.contains(event.target as Node)
      ) {
        setIsDayPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const displayedDateRange = useMemo(() => {
    return props.selectedDate.from
      ? props.selectedDate.to
        ? `${formatDateToYYYYMMDD(
            new Date(props.selectedDate.from)
          )} - ${formatDateToYYYYMMDD(new Date(props.selectedDate.to))}`
        : formatDateToYYYYMMDD(new Date(props.selectedDate.from)) // If only 'from' is selected
      : "";
  }, [props.selectedDate]);

  const getDisabledDates = useMemo(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (props.lifecycleStage === "scheduled") {
      return { before: tomorrow }; // Disable today and all dates before today (only allow future dates)
    }
  }, [props.lifecycleStage]);

  return (
    <div className="flex flex-col p-1 md:p-2 gap-2 md:gap-4">
      {props.lifecycleStage !== "general" &&
        props.lifecycleStage !== "pending" && (
          <div className="flex  items-centre justify-between  sm:gap-4 bg-gray-200 dark:bg-zinc-800   max-w-fit p-1.5 text-center rounded-lg flex-wrap">
            {(!keycloakEnabled ||
              !permissionScheme ||
              permissionScheme.hasPermissions.pendingRegistry) && (
              <RedirectButton
                label={dict.nav.title.outstanding}
                leftIcon="pending"
                url={`${Routes.REGISTRY_TASK_OUTSTANDING}`}
                variant={
                  props.lifecycleStage == "outstanding" ? "active" : "ghost"
                }
              />
            )}
            {(!keycloakEnabled ||
              !permissionScheme ||
              permissionScheme.hasPermissions.activeArchiveRegistry) && (
              <RedirectButton
                label={dict.nav.title.scheduled}
                leftIcon="schedule"
                url={`${Routes.REGISTRY_TASK_SCHEDULED}`}
                variant={
                  props.lifecycleStage == "scheduled" ? "active" : "ghost"
                }
              />
            )}
            {(!keycloakEnabled ||
              !permissionScheme ||
              permissionScheme.hasPermissions.activeArchiveRegistry) && (
              <RedirectButton
                label={dict.nav.title.closed}
                leftIcon="archive"
                url={`${Routes.REGISTRY_TASK_CLOSED}`}
                variant={props.lifecycleStage == "closed" ? "active" : "ghost"}
              />
            )}
          </div>
        )}
      <div className="w-full border-[0.5px] border-border" />
      <div className="flex justify-between md:gap-2 lg:gap-0 flex-wrap ">
        <div className="flex items-center !-ml-2 ">
          <Button
            className="ml-2"
            size="icon"
            leftIcon="cached"
            variant="outline"
            onClick={triggerRefresh}
          />
          {props.instances.length > 1 && (
            <ColumnSearchComponent
              instances={props.instances}
              setCurrentInstances={props.setCurrentInstances}
            />
          )}
        </div>
        <div className="flex  flex-wrap gap-2 mt-2 md:mt-0  ">
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.sales) &&
            (props.lifecycleStage == "pending" ||
              props.lifecycleStage == "general") && (
              <RedirectButton
                leftIcon="add"
                label={dict.action.addItem.replace(
                  "{replace}",
                  props.entityType.replace("_", " ")
                )}
                url={`${Routes.REGISTRY_ADD}/${props.entityType}`}
              />
            )}
          {props.lifecycleStage == "report" && (
            <ReturnButton
              leftIcon="first_page"
              label={dict.action.backTo.replace(
                "{replace}",
                props.entityType.replace("_", " ")
              )}
            />
          )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.invoice) &&
            props.lifecycleStage == "report" && (
              <RedirectButton
                leftIcon="print"
                label={dict.action.generateReport}
                url={`${Routes.REGISTRY_EDIT}/pricing/${props.path}`}
              />
            )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.export) && (
            <DownloadButton instances={props.instances} />
          )}
        </div>
      </div>
      <div className="flex ml-2 " ref={dayPickerRef}>
        {(props.lifecycleStage == "scheduled" ||
          props.lifecycleStage == "closed") && (
          <div className="flex items-center gap-4 relative">
            <label
              className="my-1 text-sm md:text-lg text-left whitespace-nowrap"
              htmlFor={taskId}
            >
              {dict.action.date}:
            </label>
            <input
              id={taskId}
              type="text"
              value={displayedDateRange}
              readOnly
              onClick={() => setIsDayPickerOpen(!isDayPickerOpen)}
              className={`h-8 ${
                props.selectedDate?.to ? "w-60" : "w-32"
              } p-4 rounded-lg border-1 border-border bg-muted text-foreground shadow-md cursor-pointer`}
              aria-label={taskId}
            />
            {isDayPickerOpen && (
              <div className="absolute z-10 bg-muted p-2 rounded-lg shadow-lg top-full mt-2">
                <DayPicker
                  locale={
                    window.navigator.language.startsWith("de") ? de : enGB
                  }
                  mode="range"
                  selected={dayPickerSelectedRange}
                  onSelect={handleDateSelect}
                  disabled={getDisabledDates}
                  classNames={{
                    today: `!bg-primary rounded-full`,
                    selected: ``,
                    root: `${defaultDayPickerClassNames.root}  p-4`,
                    chevron: ` fill-primary`,
                    footer: `mt-4 font-bold flex justify-center items-center`,
                  }}
                  footer={
                    displayedDateRange
                      ? displayedDateRange
                      : dict.message.noDateSelected
                  }
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

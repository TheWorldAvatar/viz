"use client";

import { usePermissionScheme } from "hooks/auth/usePermissionScheme";
import { useDictionary } from "hooks/useDictionary";
import { Routes } from "io/config/routes";
import React from "react";
import { useDispatch } from "react-redux";
import { setCurrentEntityType } from "state/registry-slice";
import { PermissionScheme } from "types/auth";
import { Dictionary } from "types/dictionary";
import { LifecycleStage, RegistryFieldValues } from "types/form";
import { DownloadButton } from "ui/interaction/action/download/download";
import RedirectButton from "ui/interaction/action/redirect/redirect-button";
import ReturnButton from "ui/interaction/action/redirect/return-button";

interface TableRibbonProps {
  path: string;
  entityType: string;
  lifecycleStage: LifecycleStage;
  instances: RegistryFieldValues[];
  setCurrentInstances: React.Dispatch<
    React.SetStateAction<RegistryFieldValues[]>
  >;
}

/**
 * Renders a ribbon for the view page
 *
 * @param {string} path The current path name after the last /.
 * @param {string} entityType The type of entity.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {RegistryFieldValues[]} instances The target instances to export into csv.
 * @param setCurrentInstances A dispatch method to set the current instances after parsing the initial instances.
 */
export default function TableRibbon(props: Readonly<TableRibbonProps>) {
  const dict: Dictionary = useDictionary();
  const dispatch = useDispatch();
  const keycloakEnabled = process.env.KEYCLOAK === "true";
  const permissionScheme: PermissionScheme = usePermissionScheme();

  return (
    <div className="flex flex-col p-1 md:p-2 gap-2 md:gap-4">
      {props.lifecycleStage !== "general" &&
        (!keycloakEnabled ||
          !permissionScheme ||
          permissionScheme.hasPermissions.registry) && (
          <div className="bg-ring w-full sm:max-w-fit rounded-lg p-2 sm:p-1.5 ">
            <div className="flex flex-wrap items-center justify-between sm:gap-4 gap-1">
              {(!keycloakEnabled ||
                permissionScheme?.hasPermissions.pendingRegistry) && (
                <div className="sm:w-auto">
                  <RedirectButton
                    label={dict.nav.title.pending}
                    leftIcon="free_cancellation"
                    hasMobileIcon={false}
                    url={`${Routes.REGISTRY_GENERAL}/${props.entityType}`}
                    variant={
                      props.lifecycleStage == "pending" ? "active" : "ghost"
                    }
                    className="w-full sm:w-auto py-3 sm:py-2 text-sm font-medium"
                  />
                </div>
              )}

              <div className="sm:w-auto">
                <RedirectButton
                  label={dict.nav.title.outstanding}
                  leftIcon="pending"
                  hasMobileIcon={false}
                  url={`${Routes.REGISTRY_TASK_OUTSTANDING}`}
                  variant={
                    props.lifecycleStage == "outstanding" ? "active" : "ghost"
                  }
                  className="w-full sm:w-auto py-3 sm:py-2 text-sm font-medium"
                />
              </div>

              <div className="sm:w-auto">
                <RedirectButton
                  label={dict.nav.title.scheduled}
                  leftIcon="schedule"
                  hasMobileIcon={false}
                  url={`${Routes.REGISTRY_TASK_SCHEDULED}`}
                  variant={
                    props.lifecycleStage == "scheduled" ? "active" : "ghost"
                  }
                  className="w-full sm:w-auto py-3 sm:py-2 text-sm font-medium"
                />
              </div>

              <div className="w-full sm:w-auto">
                <RedirectButton
                  label={dict.nav.title.closed}
                  leftIcon="event_busy"
                  hasMobileIcon={false}
                  url={`${Routes.REGISTRY_TASK_CLOSED}`}
                  variant={
                    props.lifecycleStage == "closed" ? "active" : "ghost"
                  }
                  className="w-full sm:w-auto py-3 sm:py-2 text-sm font-medium"
                />
              </div>
            </div>
          </div>
        )}
      <div className="w-full border-[0.5px] border-border" />
      <div className="flex justify-end items-end md:gap-2 lg:gap-0 flex-wrap">
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
                additionalHandleClickFunction={() => {
                  dispatch(setCurrentEntityType(props.entityType));
                }}
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
    </div>
  );
}

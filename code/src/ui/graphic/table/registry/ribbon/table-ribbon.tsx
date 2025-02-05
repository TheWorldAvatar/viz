"use client";

import styles from "./table.ribbon.module.css";

import React from "react";
import { useProtectedRole } from "hooks/useProtectedRole";
import { useRouter } from "next/navigation";
import { Button, DatePicker, Space, Tooltip } from "antd";
import dayjs from "dayjs";

import { Routes } from "io/config/routes";
import { RegistryFieldValues } from "types/form";
import { DownloadButton } from "ui/interaction/action/download/download";
import ActionButton from "ui/interaction/action/action";

interface TableRibbonProps {
  path: string;
  entityType: string;
  registryAgentApi: string;
  lifecycleStage: string;
  selectedDate: string;
  instances: RegistryFieldValues[];
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
  triggerRefresh: () => void;
}

export default function TableRibbon(props: Readonly<TableRibbonProps>) {
  const router = useRouter();
  const isKeycloakEnabled = process.env.KEYCLOAK === "true";
  const authorised = useProtectedRole().authorised;

  // Memoize navigation buttons configuration
  const navigationButtons = React.useMemo(
    () => [
      {
        icon: "pending",
        text: "Pending",
        route: Routes.REGISTRY_PENDING,
      },
      {
        icon: "schedule",
        text: "Active",
        route: Routes.REGISTRY_ACTIVE,
      },
      {
        icon: "archive",
        text: "Archive",
        route: Routes.REGISTRY_ARCHIVE,
      },
    ],
    []
  );

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    props.setSelectedDate(
      date?.format("YYYY-MM-DD") || new Date().toISOString().split("T")[0]
    );
  };

  return (
    <div className={styles.menu}>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Space wrap>
          {navigationButtons.map(({ icon, text, route }) => (
            <ActionButton
              key={route}
              useAntd
              type={props.lifecycleStage === route ? "primary" : "default"}
              icon={icon}
              onClick={() => router.push(`${route}/${props.entityType}`)}
            >
              {text}
            </ActionButton>
          ))}
        </Space>

        <Space wrap>
          {(authorised || !isKeycloakEnabled) &&
            props.lifecycleStage === Routes.REGISTRY_PENDING && (
              <ActionButton
                useAntd
                type="primary"
                icon="add"
                onClick={() =>
                  router.push(`${Routes.REGISTRY_ADD}/${props.entityType}`)
                }
              >
                Add {props.entityType}
              </ActionButton>
            )}

          {(props.lifecycleStage === Routes.REGISTRY_ACTIVE ||
            props.lifecycleStage === Routes.REGISTRY_TASK_DATE) && (
            <>
              <ActionButton
                useAntd
                type={
                  props.lifecycleStage === Routes.REGISTRY_ACTIVE
                    ? "primary"
                    : "default"
                }
                icon="task"
                onClick={() =>
                  router.push(`${Routes.REGISTRY_ACTIVE}/${props.entityType}`)
                }
              >
                Overview
              </ActionButton>
              <ActionButton
                useAntd
                type={
                  props.lifecycleStage === Routes.REGISTRY_TASK_DATE
                    ? "primary"
                    : "default"
                }
                icon="event"
                onClick={() => router.push(Routes.REGISTRY_TASK_DATE)}
              >
                View Tasks
              </ActionButton>
            </>
          )}

          {props.lifecycleStage === Routes.REGISTRY_REPORT && (
            <ActionButton
              useAntd
              icon="first_page"
              onClick={() => router.back()}
            >
              Back to {props.entityType}s
            </ActionButton>
          )}

          <DownloadButton
            instances={props.instances}
            size="middle" // or whatever size matches your design
          />

          {(authorised || !isKeycloakEnabled) &&
            props.lifecycleStage === Routes.REGISTRY_TASK_DATE && (
              <Space>
                <DatePicker
                  value={dayjs(props.selectedDate)}
                  onChange={handleDateChange}
                  style={{ width: "150px" }}
                />
                <Tooltip title="Refresh">
                  <ActionButton
                    useAntd
                    icon="cached"
                    onClick={props.triggerRefresh}
                  />
                </Tooltip>
              </Space>
            )}
        </Space>
      </Space>
    </div>
  );
}

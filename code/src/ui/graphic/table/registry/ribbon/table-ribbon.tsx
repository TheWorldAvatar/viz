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

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    props.setSelectedDate(
      date?.format("YYYY-MM-DD") || new Date().toISOString().split("T")[0]
    );
  };

  return (
    <div className={styles.menu}>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Space wrap>
          <Button
            type={
              props.lifecycleStage === Routes.REGISTRY_PENDING
                ? "primary"
                : "default"
            }
            icon={<span className="material-symbols-outlined">pending</span>}
            onClick={() =>
              router.push(`${Routes.REGISTRY_PENDING}/${props.entityType}`)
            }
          >
            Pending
          </Button>
          <Button
            type={
              props.lifecycleStage === Routes.REGISTRY_ACTIVE
                ? "primary"
                : "default"
            }
            icon={<span className="material-symbols-outlined">schedule</span>}
            onClick={() =>
              router.push(`${Routes.REGISTRY_ACTIVE}/${props.entityType}`)
            }
          >
            Active
          </Button>
          <Button
            type={
              props.lifecycleStage === Routes.REGISTRY_ARCHIVE
                ? "primary"
                : "default"
            }
            icon={<span className="material-symbols-outlined">archive</span>}
            onClick={() =>
              router.push(`${Routes.REGISTRY_ARCHIVE}/${props.entityType}`)
            }
          >
            Archive
          </Button>
        </Space>

        <Space wrap>
          {(authorised || !isKeycloakEnabled) &&
            props.lifecycleStage === Routes.REGISTRY_PENDING && (
              <Button
                type="primary"
                icon={<span className="material-symbols-outlined">add</span>}
                onClick={() =>
                  router.push(`${Routes.REGISTRY_ADD}/${props.entityType}`)
                }
              >
                Add {props.entityType}
              </Button>
            )}

          {(props.lifecycleStage === Routes.REGISTRY_ACTIVE ||
            props.lifecycleStage === Routes.REGISTRY_TASK_DATE) && (
            <>
              <Button
                type={
                  props.lifecycleStage === Routes.REGISTRY_ACTIVE
                    ? "primary"
                    : "default"
                }
                icon={<span className="material-symbols-outlined">task</span>}
                onClick={() =>
                  router.push(`${Routes.REGISTRY_ACTIVE}/${props.entityType}`)
                }
              >
                Overview
              </Button>
              <Button
                type={
                  props.lifecycleStage === Routes.REGISTRY_TASK_DATE
                    ? "primary"
                    : "default"
                }
                icon={<span className="material-symbols-outlined">event</span>}
                onClick={() => router.push(Routes.REGISTRY_TASK_DATE)}
              >
                View Tasks
              </Button>
            </>
          )}

          {props.lifecycleStage === Routes.REGISTRY_REPORT && (
            <Button
              icon={
                <span className="material-symbols-outlined">first_page</span>
              }
              onClick={() => router.back()}
            >
              Back to {props.entityType}s
            </Button>
          )}

          <DownloadButton instances={props.instances} />

          {(authorised || !isKeycloakEnabled) &&
            props.lifecycleStage === Routes.REGISTRY_TASK_DATE && (
              <Space>
                <DatePicker
                  value={dayjs(props.selectedDate)}
                  onChange={handleDateChange}
                  style={{ width: "150px" }}
                />
                <Tooltip title="Refresh">
                  <Button
                    icon={
                      <span className="material-symbols-outlined">cached</span>
                    }
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

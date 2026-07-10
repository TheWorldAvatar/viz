import { AgentResponseBody, InternalApiIdentifierMap } from "@/types/backend-agent";
import { RegistryStatusMap } from "@/types/form";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "@/utils/internal-api-services";

/** Returns whether an accrual may skip the optional form. */
export function canSkipOptionalAccrual(status?: string): boolean {
  return new Set([
    RegistryStatusMap.COMPLETED,
    RegistryStatusMap.CANCELLED,
    RegistryStatusMap.REPORTED,
  ]).has(status ?? "");
}

export async function fetchTaskStatus(taskId: string): Promise<string | undefined> {
  const response: AgentResponseBody = await queryInternalApi(
    makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.TASKS, "task", taskId),
  );
  const task = response.data?.items?.[0] as Record<string, { value?: string }> | undefined;
  return task?.status?.value;
}

import { AgentResponseBody, InternalApiIdentifierMap } from "@/types/backend-agent";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "@/utils/internal-api-services";

interface OptionalAccrualOptions {
  taskId: string;
  onStart?: () => void;
  onSuccess?: (response: AgentResponseBody) => void;
  onError?: (message: string) => void;
  onFinally?: () => void;
}

/**
 * Submits an accrual without mounting the interactive accrual form.
 * Task context is loaded here so callers do not depend on table-row fields.
 */
export async function submitOptionalAccrual(
  options: OptionalAccrualOptions,
): Promise<AgentResponseBody | null> {
  options.onStart?.();

  try {
    const defaultsResponse = await fetch(
      "/api/registry/accrual-defaults?id=" + encodeURIComponent(options.taskId),
      { cache: "no-store" },
    );
    const defaultsBody = await defaultsResponse.json() as AgentResponseBody;
    if (!defaultsResponse.ok || defaultsBody.error || !defaultsBody.data) {
      throw new Error(defaultsBody.error?.message ?? "Unable to prepare accrual defaults.");
    }

    const taskResponse = await queryInternalApi(
      makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.TASKS, "task", options.taskId),
    );
    const task = taskResponse.data?.items?.[0] as Record<string, { value?: string }> | undefined;
    if (!task?.contract?.value || !task.date?.value) {
      throw new Error("Unable to prepare the task contract and date.");
    }

    const response = await queryInternalApi(
      makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.EVENT, "service", "accrual"),
      "PUT",
      JSON.stringify({
        ...defaultsBody.data,
        id: options.taskId,
        contract: task.contract.value,
        date: task.date.value,
      }),
    );
    if (response.error) {
      throw new Error(response.error.message);
    }

    options.onSuccess?.(response);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to complete accrual.";
    options.onError?.(message);
    return null;
  } finally {
    options.onFinally?.();
  }
}

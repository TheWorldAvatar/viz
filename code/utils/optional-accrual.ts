import { AgentResponseBody, InternalApiIdentifierMap } from "@/types/backend-agent";
import { FormTemplateType, FormTypeMap } from "@/types/form";
import { FormDefaultValues, buildFormDefaults } from "@/utils/form-defaults";
import { makeInternalRegistryAPIwithParams, queryInternalApi, queryInternalTaskFormTemplate } from "@/utils/internal-api-services";

interface OptionalAccrualOptions {
  taskId: string;
  onStart?: () => void;
  onSuccess?: (response: AgentResponseBody) => void;
  onError?: (message: string) => void;
  onFinally?: () => void;
}

/**
 * Submits an accrual without mounting the interactive accrual form.
 * Form defaults are generated client-side after the authenticated template request.
 */
export async function submitOptionalAccrual(
  options: OptionalAccrualOptions,
): Promise<AgentResponseBody | null> {
  options.onStart?.();

  try {
    const template: FormTemplateType = await queryInternalTaskFormTemplate(FormTypeMap.ACCRUAL, options.taskId);
    if (!template?.property) {
      throw new Error("Unable to prepare accrual defaults.");
    }
    const defaultsBody: { data: FormDefaultValues } = {
      data: buildFormDefaults(template, { context: { id: options.taskId } }),
    };

    const taskResponse = await queryInternalApi(makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.TASKS, "task", options.taskId));
    const task: Record<string, { value?: string }> | undefined = taskResponse.data?.items?.[0] as Record<string, { value?: string }> | undefined;
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
    const message: string = error instanceof Error ? error.message : "Unable to complete accrual.";
    options.onError?.(message);
    return null;
  } finally {
    options.onFinally?.();
  }
}

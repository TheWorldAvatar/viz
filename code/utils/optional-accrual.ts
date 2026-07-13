import { AgentResponseBody, InternalApiIdentifierMap } from "@/types/backend-agent";
import { FormTemplateType, FormTypeMap } from "@/types/form";
import { FormDefaultValues, buildFormDefaults } from "@/utils/form-defaults";
import { makeInternalRegistryAPIwithParams, queryInternalApi, queryInternalTaskFormTemplate } from "@/utils/internal-api-services";

interface OptionalAccrualOptions {
  taskId: string;
  contract: string;
  date: string;
  onStart?: () => void;
  onSuccess?: (response: AgentResponseBody) => void;
  onError?: (message: string) => void;
  fallbackError: string;
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
      throw new Error(options.fallbackError);
    }
    const defaultsBody: { data: FormDefaultValues } = {
      data: buildFormDefaults(template, { context: { id: options.taskId } }),
    };


    const response = await queryInternalApi(
      makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.EVENT, "service", "accrual"),
      "PUT",
      JSON.stringify({
        ...defaultsBody.data,
        id: options.taskId,
        contract: options.contract,
        date: options.date,
      }),
    );
    if (response.error) {
      throw new Error(response.error.message);
    }

    options.onSuccess?.(response);
    return response;
  } catch (error) {
    const message: string = error instanceof Error ? error.message : options.fallbackError;
    options.onError?.(message);
    return null;
  } finally {
    options.onFinally?.();
  }
}

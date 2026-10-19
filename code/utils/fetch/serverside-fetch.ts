import { cookies } from "next/headers";
import { getBackendApi } from "../backend-api-services";
import { AgentResponseBody } from "@/types/backend-agent";
import { ConditionalFormatSetting } from "@/types/table";

export async function getConditionalFormattingStyles(resource: string): Promise<ConditionalFormatSetting[]> {
    const agentBaseApi: string = getBackendApi("REGISTRY_BACKEND");

    const cookieStore = await cookies();
    const bearerToken: string = cookieStore.get("x-bearer-token")?.value;

    const res = await fetch(`${agentBaseApi}/views/rules/${resource}`, {
        headers: {
            ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
        },
        cache: "no-store",
    });

    const response: AgentResponseBody = await res.json();
    if (response.error && response.error?.code === 401) {
        console.error("401 Unauthorised");
        return null;
    }
    return response.data.items as ConditionalFormatSetting[];
}
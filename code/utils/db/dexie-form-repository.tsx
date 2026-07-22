import { browserStorageManager } from "@/state/browser-storage-manager";
import { AgentResponseBody, InternalApiIdentifierMap } from "@/types/backend-agent";
import { FormOptionState, FormOptionStateMap, LifecycleStageMap } from "@/types/form";
import { SelectOptionType } from "@/ui/interaction/dropdown/simple-selector";
import { db, FormOptionMetadata } from "@/utils/db/db";
import { type Table } from "dexie";
import { FLAG_EMOJI, FORM_FIELD_OPTIONS } from "../constants";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "../internal-api-services";

class DexieFormRepository {
    private TABLE_NAME_TEMPLATE: string = "form_field_";

    /**
     * Synchronises with the backend to cache all field options.
     * 
     * @param {string} accountType The type of account.
     * @param {boolean} isContractForm Indicates if the sync occurs for a contract form.
    */
    async sync(accountType: string = "", isContractForm: boolean = false): Promise<void> {
        // Synchronises only if there are relevant fields available
        const currentOptionFields: string[] = this.getOptionFields();
        if (currentOptionFields.length == 0) {
            return;
        }

        await db.registerDynamicTables(this.TABLE_NAME_TEMPLATE, currentOptionFields);
        // Dynamic tables must be registered first before any metadata is further updated
        for (const field of currentOptionFields) {
            const meta = await db.metadata.get(field);
            if (!meta) {
                await this.updateFieldMeta(field, FormOptionStateMap.PENDING, 0);
            }
        }

        // Starts fetching and syncing with the backend
        await Promise.allSettled(
            currentOptionFields.map(async (field) => {
                const meta: FormOptionMetadata = await db.metadata.get(field);
                if (meta?.state === FormOptionStateMap.COMPLETE) {
                    return;
                }
                const table: Table<SelectOptionType, string> = await this.getTable(field);
                let selectOptions: SelectOptionType[] = [];
                if (field == accountType && isContractForm) {
                    const responseEntity: AgentResponseBody = await queryInternalApi(makeInternalRegistryAPIwithParams(
                        InternalApiIdentifierMap.FILTER,
                        LifecycleStageMap.ACCOUNT,
                        accountType,
                        "",
                    ));
                    const accountFilterOptions: SelectOptionType[] = responseEntity.data?.items as SelectOptionType[] ?? [];
                    selectOptions = accountFilterOptions.map(option => {
                        return {
                            ...option,
                            label: `${option.label} ${option.disabled ? FLAG_EMOJI : ""}`,
                        }

                    });
                } else {
                    const responseEntity: AgentResponseBody = await queryInternalApi(
                        makeInternalRegistryAPIwithParams(
                            InternalApiIdentifierMap.INSTANCES,
                            field.replaceAll(" ", "_"),
                            "false",
                        )
                    );
                    selectOptions = (responseEntity.data?.items as SelectOptionType[]) ?? [];
                }

                await table.bulkPut(selectOptions);
            }));
    }

    /**
     * Gets the form select option fields from the session storage.
     */
    private getOptionFields(): string[] {
        const currentOptionFieldsString: string = browserStorageManager.get(FORM_FIELD_OPTIONS);
        return currentOptionFieldsString ? JSON.parse(currentOptionFieldsString) : [];
    }

    /**
     * Updates the field metadata.
     * 
     * @param {string} field The name of the field.
     * @param {FormOptionState} state The current state of the field syncing process.
     * @param {number} count The total count of data cached.
    */
    private async updateFieldMeta(field: string, state: FormOptionState, count: number): Promise<void> {
        await db.metadata.put({
            field,
            state,
            count,
            lastUpdated: Date.now(),
        });
    }

    /**
     * Gets the form select option fields from the session storage.
     */
    private async getTable(field: string): Promise<Table<SelectOptionType, string>> {
        const tableName: string = `${this.TABLE_NAME_TEMPLATE}${field}`;
        return db.table(tableName);
    }
}

export const dexieFormRepo: DexieFormRepository = new DexieFormRepository();
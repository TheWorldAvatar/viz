import { browserStorageManager } from "@/state/browser-storage-manager";
import { AgentResponseBody, InternalApiIdentifierMap } from "@/types/backend-agent";
import { Dictionary } from "@/types/dictionary";
import { FormOptionState, FormOptionStateMap, FormType, FormTypeMap, LifecycleStageMap, OntologyConcept, useLiveFormOptionReturn } from "@/types/form";
import { SelectOptionType } from "@/ui/interaction/dropdown/simple-selector";
import { genDefaultSelectOption } from "@/ui/interaction/form/form-utils";
import { db, FormOptionMetadata } from "@/utils/db/db";
import { Collection, type Table } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { FLAG_EMOJI, FORM_FIELD_OPTIONS, SYNC_KEY } from "../constants";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "../internal-api-services";

class DexieFormRepository {
    private TABLE_NAME_TEMPLATE: string = "form_field_";
    private BATCH_SIZE: number = 500;

    /**
     * Adds field meeting the requirement for caching.
     * 
     * @param {string} field The name of the field.
    */
    addField(field: string): void {
        const currentOptionFields: Set<string> = new Set(this.getOptionFields());
        currentOptionFields.add(field);
        browserStorageManager.set(FORM_FIELD_OPTIONS, JSON.stringify(Array.from(currentOptionFields)));
    }

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

                const parsedField: string = field.replaceAll(" ", "_");
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
                            parsedField,
                            "false",
                        )
                    );
                    selectOptions = (responseEntity.data?.items as SelectOptionType[]) ?? [];
                }

                await table.bulkPut(selectOptions);

                if (selectOptions.length < 21) {
                    await this.updateFieldMeta(field, FormOptionStateMap.COMPLETE, selectOptions.length);
                    return;
                }

                let hasMore = true;
                let currentOffset = await table.count();

                while (hasMore) {
                    await this.updateFieldMeta(field, FormOptionStateMap.SYNC, currentOffset);
                    const responseEntity: AgentResponseBody = await queryInternalApi(
                        makeInternalRegistryAPIwithParams(
                            InternalApiIdentifierMap.INSTANCES,
                            parsedField,
                            SYNC_KEY,
                            null,
                            null,
                            String(Math.floor(currentOffset / this.BATCH_SIZE)),
                            String(this.BATCH_SIZE),
                        )
                    );
                    const nextBatch: SelectOptionType[] = (responseEntity.data?.items as SelectOptionType[]) ?? [];

                    if (nextBatch.length > 0) {
                        await table.bulkPut(nextBatch);
                        currentOffset += nextBatch.length;
                        if (nextBatch.length < this.BATCH_SIZE) {
                            hasMore = false;
                            await this.updateFieldMeta(field, FormOptionStateMap.COMPLETE, currentOffset);
                        } else {
                            await this.updateFieldMeta(field, FormOptionStateMap.SYNC, currentOffset);
                        }
                    } else {
                        hasMore = false;
                    }
                }
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
     * 
     * @param {string} field The name of the target field.
     */
    private async getTable(field: string): Promise<Table<SelectOptionType, string>> {
        const tableName: string = `${this.TABLE_NAME_TEMPLATE}${field}`;
        return db.table(tableName);
    }

    /**
     * Fetches the first 21 options directly from target table.
     * 
     * @param {string} field The name of the target field.
     * @param {string} search The search term.
     */
    async getOptions(field: string, search: string): Promise<SelectOptionType[]> {
        const cleanSearch: string = search.trim().toLowerCase();
        const table: Table<SelectOptionType, string> = await this.getTable(field);

        let query: Collection<SelectOptionType, string> = table.orderBy("label");
        if (cleanSearch) {
            // Fast cursor-based filter
            query = query.filter((item) =>
                item.label.toLowerCase().includes(cleanSearch)
            );
        }
        return await query.limit(21).toArray();
    }
}

export const dexieFormRepo: DexieFormRepository = new DexieFormRepository();

/**
 * Get form options for target field from IndexedDb in real time.
 *
 * @param {string} field The name of the target field.
 * @param {string} search The search term.
 * @param {FormType} formType The type of form such as dispatch, complete, cancel, report, view.
 * @param {Dictionary} dict The translation dictionary.
 */
export function useLiveFormOptions(field: string, search: string, formType: FormType, dict: Dictionary): useLiveFormOptionReturn {
    const defaultSearchOption: OntologyConcept = genDefaultSelectOption(dict);

    const options: SelectOptionType[] = useLiveQuery(
        async () => await dexieFormRepo.getOptions(field, search),
        [field, search]
    );

    return useMemo(() => {
        if (!options || options.length == 0) return { options: [] };
        const copyOptions: SelectOptionType[] = [...options];
        // Add the default search option only if this is the search form
        if (formType === FormTypeMap.SEARCH) {
            // Default option should only use empty string "" as the value
            copyOptions?.unshift({
                label: defaultSearchOption.label.value,
                value: defaultSearchOption.type.value,
                disabled: false,
            });
        }
        return { options: copyOptions };
    }, [options, search, formType, defaultSearchOption]);
}
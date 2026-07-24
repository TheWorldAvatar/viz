import { AgentResponseBody, InternalApiIdentifierMap } from "@/types/backend-agent";
import { Dictionary } from "@/types/dictionary";
import { FormOptionState, FormOptionStateMap, FormType, FormTypeMap, LifecycleStageMap, OntologyConcept, useLiveFormOptionReturn } from "@/types/form";
import { SelectOptionType } from "@/ui/interaction/dropdown/simple-selector";
import { genDefaultSelectOption } from "@/ui/interaction/form/form-utils";
import { db, FormOptionMetadata } from "@/utils/db/db";
import { Collection, type Table } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { FLAG_EMOJI, SYNC_KEY } from "../constants";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "../internal-api-services";

class DexieFormRepository {
    private TABLE_NAME_TEMPLATE: string = "form_field_";
    private BATCH_SIZE: number = 500;

    private fields: Record<string, FormOptionMetadata> = {};

    /**
     * Registers a field as pending.
     *
     * @param field The name of the field.
     * @param dependentField Optional dependent field.
     */
    registerField(field: string, dependentField?: string): void {
        this.fields[field] = {
            field,
            state: FormOptionStateMap.PENDING,
            count: 0,
            lastUpdated: Date.now(),
            dependentField,
        }
    }

    /**
     * Synchronises with the backend to cache all field options.
     * 
     * @param {string} accountType The type of account.
     * @param {boolean} isContractForm Indicates if the sync occurs for a contract form.
    */
    async sync(accountType: string = "", isContractForm: boolean = false): Promise<void> {
        const currentOptionFields: string[] = Object.keys(this.fields);
        // Synchronises only if there are relevant fields available
        if (currentOptionFields.length === 0) {
            return;
        }

        // Stores metadata state if not present
        for (const [field, currentMeta] of Object.entries(this.fields)) {
            const meta: FormOptionMetadata = await db.metadata.get(field);
            if (!meta || meta?.state == FormOptionStateMap.PENDING) {
                await this.updateFieldMeta(field, FormOptionStateMap.PENDING, 0, currentMeta.dependentField);
            }
        }

        // WARNING: Users must re-register a dynamic table each time as the schema is not preloaded on refresh
        await db.registerDynamicTables(this.TABLE_NAME_TEMPLATE, currentOptionFields);
        this.fields = {}; // reset to prevent outdated data override

        // Starts fetching and syncing with the backend
        await Promise.allSettled(
            currentOptionFields.map(async (field) => {
                const meta: FormOptionMetadata = await db.metadata.get(field);
                if (meta?.state === FormOptionStateMap.COMPLETE) {
                    return;
                }
                const table: Table<SelectOptionType, string> = await this.getTable(field);

                // First batch is 21 options for quick loads
                const parsedField: string = field.replaceAll(" ", "_");
                const selectOptions: SelectOptionType[] = await this.fetchOptions(parsedField, meta.dependentField,
                    0, 21, field == accountType && isContractForm);
                await table.bulkPut(selectOptions);

                if (selectOptions.length < 21) {
                    await this.updateFieldMeta(field, FormOptionStateMap.COMPLETE, selectOptions.length);
                    return;
                }

                let hasMore = true;
                let currentOffset = await table.count();

                while (hasMore) {
                    await this.updateFieldMeta(field, FormOptionStateMap.SYNC, currentOffset);
                    const nextBatch: SelectOptionType[] = await this.fetchOptions(parsedField, meta.dependentField,
                        Math.floor(currentOffset / this.BATCH_SIZE), this.BATCH_SIZE,
                        field == accountType && isContractForm);

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
     * Updates the field metadata.
     * 
     * @param {string} field The name of the field.
     * @param {FormOptionState} state The current state of the field syncing process.
     * @param {number} count The total count of data cached.
     * @param {string} dependentField The name of the dependent field if any. Optional for non-pending state updates.
    */
    private async updateFieldMeta(field: string, state: FormOptionState, count: number, dependentField?: string): Promise<void> {
        let updatedDependentField: string = dependentField;
        // For non-pending states, reuse the previous dependent field
        if (state != FormOptionStateMap.PENDING) {
            const meta: FormOptionMetadata = await db.metadata.get(field);
            updatedDependentField = meta.dependentField;
        }
        await db.metadata.put({
            field,
            state,
            count,
            lastUpdated: Date.now(),
            dependentField: updatedDependentField,
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
     * Fetches the option from server side.
     * 
     * @param {string} field The name of the field.
     * @param {string} parent The name of the parent/dependent field.
     * @param {number} cursor The current location of the fetch.
     * @param {number} limit The current limit to fetch for.
     * @param {boolean} isAccountField Indicates if this is an account field.
     */
    private async fetchOptions(field: string, parent: string, cursor: number, limit: number, isAccountField: boolean): Promise<SelectOptionType[]> {
        const parsedField: string = field.replaceAll(" ", "_");
        if (isAccountField) {
            const responseEntity: AgentResponseBody = await queryInternalApi(makeInternalRegistryAPIwithParams(
                InternalApiIdentifierMap.FILTER,
                LifecycleStageMap.ACCOUNT,
                field,
                "",
                "", null, null, null,
                String(cursor),
                String(limit),
            ));

            const accountFilterOptions: SelectOptionType[] = responseEntity.data?.items as SelectOptionType[] ?? [];
            return accountFilterOptions.map(option => {
                return {
                    ...option,
                    label: `${option.label} ${option.disabled ? FLAG_EMOJI : ""}`,
                }
            });
        }

        const responseEntity: AgentResponseBody = await queryInternalApi(
            makeInternalRegistryAPIwithParams(
                InternalApiIdentifierMap.INSTANCES,
                parsedField,
                SYNC_KEY,
                null,
                parent,
                String(cursor),
                String(limit),
            )
        );
        return (responseEntity.data?.items as SelectOptionType[]) ?? [];
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
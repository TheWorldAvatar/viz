import { AgentResponseBody, InternalApiIdentifierMap } from "@/types/backend-agent";
import { Dictionary } from "@/types/dictionary";
import { FormOptionState, FormOptionStateMap, FormType, FormTypeMap, LABEL_KEY, LifecycleStageMap, OntologyConcept, useLiveFormOptionReturn } from "@/types/form";
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
    private STALE_TIME_S: number = 5 * 60;

    private fields: Record<string, FormOptionMetadata> = {};

    /**
     * Get syncing status
     */
    async getIsSyncing(): Promise<boolean> {
        const meta: FormOptionMetadata = await db.metadata.get(SYNC_KEY);
        return meta?.state === FormOptionStateMap.SYNC;
    }

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
            lastUpdated: this.genCurrentTimestamp(),
            dependentField,
        }
    }

    /**
    * Synchronises with the backend to cache all account options.
    * 
    * @param {string} accountType The type of account.
    * @param {boolean} isConnected Indicates if the platform is online.
    */
    async syncAccount(accountType: string, isConnected: boolean): Promise<void> {
        this.startSyncStatus();
        const meta: FormOptionMetadata = await db.metadata.get(accountType);
        if (meta && (this.genCurrentTimestamp() - meta?.lastUpdated > this.STALE_TIME_S)) {
            await this.updateFieldMeta(accountType, FormOptionStateMap.STALE, 0);
        } else if (!meta || meta?.state == FormOptionStateMap.PENDING) {
            await this.updateFieldMeta(accountType, FormOptionStateMap.PENDING, 0);
        }

        this.backgroundSync([accountType], accountType, isConnected, true);
    }

    /**
     * Synchronises with the backend to cache all field options.
     * 
     * @param {boolean} isConnected Indicates if the platform is online.
     * @param {string} accountType The type of account.
     * @param {boolean} isContractForm Indicates if the sync occurs for a contract form.
    */
    async sync(isConnected: boolean, accountType: string = "", isContractForm: boolean = false): Promise<void> {
        this.startSyncStatus();
        const currentOptionFields: string[] = Object.keys(this.fields);
        // Synchronises only if there are relevant fields available
        if (currentOptionFields.length === 0) {
            return;
        }

        // Stores metadata state if not present
        for (const [field, currentMeta] of Object.entries(this.fields)) {
            const meta: FormOptionMetadata = await db.metadata.get(field);
            // Stale data
            if (meta && (this.genCurrentTimestamp() - meta?.lastUpdated > this.STALE_TIME_S)) {
                await this.updateFieldMeta(field, FormOptionStateMap.STALE, 0, currentMeta.dependentField);
                // If cached data does not exist or is in pending state, resync data
            } else if (!meta || meta?.state == FormOptionStateMap.PENDING) {
                await this.updateFieldMeta(field, FormOptionStateMap.PENDING, 0, currentMeta.dependentField);
            }
        }

        this.fields = {}; // reset to prevent outdated data override

        this.backgroundSync(currentOptionFields, accountType, isConnected, isContractForm);
    }


    /**
     * Generates the current timestamp in seconds.
     */
    private genCurrentTimestamp(): number {
        return Math.floor(Date.now() / 1000);
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
            lastUpdated: this.genCurrentTimestamp(),
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
     * Start the background sync with the database.
     * 
     * @param {string[]} fields The list of fields to sync data for.
    * @param {string} accountType The type of account.
    * @param {boolean} isConnected Indicates if the platform is online.
     * @param {boolean} isAccountField Indicates if this is an account field.
     */
    private async backgroundSync(fields: string[], accountType: string, isConnected: boolean, isAccountField: boolean) {
        // WARNING: Users must re-register a dynamic table each time as the schema is not preloaded on refresh
        await db.registerDynamicTables(this.TABLE_NAME_TEMPLATE, fields);

        if (!isConnected) {
            this.completeSyncStatus();
            return;
        }

        const syncPromises: Promise<void>[] = fields.map(async (field) => {
            const meta: FormOptionMetadata = await db.metadata.get(field);
            const table: Table<SelectOptionType, string> = await this.getTable(field);
            const parsedField: string = field.replaceAll(" ", "_");

            // Grab data in batches of 500, and continue looping if syncing
            // If task has been completed, only grab the new data with the timestamp check
            let hasMore: boolean = true;
            // Reset offset for completed or stale data, as the former will grab new data with timestamp while the latter restarts
            let currentOffset: number = meta?.state === FormOptionStateMap.COMPLETE || meta?.state === FormOptionStateMap.STALE
                ? 0 : await table.count();
            const timestamp: number = meta?.state === FormOptionStateMap.COMPLETE ? meta?.lastUpdated : null;

            while (hasMore) {
                const nextBatch: SelectOptionType[] = await this.fetchOptions(parsedField, meta.dependentField,
                    Math.floor(currentOffset / this.BATCH_SIZE), this.BATCH_SIZE,
                    field === accountType && isAccountField, timestamp);

                // For the first batch after data is now stale, clear the data before adding the new batch
                if (currentOffset == 0 && meta?.state === FormOptionStateMap.STALE) {
                    await table.clear();
                }

                await table.bulkPut(nextBatch);
                currentOffset += nextBatch.length;

                if (nextBatch.length < this.BATCH_SIZE) {
                    hasMore = false;
                    await this.updateFieldMeta(field, FormOptionStateMap.COMPLETE, currentOffset);
                    // Only update the meta to sync if its still pending or stale
                } else if (meta?.state === FormOptionStateMap.PENDING || meta?.state === FormOptionStateMap.STALE) {
                    await this.updateFieldMeta(field, FormOptionStateMap.SYNC, currentOffset);
                }
            };
        });
        // Sync all in the background
        Promise.allSettled(syncPromises).then((results) => {
            results.forEach((result, i) => {
                if (result.status === "rejected") {
                    console.error(`Background sync failed for field "${fields[i + 1]}":`, result.reason);
                }
            });
            this.completeSyncStatus();
        });
    }
    /**
     * Fetches the option from server side.
     * 
     * @param {string} field The name of the field.
     * @param {string} parent The name of the parent/dependent field.
     * @param {number} cursor The current location of the fetch.
     * @param {number} limit The current limit to fetch for.
     * @param {boolean} isAccountField Indicates if this is an account field.
     * @param {number} lastUpdated The optional last updated timestamp.
     */
    private async fetchOptions(field: string, parent: string, cursor: number, limit: number,
        isAccountField: boolean, lastUpdated?: number): Promise<SelectOptionType[]> {
        const parsedField: string = field.replaceAll(" ", "_");
        if (isAccountField) {
            const responseEntity: AgentResponseBody = await queryInternalApi(makeInternalRegistryAPIwithParams(
                InternalApiIdentifierMap.FILTER,
                LifecycleStageMap.ACCOUNT,
                field,
                "",
                !!lastUpdated ? String(lastUpdated) : null,
                null, null, null,
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
                null,
                !!lastUpdated ? String(lastUpdated) : null,
            )
        );
        return (responseEntity.data?.items as SelectOptionType[]) ?? [];
    }

    /**
     * Gets the select option of an option based on the id.
     *
     * @param field The name of the field.
     * @param id The id of the field.
     */
    async getOption(field: string, id: string): Promise<SelectOptionType> {
        const table: Table<SelectOptionType, string> = await this.getTable(field);
        return await table.filter(option => option?.value === id)
            .first();
    }

    /**
     * Fetches the first 21 options directly from target table.
     * 
     * @param {string} field The name of the target field.
     * @param {string} parent The parent value.
     * @param {string} search The search term.
     */
    async getOptions(field: string, parent: string, search: string): Promise<SelectOptionType[]> {
        const cleanSearch: string = search.trim().toLowerCase();
        const table: Table<SelectOptionType, string> = await this.getTable(field);
        let query: Collection<SelectOptionType, string>;
        if (!!parent) {
            query = table.filter((option) => option.parent.trim() === parent.trim());
        } else {
            query = table.toCollection();
        }
        if (cleanSearch) {
            // Fast cursor-based filter
            query = query.filter((item) =>
                item.label.toLowerCase().includes(cleanSearch)
            );
        }

        const sortedItems: SelectOptionType[] = await query.sortBy(LABEL_KEY);
        return sortedItems.slice(0, 21);
    }

    /**
     * Starts the sync status in field metadata
     */
    private async startSyncStatus(): Promise<void> {
        await this.updateFieldMeta(SYNC_KEY, FormOptionStateMap.SYNC, 0);
    }

    /**
     * Starts the sync status in field metadata
     */
    private async completeSyncStatus(): Promise<void> {
        await this.updateFieldMeta(SYNC_KEY, FormOptionStateMap.COMPLETE, 0);
    }
}

export const dexieFormRepo: DexieFormRepository = new DexieFormRepository();

/**
 * Check if the repository is still syncing.
 */
export function useIsSyncing(): boolean {
    const isSyncing: boolean = useLiveQuery(
        async () => {
            return await dexieFormRepo.getIsSyncing();
        },
        []
    );
    return isSyncing;
}

/**
 * Get the account filter from IndexedDb in real time.
 *
 * @param {string} field The name of the target field.
 * @param {string} current The current label.
 */
export function useLiveAccountFilter(field: string, current: string): useLiveFormOptionReturn {
    const isSyncing: boolean = useIsSyncing();
    const account: SelectOptionType = useLiveQuery(
        async () => {
            if (isSyncing || !current) {
                return null;
            }
            const accountOptions: SelectOptionType[] = await dexieFormRepo.getOptions(field, null, current);
            if (accountOptions.length == 1) {
                return accountOptions[0];
            } else {
                console.warn(`Unable to find valid filter for ${current}!`);
                return null;
            }
        },
        [field, current, isSyncing]
    );

    return useMemo(() => {
        if (!account) return { options: [] };
        const copyOptions: SelectOptionType[] = [account];
        return { options: copyOptions };
    }, [account, isSyncing]);
}

/**
 * Get form options for target field from IndexedDb in real time.
 *
 * @param {string} field The name of the target field.
 * @param {string} current The currently selected option.
 * @param {string} parentField The name of the parent field.
 * @param {string} parent The parent value.
 * @param {string} search The search term.
 * @param {FormType} formType The type of form such as dispatch, complete, cancel, report, view.
 * @param {Dictionary} dict The translation dictionary.
 */
export function useLiveFormOptions(field: string, current: string, parentField: string, parent: string, search: string, formType: FormType, dict: Dictionary): useLiveFormOptionReturn {
    const defaultSearchOption: OntologyConcept = genDefaultSelectOption(dict);
    const isSyncing: boolean = useIsSyncing();
    const options: SelectOptionType[] = useLiveQuery(
        async () => {
            if (isSyncing) {
                return [];
            }
            const parentLabel: string = !!parentField ? (await dexieFormRepo.getOption(parentField, parent))?.label : "";
            const availableOptions: SelectOptionType[] = await dexieFormRepo.getOptions(field, parentLabel, search);
            // If there is an existing value, ensure it is in the options list
            if (current) {
                const currentOption: SelectOptionType = await dexieFormRepo.getOption(field, current);
                if (currentOption) {
                    const exists: boolean = availableOptions.some((opt) => opt.value === currentOption.value);
                    if (!exists) {
                        return [currentOption, ...availableOptions];
                    }
                }
            }
            return availableOptions;
        },
        [field, current, parent, search, isSyncing]
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
    }, [options, parent, search, formType, defaultSearchOption]);
}
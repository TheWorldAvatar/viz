import { browserStorageManager } from "@/state/browser-storage-manager";
import { AgentResponseBody, InternalApiIdentifierMap } from "@/types/backend-agent";
import { Dictionary } from "@/types/dictionary";
import { FormOptionState, FormOptionStateMap, FormType, FormTypeMap, LifecycleStageMap, OntologyConcept, useLiveFormOptionReturn } from "@/types/form";
import { SelectOptionType } from "@/ui/interaction/dropdown/simple-selector";
import { genDefaultSelectOption } from "@/ui/interaction/form/form-utils";
import { db, FormOptionMetadata } from "@/utils/db/db";
import { type Table } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
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
     * 
     * @param {string} field The name of the target field.
     */
    private async getTable(field: string): Promise<Table<SelectOptionType, string>> {
        const tableName: string = `${this.TABLE_NAME_TEMPLATE}${field}`;
        return db.table(tableName);
    }

    /**
     * Fetches the options directly from target table.
     * 
     * @param {string} field The name of the target field.
     */
    async getOptions(field: string): Promise<SelectOptionType[]> {
        const table: Table<SelectOptionType, string> = await this.getTable(field);
        return table.toArray();
    }
}

export const dexieFormRepo: DexieFormRepository = new DexieFormRepository();

/**
 * Get form options for target field from IndexedDb in real time.
 *
 * @param {string} field The name of the target field.
 * @param {FormType} formType The type of form such as dispatch, complete, cancel, report, view.
 * @param {boolean} isOptional Indicates if the form field can be optional.
 * @param {Dictionary} dict The translation dictionary.
 */
export function useLiveFormOptions(field: string, formType: FormType, isOptional: boolean, dict: Dictionary): useLiveFormOptionReturn {
    const defaultSearchOption: OntologyConcept = genDefaultSelectOption(dict);

    const options: SelectOptionType[] = useLiveQuery(
        async () => await dexieFormRepo.getOptions(field),
        [field]
    );

    return useMemo(() => {
        const naOption: SelectOptionType = { value: "", label: dict.message.na, disabled: false };
        if (!options || options.length == 0) return { options: [] };
        // Sort the fields by the labels
        const sortedOptions: SelectOptionType[] = [...options]?.sort((a, b) => {
            return a.label.localeCompare(b.label);
        });
        // Add the default search option only if this is the search form
        if (formType === FormTypeMap.SEARCH) {
            // Default option should only use empty string "" as the value
            sortedOptions?.unshift({
                label: defaultSearchOption.label.value,
                value: defaultSearchOption.type.value,
                disabled: false,
            });
            // Add the NA option at the start if this section can be optional
        } else if (isOptional) {
            sortedOptions?.unshift(naOption);
        }
        return { options: sortedOptions };
    }, [options, formType, isOptional, defaultSearchOption]);
}
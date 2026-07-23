import { FormOptionState } from "@/types/form";
import { Dexie, type EntityTable } from "dexie";

export interface DynamicTask {
    event_id: string; // a known primary key
    [key: string]: unknown;
}

export interface FormOptionMetadata {
    field: string;
    state: FormOptionState;
    count: number;
    lastUpdated: number;
}

class TWADatabase extends Dexie {
    tasks!: EntityTable<DynamicTask, "event_id">;
    metadata!: EntityTable<FormOptionMetadata, "field">;

    constructor() {
        super("TWA");
        this.version(1).stores({
            tasks: "event_id",
            metadata: "field"
        });
    }

    /**
     * Safely adds dynamic tables to the schema without losing existing ones
    */
    async registerDynamicTables(tablePrefix: string, currentOptionFields: string[]): Promise<void> {
        const newDbSchema: Record<string, string> = {};
        for (const field of currentOptionFields) {
            const tableName: string = `${tablePrefix}${field}`;
            if (!this.tables.some((t) => t.name === tableName)) {
                newDbSchema[tableName] = "label";
            }
        }

        if (Object.keys(newDbSchema).length > 0) {
            const currentVersion: number = db.verno;
            const newVersion: number = Math.floor(currentVersion) + 1;

            // Preserve existing table schemas
            this.tables.forEach((table) => {
                const primaryKey: string = table.schema.primKey.src;
                const indexes: string = table.schema.indexes.map((idx) => idx.src).join(",");
                newDbSchema[table.name] = primaryKey + (indexes ? `,${indexes}` : "");
            });

            this.close();
            this.version(newVersion).stores(newDbSchema);
            await this.open();
        }
    }
}

export const db: TWADatabase = new TWADatabase();

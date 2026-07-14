import { Dexie, type EntityTable } from "dexie";

export interface DynamicTask {
    event_id: string; // a known primary key
    [key: string]: unknown;
}

const db = new Dexie("TWA") as Dexie & {
    tasks: EntityTable<
        DynamicTask,
        "event_id"
    >
};

db.version(1).stores({
    tasks: "event_id" // Indexed to speed up retrieval
});

export { db };

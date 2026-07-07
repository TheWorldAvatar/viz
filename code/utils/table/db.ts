import { Dexie, type EntityTable } from "dexie";

interface DynamicTask {
    event_id: number; // a known primary key
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

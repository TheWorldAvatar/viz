export const ContextItemMap = {
    NAVBAR: "navbar",
    TABLE_RIBBON: "registry-table-ribbon",
    MAP_CONTROLS_RIBBON: "map-controls-ribbon",
} as const;

export type ContextItemType = typeof ContextItemMap[keyof typeof ContextItemMap];

export const TableCellTagMap = {
    TD: "td",
    TH: "th"
} as const;

export type TableCellTag = typeof TableCellTagMap[keyof typeof TableCellTagMap];
export const TableCellTagMap = {
    TD: "td",
    TH: "th"
} as const;

export type TableCellTag = typeof TableCellTagMap[keyof typeof TableCellTagMap];

export const ComparisonOperatorMap = {
    EQUALS: "eq",
    NOT_EQUALS: "neq",
    GREATER_THAN: "gt",
    GREATER_THAN_OR_EQUALS_TO: "gte",
    LESS_THAN: "lt",
    LESS_THAN_OR_EQUALS_TO: "lte",
    BETWEEN: "between"
} as const;

export type ComparisonOperator = typeof ComparisonOperatorMap[keyof typeof ComparisonOperatorMap];

export const BetweenComparisonOptionMap = {
    INCLUSIVE: "inclusive",
    EXCLUSIVE: "exclusive"
} as const;

export type BetweenComparisonOption = typeof BetweenComparisonOptionMap[keyof typeof BetweenComparisonOptionMap];
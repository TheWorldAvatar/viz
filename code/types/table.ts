export const TableCellTagMap = {
    TD: "td",
    TH: "th"
} as const;

export type TableCellTag = typeof TableCellTagMap[keyof typeof TableCellTagMap];

export const TableDensityMap = {
    DEFAULT: "default",
    COMPACT: "compact",
} as const;

export type TableDensity = typeof TableDensityMap[keyof typeof TableDensityMap];

export interface ColFilterValues {
    isIncluded: boolean;
    values: string[];
}

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

/**
 * The operators a rule condition can use to match a cell value.
 */
export const ConditionalFormatFieldOperatorMap = {
    EQUALS: "equals", // Value is exactly the given text
    NOT_EQUALS: "notEquals", // Value is anything except the given text
    CONTAINS: "contains", // Value contains the given text
    EMPTY: "empty", // Value is null, undefined or ""
    NOT_EMPTY: "notEmpty", // Value is anything other than null, undefined or ""
    GT: "gt", // Value is greater than the number
    GTE: "gte", // Value is greater than or equal to the number
    LT: "lt", // Value is less than the number
    LTE: "lte", // Value is less than or equal to the number
} as const;
export type ConditionalFormatFieldOperator = typeof ConditionalFormatFieldOperatorMap[keyof typeof ConditionalFormatFieldOperatorMap];

export interface ConditionalFormatField {
    background: string;
    operator: ConditionalFormatFieldOperator;
    value: string;
    text?: string;
}

export interface ConditionalFormatSetting {
    conditional_format: string;
    [key: string]: string | ConditionalFormatField[];
}
// For simplicity, we use hex colours for both background and text. 
// In the future, we may want to extend to support other colour formats
export type HexColour = string;

// Background and text colours are optional, but at least one must be provided.
export type ColourStyle = {
  background?: HexColour;
  text?: HexColour;
};

/**
 * The operators a rule condition can use to match a cell value.
 */
export const ColourOperatorMap = {
  EQUALS: "equals", // Value is exactly the given text, e.g. { operator: "equals", value: "3ft" } matches "3ft" but not "3FT"
  NOT_EQUALS: "notEquals", // Value is anything except the given text, including empty, e.g. { operator: "notEquals", value: "3ft" } matches "4ft" and ""
  CONTAINS: "contains", // Value includes the given text, e.g. { operator: "contains", value: "urgent" } matches "very urgent job"
  EMPTY: "empty", // Value is null, undefined or "", e.g. { operator: "empty" } matches a truck cell with no truck assigned
  NOT_EMPTY: "notEmpty", // Value is anything other than null, undefined or "", e.g. { operator: "notEmpty" } matches any truck cell with a truck
  GT: "gt", // Value is greater than the number, e.g. { operator: "gt", value: 100 } matches 150 but not 100
  GTE: "gte", // Value is greater than or equal to the number, e.g. { operator: "gte", value: 100 } matches 100 and 150
  LT: "lt", // Value is less than the number, e.g. { operator: "lt", value: 0 } matches -5 but not 0
  LTE: "lte", // Value is less than or equal to the number, e.g. { operator: "lte", value: 0 } matches 0 and -5
  BETWEEN: "between", // Value is within the range, including both ends, e.g. { operator: "between", min: 50, max: 100 } matches 50, 75 and 100
} as const;
export type ColourOperator = typeof ColourOperatorMap[keyof typeof ColourOperatorMap];

export type ColourCondition =
  | { operator: "equals" | "notEquals" | "contains"; value: string }
  | { operator: "empty" | "notEmpty" }
  | { operator: "gt" | "gte" | "lt" | "lte"; value: number }
  | { operator: "between"; min: number; max: number };

export type ColourRule = {
  column: string; // Column accessor key, e.g. "bin_type"
  condition?: ColourCondition; // No condition colours the whole column
  style: ColourStyle; // Background and/or text colour
};

export type ColourProfile = {
  id: string; // IRI of the colour profile
  table: string; // Table key, e.g. "pending"
  name: string; // Name of the profile"
  rules: ColourRule[]; // The order is the priority: first match wins
};

export type ColourProfileCreateRequest = {
  table: string;
  name: string;
  rules: ColourRule[];
};

export type ColourProfileUpdateRequest = {
  name: string;
  rules: ColourRule[];
};

/** The rules of the active profile grouped by column, split by whether they have a condition. */
export type ColourRuleMap = Map<string, { conditional: ColourRule[]; unconditional: ColourRule[] }>;

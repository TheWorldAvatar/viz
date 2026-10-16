import { ColourCondition, ColourOperatorMap, ColourProfile, ColourRule, ColourRuleMap, ColourStyle } from "@/types/colour-profile";
import { LifecycleStageMap } from "@/types/form";
import { CSSProperties } from "react";
import { getId } from "./client-utils";

const COLOUR_PROFILE_ACTIVE_KEY_PREFIX: string = "colour-profile-active:";
const HEX_COLOUR_PATTERN: RegExp = /^#[0-9a-fA-F]{6}$/;

/**
 * Checks if the value is a colour in the "#rrggbb" format.
 *
 * @param {unknown} value The value to check.
 */
export function isHexColour(value: unknown): value is string {
  return typeof value === "string" && HEX_COLOUR_PATTERN.test(value);
}

/**
 * Retrieves the key identifying a table for colour profiles. Uses the same rule as the table column settings.
 *
 * @param {string} entityType Type of entity for rendering.
 * @param {string} lifecycleStage The current stage of a contract lifecycle to display.
 */
export function getTableKey(entityType: string, lifecycleStage: string): string {
  return lifecycleStage === LifecycleStageMap.GENERAL ? entityType : lifecycleStage;
}

/**
 * Retrieves the local storage key holding the active colour profile id of a table.
 *
 * @param {string} tableKey The table key.
 */
export function getActiveColourProfileStorageKey(tableKey: string): string {
  return `${COLOUR_PROFILE_ACTIVE_KEY_PREFIX}${tableKey}`;
}

/**
 * Groups the rules of a profile by column, so that cells can look up their rules directly.
 * Rules with an unknown operator never match a cell.
 *
 * @param {ColourProfile} profile The active colour profile. May be undefined.
 */
export function buildColourRuleMap(profile: ColourProfile | undefined): ColourRuleMap {
  const ruleMap: ColourRuleMap = new Map();
  if (!Array.isArray(profile?.rules)) return ruleMap;
  for (const rule of profile.rules) {
    if (!ruleMap.has(rule.column)) {
      ruleMap.set(rule.column, { conditional: [], unconditional: [] });
    }
    const columnRules = ruleMap.get(rule.column);
    // Split cell rules from whole column rules, as matching cell rules take precedence regardless of their position
    if (rule.condition) {
      columnRules.conditional.push(rule);
    } else {
      columnRules.unconditional.push(rule);
    }
  }
  return ruleMap;
}

/**
 * Resolves the colours of a cell. Rules with a matching condition take precedence over whole column rules,
 * and the first rule in the list wins within each group. Background and text are resolved separately.
 *
 * @param {ColourRuleMap} ruleMap The rules of the active profile grouped by column.
 * @param {string} column The column accessor key.
 * @param {unknown} rawValue The raw cell value before formatting or translation.
 */
export function resolveCellColour(ruleMap: ColourRuleMap, column: string, rawValue: unknown): ColourStyle {
  const columnRules = ruleMap?.get(column);
  if (!columnRules) return {};
  const value: string | null = normaliseCellValue(rawValue);
  const matchingRules: ColourRule[] = [
    ...columnRules.conditional.filter((rule) => matchesCondition(rule.condition, value)),
    ...columnRules.unconditional,
  ];
  return {
    // Invalid colours are skipped, so that the next matching rule can provide the colour instead
    background: matchingRules.find((rule) => isHexColour(rule.style?.background))?.style.background,
    text: matchingRules.find((rule) => isHexColour(rule.style?.text))?.style.text,
  };
}

/**
 * Retrieves the inline style for a cell, or undefined if the cell is not coloured.
 *
 * @param {ColourRuleMap} ruleMap The rules of the active profile grouped by column.
 * @param {string} column The column accessor key.
 * @param {unknown} rawValue The raw cell value before formatting or translation.
 * @param {boolean} excludeBackground Skips the background colour, e.g. to keep the row selection visible.
 */
export function getCellColourStyle(ruleMap: ColourRuleMap, column: string, rawValue: unknown, excludeBackground: boolean = false): CSSProperties | undefined {
  if (!ruleMap || ruleMap.size === 0) return undefined;
  const colour: ColourStyle = resolveCellColour(ruleMap, column, rawValue);
  const background: string | undefined = excludeBackground ? undefined : colour.background;
  if (!background && !colour.text) return undefined;
  return {
    ...(background && { backgroundColor: background }),
    ...(colour.text && { color: colour.text }),
  };
}

/**
 * Converts a raw cell value into the string that rules are matched against.
 * IRIs are cut down to their last segment. Empty values and arrays return null.
 *
 * @param {unknown} rawValue The raw cell value.
 */
export function normaliseCellValue(rawValue: unknown): string | null {
  if (rawValue === null || rawValue === undefined || Array.isArray(rawValue) || typeof rawValue === "object") {
    return null;
  }
  const value: string = String(rawValue);
  if (value === "") return null;
  return getId(value);
}

/**
 * Checks if the normalised cell value matches the condition. String operators are case sensitive,
 * and number operators never match a value that is not a number.
 *
 * @param {ColourCondition} condition The rule condition.
 * @param {string | null} value The normalised cell value.
 */
function matchesCondition(condition: ColourCondition, value: string | null): boolean {
  switch (condition.operator) {
    case ColourOperatorMap.EMPTY:
      return value === null;
    case ColourOperatorMap.NOT_EMPTY:
      return value !== null;
    case ColourOperatorMap.EQUALS:
      return value === condition.value;
    case ColourOperatorMap.NOT_EQUALS:
      return value !== condition.value;
    case ColourOperatorMap.CONTAINS:
      return value !== null && value.includes(condition.value);
  }
  const numericValue: number = value === null || value.trim() === "" ? Number.NaN : Number(value);
  if (Number.isNaN(numericValue)) return false;
  switch (condition.operator) {
    case ColourOperatorMap.GT:
      return numericValue > condition.value;
    case ColourOperatorMap.GTE:
      return numericValue >= condition.value;
    case ColourOperatorMap.LT:
      return numericValue < condition.value;
    case ColourOperatorMap.LTE:
      return numericValue <= condition.value;
    case ColourOperatorMap.BETWEEN:
      return numericValue >= condition.min && numericValue <= condition.max;
    default:
      return false;
  }
}

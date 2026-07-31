/**
 * Builds defaults for a limited background-submission workflow.
 *
 * This module does not fully reproduce interactive form behaviour. Use it with
 * care and verify compatibility before applying it to other workflows.
 */
import {
  FormTemplateType,
  ID_KEY,
  PROPERTY_GROUP_TYPE,
  PropertyGroup,
  PropertyShape,
  PropertyShapeOrGroup,
  SparqlResponseField,
  TYPE_KEY,
  VALUE_KEY,
} from "@/types/form";

export type FormDefaultValues = Record<string, unknown>;

interface FormDefaultOptions {
  context?: FormDefaultValues;
  now?: Date;
}

const valueOf = (value?: { [VALUE_KEY]?: string }): string | undefined =>
  value?.[VALUE_KEY];

function minimumCount(field: PropertyShapeOrGroup): number {
  const value: string | undefined = valueOf(field.minCount);
  const count: number = value == null ? 0 : Number.parseInt(value, 10);
  return Number.isFinite(count) ? count : 0;
}

function maximumCount(field: PropertyShapeOrGroup): number | undefined {
  const value: string | undefined = valueOf(field.maxCount);
  if (value == null) return undefined;
  const count: number = Number.parseInt(value, 10);
  return Number.isFinite(count) ? count : undefined;
}

function hasType(field: PropertyShape, type: string): boolean {
  return field.datatype === type || field.class?.[ID_KEY] === type;
}

// Number of pre-existing default values supplied for a field by the template.
function defaultValueCount(field: PropertyShape): number {
  if (Array.isArray(field.defaultValue)) return field.defaultValue.length;
  return field.defaultValue != null ? 1 : 0;
}

function scalarDefault(field: PropertyShape, now: Date, index = 0): unknown {
  const values: SparqlResponseField[] = Array.isArray(field.defaultValue)
    ? field.defaultValue
    : field.defaultValue != null
      ? [field.defaultValue]
      : [];
  const explicit: string | undefined = values[index]?.value;
  if (explicit != null && explicit !== "") {
    if (explicit === "tomorrow") {
      const tomorrow: Date = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split("T")[0];
    }
    if (explicit === "startOfYear") return `${now.getUTCFullYear()}-01-01`;
    if (explicit === "startOfMonth") {
      return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
    }
    return explicit;
  }

  if (hasType(field, "http://www.w3.org/2001/XMLSchema#boolean")) return false;
  if (hasType(field, "http://www.w3.org/2001/XMLSchema#integer") ||
    hasType(field, "http://www.w3.org/2001/XMLSchema#decimal") ||
    hasType(field, "http://www.w3.org/2001/XMLSchema#double")) return 0;
  return "";
}

function propertyDefaults(
  fields: PropertyShapeOrGroup[],
  now: Date,
  groupName?: string,
  index = 0,
): FormDefaultValues {
  return fields.reduce<FormDefaultValues>((defaults: FormDefaultValues, item: PropertyShapeOrGroup): FormDefaultValues => {
    if (item[TYPE_KEY]?.includes(PROPERTY_GROUP_TYPE)) {
      const group: PropertyGroup = item as PropertyGroup;
      const name: string = valueOf(group.label) ?? group[ID_KEY];
      const isArray: boolean = maximumCount(group) == null || (maximumCount(group) as number) > 1;
      if (isArray) {
        // Emit one row per pre-existing default value
        const rows: number = Math.max(1, minimumCount(group), ...group.property.map(defaultValueCount));
        defaults[name] = Array.from({ length: rows }, (_row, rowIndex: number) => propertyDefaults(group.property, now, name, rowIndex));
      } else {
        defaults[name] = propertyDefaults(group.property, now, name, index);
      }
      return defaults;
    }

    const field: PropertyShape = item as PropertyShape;
    const name: string = valueOf(field.name) ?? field[ID_KEY];
    const key: string = groupName ? `${groupName} ${name}` : name;
    const isArray: boolean = groupName != null && (maximumCount(field) == null || (maximumCount(field) as number) > 1);
    if (isArray) {
      // One entry per pre-existing default value.
      const count: number = Math.max(1, minimumCount(field), defaultValueCount(field));
      defaults[key] = Array.from({ length: count }, (_entry, entryIndex: number) => ({ [key]: scalarDefault(field, now, entryIndex) }));
    } else {
      defaults[key] = scalarDefault(field, now, index);
    }
    return defaults;
  }, {});
}

/** Builds a complete, server-safe blank payload from a form template. */
export function buildFormDefaults(
  template: FormTemplateType,
  options: FormDefaultOptions = {},
): FormDefaultValues {
  if (!template?.property) return { ...(options.context ?? {}) };
  return {
    ...(options.context ?? {}),
    ...propertyDefaults(template.property, options.now ?? new Date()),
  };
}

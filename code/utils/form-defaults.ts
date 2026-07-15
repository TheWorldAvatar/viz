import {
  FormTemplateType,
  ID_KEY,
  PROPERTY_GROUP_TYPE,
  PropertyGroup,
  PropertyShape,
  PropertyShapeOrGroup,
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

function scalarDefault(field: PropertyShape, now: Date): unknown {
  const explicit: string | undefined = Array.isArray(field.defaultValue)
    ? field.defaultValue[0]?.value
    : field.defaultValue?.value;
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
): FormDefaultValues {
  return fields.reduce<FormDefaultValues>((defaults: FormDefaultValues, item: PropertyShapeOrGroup): FormDefaultValues => {
    if (item[TYPE_KEY]?.includes(PROPERTY_GROUP_TYPE)) {
      const group: PropertyGroup = item as PropertyGroup;
      const name: string = valueOf(group.label) ?? group[ID_KEY];
      const row: FormDefaultValues = propertyDefaults(group.property, now, name);
      const isArray: boolean = maximumCount(group) == null || (maximumCount(group) as number) > 1;
      defaults[name] = isArray ? Array.from({ length: Math.max(1, minimumCount(group)) }, () => ({ ...row })) : row;
      return defaults;
    }

    const field: PropertyShape = item as PropertyShape;
    const name: string = valueOf(field.name) ?? field[ID_KEY];
    const key: string = groupName ? `${groupName} ${name}` : name;
    const isArray: boolean = groupName != null && (maximumCount(field) == null || (maximumCount(field) as number) > 1);
    if (isArray) {
      defaults[key] = Array.from({ length: Math.max(1, minimumCount(field)) }, () => ({ [key]: scalarDefault(field, now) }));
    } else {
      defaults[key] = scalarDefault(field, now);
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

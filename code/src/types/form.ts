export const CONTEXT_KEY = "@context";
export const ID_KEY = "@id";
export const TYPE_KEY = "@type";
export const VALUE_KEY = "@value";
export const PROPERTY_GROUP_TYPE = "PropertyGroup";
export const PROPERTY_SHAPE_TYPE = "PropertyShape";
export const ONTOLOGY_CONCEPT_ROOT = "root";
export const FORM_IDENTIFIER = "form";

export const LifecycleStageMap = {
  GENERAL: "general",
  PENDING: "pending",
  ACTIVE: "active",
  ARCHIVE: "archive",
  TASKS: "tasks",
  REPORT: "report",
  OUTSTANDING: "outstanding",
  SCHEDULED: "scheduled",
  CLOSED: "closed",
  ACCOUNT: "account",
  ACTIVITY: "activity",
  PRICING: "pricing",
} as const;
export type LifecycleStage = typeof LifecycleStageMap[keyof typeof LifecycleStageMap];

export const FormTypeMap = {
  ADD: "add",
  ADD_BILL: "addbill",
  ADD_PRICE: "addprice",
  ADD_INVOICE: "addinvoice",
  ASSIGN_PRICE: "assignprice",
  DELETE: "delete",
  EDIT: "edit",
  VIEW: "view",
  SEARCH: "search",
  DISPATCH: "dispatch",
  COMPLETE: "complete",
  CANCEL: "cancel",
  REPORT: "report"
} as const;
export type FormType = typeof FormTypeMap[keyof typeof FormTypeMap];

export interface SparqlResponseField {
  value: string;
  type: string;
  dataType: string;
  lang: string;
}
export interface FormFieldOptions {
  disabled?: boolean;
  labelStyle?: string[];
  inputStyle?: string[];
}

export type RegistryFieldValues = Record<
  string,
  SparqlResponseField | SparqlResponseField[]
>;

export type OntologyConceptMappings = Record<string, OntologyConcept[]>;

export type OntologyConcept = {
  type: SparqlResponseField;
  label: SparqlResponseField;
  description: SparqlResponseField;
  parent?: SparqlResponseField;
};

export interface FormArrayItemOption {
  fieldId: string;
  label: string;
  placeholder?: string;
}

export type FormTemplateType = {
  "@context": Record<string, string>;
  node: NodeShape[];
  property: PropertyShapeOrGroup[];
};

export interface NodeShape {
  label: JsonLdLiteral;
  comment: JsonLdLiteral;
  property: PropertyShapeOrGroup[];
}

export type PropertyShapeOrGroup = PropertyShape | PropertyGroup;

export interface PropertyShape {
  "@id": string;
  "@type": string;
  name: JsonLdLiteral;
  description: JsonLdLiteral;
  order: number;
  fieldId?: string; // Not present but appended after
  defaultValue?: SparqlResponseField | SparqlResponseField[];
  group?: JsonLdInstance;
  datatype?: string;
  class?: JsonLdInstance;
  dependentOn?: DependentInstance;
  in?: JsonLdInstance[];
  minCount?: JsonLdLiteral;
  maxCount?: JsonLdLiteral;
  minInclusive?: JsonLdLiteral;
  maxInclusive?: JsonLdLiteral;
  minExclusive?: JsonLdLiteral;
  maxExclusive?: JsonLdLiteral;
  singleLine?: JsonLdLiteral;
  minLength?: JsonLdLiteral;
  maxLength?: JsonLdLiteral;
  pattern?: JsonLdLiteral;
  step?: JsonLdLiteral;
}

export interface PropertyGroup {
  "@id": string;
  "@type": string;
  label: JsonLdLiteral;
  comment: JsonLdLiteral;
  order: number;
  property: PropertyShape[];
  minCount?: JsonLdLiteral;
  maxCount?: JsonLdLiteral;
}

interface DependentInstance {
  "@id": string;
  label?: string;
}

interface JsonLdInstance {
  "@id": string;
}

interface JsonLdLiteral {
  "@value": string;
  "@type"?: string;
}

export const defaultSearchOption: OntologyConcept = {
  type: {
    value: "",
    type: "literal",
    dataType: "http://www.w3.org/2001/XMLSchema#string",
    lang: "",
  },
  label: {
    value: "Select All",
    type: "literal",
    dataType: "http://www.w3.org/2001/XMLSchema#string",
    lang: "",
  },
  description: {
    value: "This option allows you to select all available criteria at once.",
    type: "literal",
    dataType: "http://www.w3.org/2001/XMLSchema#string",
    lang: "",
  },
};

export interface RegistryTaskOption {
  contract: string;
  status: string;
  date: string;
  scheduleType: string;
}

export type RegistryTaskType =
  | "dispatch"
  | "complete"
  | "cancel"
  | "report"
  | "view";

export type QuickViewGroupings = Record<string, QuickViewFields>;
export type QuickViewFields = Record<string, SparqlResponseField[]>;

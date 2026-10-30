import {
    RegistryFieldValues,
    RegistryFlatFieldValues,
    SparqlResponseField
} from "@/types/form";

/**
 * Flattens the instance to a string instead of SparqlResponseField.
 *
 * @param {RegistryFieldValues} instance The original column definitions.
 */
export function flattenInstance(instance: RegistryFieldValues): RegistryFlatFieldValues {
    const flatInstance: RegistryFlatFieldValues = {};
    const instanceFields: string[] = Object.keys(instance);

    instanceFields.forEach((instanceField) => {
        const instanceValue: SparqlResponseField | RegistryFieldValues[] = instance[instanceField];
        if (Array.isArray(instanceValue)) {
            // For array fields, only display array field, subfields need not be parsed
            flatInstance[instanceField] = instanceValue.map((nestedFields) =>
                flattenInstance(nestedFields)) as Record<string, string>[];
        } else {
            flatInstance[instanceField] = instanceValue?.value;
        }
    });
    return flatInstance;
}
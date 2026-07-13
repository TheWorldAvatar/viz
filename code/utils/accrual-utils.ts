import { RegistryStatusMap } from "@/types/form";

/** Returns whether an accrual may skip the optional form. */
export function canSkipOptionalAccrual(status?: string): boolean {
  return new Set([
    RegistryStatusMap.COMPLETED,
    RegistryStatusMap.CANCELLED,
    RegistryStatusMap.REPORTED,
  ]).has(status ?? "");
}


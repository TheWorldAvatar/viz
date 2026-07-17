import { RegistryStatusMap } from "@/types/form";

/** Returns whether an accrual may skip the optional form. */
export function canSkipOptionalAccrual(status?: string): boolean {
  return status === RegistryStatusMap.COMPLETED ||
    status === RegistryStatusMap.CANCELLED ||
    status === RegistryStatusMap.REPORTED;
}


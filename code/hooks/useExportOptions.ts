import { usePermissionGuard } from "@/hooks/auth/usePermissionGuard";
import { LifecycleStage } from "@/types/form";
import { RegistryExportSettings } from "@/types/settings";

/**
 * Retrieves the export options available to the user for the current table.
 *
 * @param {RegistryExportSettings[]} exports All export options declared in the UI settings.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {string} recordType The type of the record
 * @param {boolean} isBulkSelection Indicates if multiple records are being exported at once.
 */
export function useExportOptions(
    exports: RegistryExportSettings[],
    lifecycleStage: LifecycleStage,
    recordType: string,
    isBulkSelection: boolean
): RegistryExportSettings[] {
    const isPermitted = usePermissionGuard();

    return exports.filter((exportOption) => {
        const isValidStage: boolean = !exportOption.stage?.length || exportOption.stage.includes(lifecycleStage);
        const isValidRecordType: boolean = !exportOption.recordType?.length || exportOption.recordType.includes(recordType);
        // A bulk selection can only use export options that accept more than one record
        const isValidSelection: boolean = !isBulkSelection || !!exportOption.isBulk;
        return isPermitted(exportOption.permission) && isValidStage && isValidRecordType && isValidSelection;
    });
}

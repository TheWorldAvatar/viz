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

    return exports.filter((report) => {
        const isValidStage: boolean = !report.stage?.length || report.stage.includes(lifecycleStage);
        const isValidRecordType: boolean = !report.recordType?.length || report.recordType.includes(recordType);
        // A bulk selection can only use reports that accept more than one record
        const isValidSelection: boolean = !isBulkSelection || !!report.isBulk;
        return isPermitted(report.permission) && isValidStage && isValidRecordType && isValidSelection;
    });
}

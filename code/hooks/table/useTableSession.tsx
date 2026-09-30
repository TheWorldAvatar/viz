'use client';

import { usePermissionGuard } from '@/hooks/auth/usePermissionGuard';
import { LifecycleStageMap } from '@/types/form';
import { RegistryExportSettings } from '@/types/settings';
import { TableSessionContext, TableSessionState } from '@/utils/table/TableSessionContext';
import { useContext } from 'react';

interface useTableSessionReturn extends TableSessionState {
    isBulkActionPermitted: boolean;
    exportOptions: RegistryExportSettings[];
}

/**
 * Manages the current table session, from managing the active row, history modal to storing the table states.
 */
const useTableSession = (): useTableSessionReturn => {
    const tableSession: TableSessionState = useContext(TableSessionContext);
    if (!tableSession) {
        throw new Error("useTableSessionReturn must be used within a TableSessionContextProvider");
    }

    const isPermitted = usePermissionGuard();
    // An export option targets either a lifecycle stage or a record type.
    const exportOptions: RegistryExportSettings[] = tableSession.exports.filter((exportOption) => {
        const isValidStage: boolean = tableSession.lifecycleStage !== LifecycleStageMap.GENERAL &&
            exportOption.stage?.includes(tableSession.lifecycleStage);
        const isValidRecordType: boolean = !!tableSession.recordType &&
            exportOption.recordType?.includes(tableSession.recordType);
        return isPermitted(exportOption.permission) && (isValidStage || isValidRecordType);
    });

    return {
        ...tableSession,
        isBulkActionPermitted: tableSession.lifecycleStage === LifecycleStageMap.PENDING || tableSession.lifecycleStage === LifecycleStageMap.ACTIVE
            || tableSession.lifecycleStage === LifecycleStageMap.ARCHIVE || tableSession.lifecycleStage === LifecycleStageMap.OUTSTANDING || tableSession.lifecycleStage === LifecycleStageMap.SCHEDULED
            || tableSession.lifecycleStage === LifecycleStageMap.CLOSED || tableSession.lifecycleStage === LifecycleStageMap.BILLABLE,
        exportOptions,
    };
};

export default useTableSession;

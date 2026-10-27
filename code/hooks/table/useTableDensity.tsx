'use client';

import useTableSession from '@/hooks/table/useTableSession';
import { TableDensity, TableDensityMap } from '@/types/table';
import { ButtonSize } from '@/ui/interaction/button';
import { StatusComponentProps } from '@/ui/text/status/status';

interface TableDensityStyles {
    cellPadding: string;
    cellTextSize: string;
    rowMinHeight: string;
    iconButtonSize: ButtonSize;
    statusCellSize: StatusComponentProps['size'];
}

const TABLE_DENSITY_STYLES: Record<TableDensity, TableDensityStyles> = {
    [TableDensityMap.DEFAULT]: {
        cellPadding: "p-1.5 px-2",
        cellTextSize: "text-lg",
        rowMinHeight: "min-h-10",
        iconButtonSize: "icon",
        statusCellSize: "default",
    },
    [TableDensityMap.COMPACT]: {
        cellPadding: "px-2",
        cellTextSize: "text-base",
        rowMinHeight: "min-h-7",
        iconButtonSize: "icon-xs",
        statusCellSize: "sm",
    },
};

/**
 * Retrieves the styles of the table elements, e.g. cells and buttons, based on the density of the current table.
 */
const useTableDensity = (): TableDensityStyles => {
    const { tableDensity } = useTableSession();
    return TABLE_DENSITY_STYLES[tableDensity];
};

export default useTableDensity;

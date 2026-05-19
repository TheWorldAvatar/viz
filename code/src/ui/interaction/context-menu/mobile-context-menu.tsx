"use client";

import { useDispatch, useSelector } from 'react-redux';
import { selectItem, toggleItem } from 'state/context-menu-slice';
import { ContextItemMap } from 'types/settings';
import { useDictionary } from 'hooks/useDictionary';
import { Dictionary } from 'types/dictionary';

import ContextItem, { ContextItemDefinition } from './context-item';

interface MobileContextMenuProps {
    isMobile: boolean;
}

export default function MobileContextMenu(props: Readonly<MobileContextMenuProps>) {
    const dict: Dictionary = useDictionary();
    const dispatch = useDispatch();
    const tableRibbonState: ContextItemDefinition = useSelector(selectItem(ContextItemMap.TABLE_RIBBON));
    const mapRibbonState: ContextItemDefinition = useSelector(selectItem(ContextItemMap.MAP_CONTROLS_RIBBON));

    if (!props.isMobile) return null;

    return (
        <div className="mt-auto pt-4 border-t border-border flex flex-col gap-2">
            {tableRibbonState != null && (
                <ContextItem
                    name={dict.context.tableRibbon.title}
                    description={dict.context.tableRibbon.tooltip}
                    id={tableRibbonState.id}
                    toggled={tableRibbonState.toggled}
                    callback={() => dispatch(toggleItem(tableRibbonState.id))}
                />
            )}
            {mapRibbonState != null && (
                <ContextItem
                    className='flex xl:hidden'
                    name={dict.context.controlRibbon.title}
                    description={dict.context.controlRibbon.tooltip}
                    id={mapRibbonState.id}
                    toggled={mapRibbonState.toggled}
                    callback={() => dispatch(toggleItem(mapRibbonState.id))}
                />
            )}
        </div>
    );
}

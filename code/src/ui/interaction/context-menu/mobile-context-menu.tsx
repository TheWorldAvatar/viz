"use client";

import { useDispatch, useSelector } from 'react-redux';
import { selectItem, toggleItem } from 'state/context-menu-slice';
import { ContextItemMap } from 'types/settings';
import { useDictionary } from 'hooks/useDictionary';
import { Dictionary } from 'types/dictionary';
import { usePathname } from "next/navigation";
import Icon from "@mui/material/Icon";

import ContextItem, { ContextItemDefinition } from './context-item';

interface MobileContextMenuProps {
    isMobile: boolean;
}

export default function MobileContextMenu(props: Readonly<MobileContextMenuProps>) {
    const dict: Dictionary = useDictionary();
    const pathname = usePathname();
    const dispatch = useDispatch();
    const tableRibbonState: ContextItemDefinition = useSelector(selectItem(ContextItemMap.TABLE_RIBBON));
    const mapRibbonState: ContextItemDefinition = useSelector(selectItem(ContextItemMap.MAP_CONTROLS_RIBBON));

    if (!props.isMobile) return null;
    if (tableRibbonState == null && mapRibbonState == null) return null;

    return (
        <div className={`mt-auto pt-5 border-t border-border flex flex-col gap-2 p-2 ${pathname.endsWith("map") && tableRibbonState == null ? "xl:hidden" : ""}`}>
            <div className='flex items-center gap-1.5 mb-1'>
                <Icon sx={{
                    color: "#16687B",
                }} className="material-symbols-outlined shrink-0">
                    {"visibility"}
                </Icon>
                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    {dict.action.view}
                </p>
            </div>
            <div className="flex flex-col gap-2">
                {tableRibbonState != null && (
                    <ContextItem
                        name={dict.context.tableRibbon.title}
                        id={tableRibbonState.id}
                        toggled={tableRibbonState.toggled}
                        callback={() => dispatch(toggleItem(tableRibbonState.id))}
                    />
                )}
                {mapRibbonState != null && (
                    <ContextItem
                        className='flex xl:hidden'
                        name={dict.context.controlRibbon.title}
                        id={mapRibbonState.id}
                        toggled={mapRibbonState.toggled}
                        callback={() => dispatch(toggleItem(mapRibbonState.id))}
                    />
                )}
            </div>
        </div>
    );
}

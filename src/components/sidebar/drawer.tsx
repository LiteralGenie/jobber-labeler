/** @jsxImportSource @emotion/react */

import { Drawer, List, ListItem, ListItemIcon } from "@mui/material"
import { SidebarActions } from "@/store/features/sidebar.slice"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { DrawerItemStyles, DrawerStyles } from "./styles"
import { AppDrawerProps, DrawerItemProps, Pane } from "./types"

/**
 * List of icons
 */
export function AppDrawer({ activePane, panes }: AppDrawerProps) {
    const dispatch = useAppDispatch()

    const displaySelection = useAppSelector(
        (state) => state.activePane.displaySelection
    )

    return (
        <Drawer css={DrawerStyles} variant="permanent">
            <List>
                {panes.map((pane) => (
                    <DrawerItem
                        isSelected={
                            pane.id === activePane?.id && displaySelection
                        }
                        key={pane.id}
                        onSelection={() => onSelection(pane)}
                    >
                        {pane.icon}
                    </DrawerItem>
                ))}
            </List>
        </Drawer>
    )

    function onSelection(pane: Pane) {
        // On icon click, open new pane or hide if already open
        const isAlreadySelected = activePane?.id === pane.id
        const action = isAlreadySelected ? null : pane.id
        dispatch(SidebarActions.setActivePaneId(action))
    }
}

function DrawerItem({
    children: icon,
    isSelected,
    onSelection,
}: DrawerItemProps) {
    return (
        <ListItem
            css={DrawerItemStyles}
            data-isselected={isSelected}
            onClick={onSelection}
        >
            <ListItemIcon>{icon}</ListItemIcon>
        </ListItem>
    )
}

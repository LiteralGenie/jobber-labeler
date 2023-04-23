import { css } from "@emotion/react"

// dashboard.tsx
export const DashboardStyles = css({
    "&": {
        display: "flex",
        flexFlow: "row",
        textAlign: "center",
    },
})

// drawer.tsx
export const DrawerStyles = css({
    "&": {
        width: 56,
    },
})
export const DrawerItemStyles = css({
    "&": {
        cursor: "pointer",

        "> .MuiListItemIcon-root": {
            justifyContent: "center",
            minWidth: 0,
            paddingBottom: "0.5rem",
            paddingTop: "0.5rem",
        },
    },

    '&[data-isselected="true"]': {
        ".MuiListItemIcon-root": {
            color: "red",
        },
    },
})

// sidebar.tsx
export const PaneContainerStyles = css({
    "&": {
        display: "flex",
        flexFlow: "row",

        "> .content": {
            flexGrow: 1,
        },

        "> .handle": {
            display: "flex",

            // handle should look draggable
            cursor: "ew-resize",

            // handle should be bigger than it looks
            paddingLeft: 10,
            paddingRight: 10,

            // paddingLeft should not un-center the content
            marginLeft: -10,

            "> .handle__visible": {
                // handle should be a vertical line
                borderRight: "1px solid rgb(255 255 255 / 12%)",
                width: 3,
            },
        },
    },
})

export const SidebarStyles = css({
    "&": {
        display: "flex",
        flexFlow: "row",
    },
})

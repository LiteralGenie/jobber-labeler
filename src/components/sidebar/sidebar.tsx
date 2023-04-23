/** @jsxImportSource @emotion/react */

// import { BULK_EDIT_PANES } from "../batch/constants"
import { Star } from "@mui/icons-material"
import { useAppSelector } from "@/store/store"
import { AppDrawer } from "./drawer"
import PaneContainer from "./pane-container"
import { SidebarStyles } from "./styles"

function TestPane() {
    return {
        id: "test",
        content: <Star />,
        icon: <Star />,
    }
}

const PANES = [TestPane()]

/**
 * Container for icon list + active pane
 */
export default function Sidebar() {
    const activePane = useAppSelector((state) => {
        const id = state.activePane.activePaneId
        if (!id) return null

        const pane = PANES.find((pane) => pane.id === id)
        if (!pane) {
            console.error("Active pane not found", pane, [PANES])
            return null
        }

        return pane
    })

    return (
        <div css={SidebarStyles}>
            <AppDrawer activePane={activePane} panes={PANES}></AppDrawer>
            {activePane && <PaneContainer>{activePane?.content}</PaneContainer>}
        </div>
    )
}

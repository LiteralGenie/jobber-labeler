import { ReactNode } from "react"

// drawer.tsx
export interface AppDrawerProps {
    activePane: Pane | null
    panes: Pane[]
}
export interface DrawerItemProps {
    children: ReactNode
    isSelected: boolean
    onSelection: () => void
}

// sidebar.tsx
export interface Pane {
    id: string
    content: ReactNode
    icon: ReactNode
}
export interface PaneContainerProps {
    children: ReactNode
}

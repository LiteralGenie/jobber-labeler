import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export const defaultSidebarState = {
    activePaneId: null as string | null, // @TODO: enum
    displaySelection: true,
    width: 350,
}

export const sidebarSlice = createSlice({
    name: "activePane",
    initialState: defaultSidebarState,
    reducers: {
        setActivePaneId: (state, action: PayloadAction<string | null>) => {
            state.activePaneId = action.payload
        },
        setDisplaySelection: (state, action: PayloadAction<boolean>) => {
            state.displaySelection = action.payload
        },
        setWidth: (state, action: PayloadAction<number>) => {
            state.width = action.payload
        },
    },
})

export type SidebarState = typeof defaultSidebarState
export const SidebarActions = sidebarSlice.actions
export const SidebarReducer = sidebarSlice.reducer

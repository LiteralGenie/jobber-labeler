import { configureStore } from "@reduxjs/toolkit"
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import { SidebarReducer } from "./features/sidebar.slice"
import { api } from "./api"
import * as LabelPage from "@/store/features/label-page.slice"

export const STORE = configureStore({
    reducer: {
        // Component being shown in the sidebar
        activePane: SidebarReducer,
        // API data
        [api.reducerPath]: api.reducer,
        // Pagination info (index of selection, sort type, etc)
        [LabelPage.reducerPath]: LabelPage.slice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(api.middleware),
})

export type RootState = ReturnType<typeof STORE.getState>
export const useAppDispatch: () => typeof STORE.dispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// Multi-slice selectors
export const selectLabelPageItem = (state: RootState) => {
    const data = api.endpoints.expLabelSummary.select()(state).data
    if (!data) throw Error(data)
    const idx = state.labelPage.index
    return data[idx]
}

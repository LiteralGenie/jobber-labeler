import { configureStore } from "@reduxjs/toolkit"
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import { SidebarReducer } from "./features/sidebar.slice"
import { api } from "./api"
import * as LabelPage from "@/store/features/label-index.slice"
import * as ExperienceLabel from "@/models/indeed_post_label_experience"
import * as IndeedPost from "@/models/indeed_post"

export const STORE = configureStore({
    reducer: {
        // Component being shown in the sidebar
        activePane: SidebarReducer,
        // API data
        [api.reducerPath]: api.reducer,
        // Pagination info (index of selection, sort type, etc)
        [LabelPage.reducerPath]: LabelPage.slice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
})

export type RootState = ReturnType<typeof STORE.getState>
export const useAppDispatch: () => typeof STORE.dispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// Multi-slice selectors
export const selectActiveLabel = (state: RootState) => {
    // Decide which fields to include in list
    const list = state.labelIndex
    const args = {
        sampleColumns: ["id"] as IndeedPost.Column[],
        labelColumns: ["id"] as ExperienceLabel.Column[],
        sortBy: list.sortBy,
        orderBy: list.orderBy,
    }
    switch (list.category) {
        case "experience":
            args.labelColumns.push("min", "max")
            break
    }

    // Fetch
    const data = api.endpoints.expLabelSummary.select(args)(state).data
    if (!data) throw Error(data)

    // Extract item
    const idx = list.index
    return data[idx]
}

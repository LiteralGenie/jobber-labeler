import { configureStore } from "@reduxjs/toolkit"
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import { SidebarReducer } from "./features/sidebar.slice"
import { api } from "./api"

export const STORE = configureStore({
    reducer: {
        activePane: SidebarReducer,
        [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(api.middleware),
})

export type RootState = ReturnType<typeof STORE.getState>
export const useAppDispatch: () => typeof STORE.dispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

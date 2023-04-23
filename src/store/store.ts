import { configureStore } from "@reduxjs/toolkit"
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import { SidebarReducer } from "./features/sidebar.slice"

export const STORE = configureStore({
    reducer: {
        activePane: SidebarReducer,
    },
})

export type RootState = ReturnType<typeof STORE.getState>
export const useAppDispatch: () => typeof STORE.dispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

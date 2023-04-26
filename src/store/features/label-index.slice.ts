import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export type State = {
    category: "experience"
    index: number
    sortBy: "count"
    orderBy: "asc" | "desc"
}

export const defaultState: State = {
    category: "experience",
    index: 0,
    sortBy: "count",
    orderBy: "desc",
}

export const slice = createSlice({
    name: "activePane",
    initialState: defaultState,
    reducers: {
        setCategory: (state, action: PayloadAction<State["category"]>) => {
            state.category = action.payload
        },
        setIndex: (state, action: PayloadAction<State["index"]>) => {
            state.index = action.payload
        },
        setSortBy: (state, action: PayloadAction<State["sortBy"]>) => {
            state.sortBy = action.payload
        },
        setOrderBy: (state, action: PayloadAction<State["orderBy"]>) => {
            state.orderBy = action.payload
        },
    },
})

export const reducerPath = "labelIndex"

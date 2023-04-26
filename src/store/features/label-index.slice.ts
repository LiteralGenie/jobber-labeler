import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export const defaultState = {
    category: "experience",
    index: 0,
    sortOrder: "asc",
    sortType: "id",
}

export const slice = createSlice({
    name: "activePane",
    initialState: defaultState,
    reducers: {
        setCategory: (state, action: PayloadAction<"experience">) => {
            state.category = action.payload
        },
        setIndex: (state, action: PayloadAction<number>) => {
            state.index = action.payload
        },
        setSortOrder: (state, action: PayloadAction<"asc" | "desc">) => {
            state.sortOrder = action.payload
        },
        setSortType: (state, action: PayloadAction<"id">) => {
            state.sortType = action.payload
        },
    },
})

export type State = typeof defaultState
export const reducerPath = "labelIndex"

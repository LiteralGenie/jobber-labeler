import { ExperienceLabel, IndeedPost } from "@/models"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export type State = {
    category: "experience"
    index: number
    sortBy: "createdAt"
    orderBy: "asc" | "desc"
}

export const defaultState: State = {
    category: "experience",
    index: 0,
    sortBy: "createdAt",
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

export const reducerPath = "labels"

// Arguments for the ExperienceLabel.getAllSummarized() endpoint
export const selectSummaryApiArgs = ({ labels: state }: { [reducerPath]: State }) => {
    const args = {
        sampleColumns: ["id"] as IndeedPost.Column[],
        labelColumns: ["id"] as ExperienceLabel.Column[],
        sortBy: state.sortBy,
        orderBy: state.orderBy,
    }
    switch (state.category) {
        case "experience":
            args.labelColumns.push("min", "max")
            break
    }
    return args
}

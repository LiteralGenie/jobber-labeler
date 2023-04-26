import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import * as ExperienceLabel from "@/models/indeed_post_label_experience"
import * as IndeedPost from "@/models/indeed_post"
import { ApiData } from "@/utils"

export const api = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000/api/" }),
    endpoints: (builder) => ({
        sample: builder.query<IndeedPost.Model, string>({
            query: (id) => `data/samples/${id}`,
            transformResponse: ({ data }: ApiData<IndeedPost.Model>) => data,
        }),

        // prettier-ignore
        expLabelSummary: builder.query<Record<string, ExperienceLabel.Summary>, void>({
            query: () => "data/experience-labels/summary",
            transformResponse: ({ data }: { data: Record<string, ExperienceLabel.Summary> }) => data
        }),
        expLabel: builder.query<ExperienceLabel.Model, number>({
            query: (id) => `data/experience-labels/${id}`,
            transformResponse: ({ data }: ApiData<ExperienceLabel.Model>) => data,
        }),
    }),
})

export const { useSampleQuery, useExpLabelSummaryQuery, useExpLabelQuery } = api

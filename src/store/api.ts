import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { ExperienceLabel } from "@/models"
import { IndeedPost } from "@/models"
import { ApiData } from "@/utils"

type SummaryEndpointArgs = Omit<ExperienceLabel.SummaryOpts, "conn">

export const api = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000/api/" }),
    endpoints: (builder) => ({
        sample: builder.query<IndeedPost.Model, string>({
            query: (id) => `data/samples/${id}`,
            transformResponse: ({ data }: ApiData<IndeedPost.Model>) => data,
        }),
        expLabelSummary: builder.query<ExperienceLabel.Summary[], SummaryEndpointArgs>({
            query: (opts: SummaryEndpointArgs) => {
                const path = "data/experience-labels/summary"
                const params = {
                    ["sample-columns"]: opts.sampleColumns?.join(",") || "",
                    ["label-columns"]: opts.labelColumns?.join(",") || "",
                    ["sort-by"]: opts.sortBy,
                    ["order-by"]: opts.orderBy,
                }
                const queryString =
                    "?" +
                    Object.entries(params)
                        .map(([k, v]) => `${k}=${v}`)
                        .join("&")
                return path + queryString
            },
            transformResponse: ({ data }: { data: ExperienceLabel.Summary[] }) => data,
        }),
        expLabel: builder.query<ExperienceLabel.Model, number>({
            query: (id) => `data/experience-labels/${id}`,
            transformResponse: ({ data }: ApiData<ExperienceLabel.Model>) => data,
        }),
    }),
})

export const { useSampleQuery, useExpLabelSummaryQuery, useExpLabelQuery } = api

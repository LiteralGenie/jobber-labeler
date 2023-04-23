import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import * as ExperienceLabel from "@/models/indeed_post_label_experience"
import * as IndeedPost from "@/models/indeed_post"

type ExpLabels = Record<string, { label: ExperienceLabel.Model; count: number }>

export const api = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000/api/" }),
    endpoints: (builder) => ({
        sampleIds: builder.query<string[], void>({
            query: () => `data/samples/ids`,
            transformResponse: ({ data }) => data,
        }),
        sample: builder.query<IndeedPost.RawDb, string>({
            query: (id) => `data/samples/${id}`,
            transformResponse: ({ data }) => data,
        }),

        // prettier-ignore
        expLabels: builder.query<ExpLabels, void>({
            query: () => "data/experience_labels",
            transformResponse: ({ data }: { data: ExperienceLabel.Model[] }) => {
                return data.reduce((result, model) => {
                    let curr = result[model.idSample]
                    if (!curr) {
                        // Create if not exists
                        curr = result[model.idSample] = { label: model, count: 0 }
                    } else if (model.createdAt > curr.label.createdAt) {
                        // Override if this label is newer
                        curr.label = model
                    }
                    
                    curr.count += 1
                    return result
                }, {} as ExpLabels)
            }
        }),
    }),
})

export const { useSampleIdsQuery, useSampleQuery, useExpLabelsQuery } = api

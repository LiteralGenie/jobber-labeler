import * as api from "@/store/api"

export default function Labeler() {
    const { data: expLabels } = api.useExpLabelsQuery()
    const { data: sampleIds } = api.useSampleIdsQuery()
    return (
        <div>
            <div>exp labels</div>
            {JSON.stringify(expLabels, undefined, 2)}

            <div>sample ids</div>
            {JSON.stringify(sampleIds, undefined, 2)}
        </div>
    )
}

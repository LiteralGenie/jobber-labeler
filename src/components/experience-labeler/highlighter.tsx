import { ExperienceLabel, IndeedPost } from "@/models"

export type HighlighterProps = {
    sample: Partial<IndeedPost.Model>
    labels: Array<Partial<ExperienceLabel.Model>>
}

export default function Highlighter({ sample, labels }: HighlighterProps) {
    return <div></div>
}

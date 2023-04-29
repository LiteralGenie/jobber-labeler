import { ExperienceLabel, IndeedPost } from "@/models"

export type HighlighterProps = {
    sample: Partial<IndeedPost.Model>
    label: Partial<ExperienceLabel.Model> | null
}

export default function Highlighter({ sample, label }: HighlighterProps) {
    return <div></div>
}

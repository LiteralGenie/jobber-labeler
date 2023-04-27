import { ExperienceLabel } from "@/models"

export type HighlighterProps = {
    summary: ExperienceLabel.Summary
}

export default function Highlighter({ summary }: HighlighterProps) {
    return (
        <div>
            {" "}
            highlighter
            {JSON.stringify(summary, undefined, 2)}
        </div>
    )
}

import { ExperienceLabel, IndeedPost } from "@/models"

export type ExperienceFormProps = {
    sample: Partial<IndeedPost.Model>
    label: Partial<ExperienceLabel.Model> | null
}

export default function ExperienceForm({ sample, label }: ExperienceFormProps) {
    return <div>form</div>
}

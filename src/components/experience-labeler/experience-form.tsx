/** @jsxImportSource @emotion/react */

import { ExperienceLabel, IndeedPost } from "@/models"
import { css } from "@emotion/react"
import { UseFormReturn, useFieldArray, useForm } from "react-hook-form"
import { ExperienceLabelForm } from "./experience-labeler"

export type ExperienceFormProps = {
    sample: Partial<IndeedPost.Model>
    labels: Array<Partial<ExperienceLabel.Model>>,
    form: UseFormReturn<ExperienceLabelForm>
}

export default function ExperienceForm({ sample, labels, form }: ExperienceFormProps) {
    const { register, handleSubmit, control, getValues } = form
    const labelFields = useFieldArray({
        control,
        name: "labels",
    })

    // console.log("parent", getValues())

    const onSubmit = (data: any) => {
        console.log(data)
        console.log("submit", getValues())
    }
    const onAddLabel = () => {
        labelFields.append({
            category: 'general',
            min: 0,
            max: 1,
            conditions: ["aza"],
            citations: [{ start: 0, end: 1 }],
        })
        return false
    }

    return (
        <form css={styles}>
            {labelFields.fields.map((item, idx) => (
                <Label
                    key={item.id}
                    control={control}
                    register={register}
                    value={item}
                    index={idx}
                    formPath={`labels.${idx}`}
                ></Label>
            ))}
            <button type="button" onClick={onAddLabel}>
                Add Label
            </button>
            <button type="button" onClick={onSubmit}>
                Submit
            </button>
        </form>
    )
}

function Label({
    control,
    register,
    formPath,
}: {
    control: any
    register: any
    value: any
    index: number
    formPath: string
}) {
    const citationArray = useFieldArray({
        control,
        name: `${formPath}.citations`,
    })

    return (
        <div>
            <label htmlFor="min">Min</label>
            <input {...register(`${formPath}.min`)} type="number" />

            <label htmlFor="max">Max</label>
            <input {...register(`${formPath}.max`)} type="number" />

            <label htmlFor="conditions">Conditions</label>
            <input {...register(`${formPath}.conditions`)} type="text" />

            <div>Citations</div>
            {citationArray.fields.map((item, idx) => (
                <div key={item.id}>
                    <input {...register(`${formPath}.citations.${idx}.start`)} type="number" />
                    <input {...register(`${formPath}.citations.${idx}.end`)} type="number" />
                </div>
            ))}
        </div>
    )
}

const styles = css({
    "&": {
        display: "flex",
        flexFlow: "column",
        input: {
            color: "black",
        },
    },
})

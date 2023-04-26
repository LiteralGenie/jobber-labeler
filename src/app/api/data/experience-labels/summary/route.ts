import * as ExperienceLabel from "@/models/indeed_post_label_experience"
import { ValidationError } from "@/utils"
import { getDb } from "@/utils-server"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const conn = getDb()

    try {
        const rawParams = Object.fromEntries(new URL(req.url).searchParams)
        const params = {
            sampleColumns: rawParams["sample-columns"]?.split(","),
            labelColumns: rawParams["label-columns"]?.split(","),
            orderBy: rawParams["order-by"],
            sortBy: rawParams["sort-by"],
        }
        const data = ExperienceLabel.getAllSummarized(
            conn,
            params.sampleColumns,
            params.labelColumns,
            params.orderBy,
            params.sortBy
        )
        return NextResponse.json({ data })
    } catch (e) {
        if (e instanceof ValidationError) {
            return new NextResponse(e.message, { status: 400 })
        }
        throw e
    }
}

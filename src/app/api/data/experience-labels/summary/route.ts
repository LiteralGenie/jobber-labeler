import { ExperienceLabel } from "@/models"
import { ValidationError } from "@/utils"
import { getDb } from "@/utils-server"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const conn = getDb()

    try {
        const rawParams = Object.fromEntries(new URL(req.url).searchParams)
        const params = {
            conn: conn,
            sampleColumns: rawParams["sample-columns"]?.split(","),
            labelColumns: rawParams["label-columns"]?.split(","),
            sortBy: rawParams["sort-by"],
            orderBy: rawParams["order-by"],
        }
        const data = ExperienceLabel.getAllSummarized({ ...params })
        return NextResponse.json({ data })
    } catch (e) {
        if (e instanceof ValidationError) {
            return new NextResponse(e.message, { status: 400 })
        }
        throw e
    }
}

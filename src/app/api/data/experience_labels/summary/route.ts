import * as ExperienceLabel from "@/models/indeed_post_label_experience"
import { getDb } from "@/utils-server"
import { NextResponse } from "next/server"

export async function GET() {
    const conn = getDb()
    const data = ExperienceLabel.getAllSummarized(conn)
    return NextResponse.json({ data })
}

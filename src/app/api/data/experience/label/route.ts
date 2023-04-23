import * as ExperienceLabel from "@/app/models/indeed_post_label_experience"
import { getDb } from "@/app/utils"
import { NextResponse } from "next/server"

export async function GET() {
    const conn = getDb()
    const data = ExperienceLabel.getAll(conn)
    return NextResponse.json({ data })
}

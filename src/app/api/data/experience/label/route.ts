import * as ExperienceLabel from "@/models/indeed_post_label_experience"
import { getDb } from "@/app/utils"
import { NextResponse } from "next/server"

export async function GET() {
    const conn = getDb()
    const data = ExperienceLabel.getAll(conn)
    return NextResponse.json({ data })
}

export async function POST(request: Request) {
    const conn = getDb()
    const data = (await request.json()) as ExperienceLabel.PayloadCreate
    const model = ExperienceLabel.insert(data, conn)
    return NextResponse.json({ model })
}

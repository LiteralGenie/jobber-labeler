import { ExperienceLabel } from "@/models"
import { getDb } from "@/utils-server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    const conn = getDb()
    const payload = (await request.json()) as ExperienceLabel.PayloadCreate
    const data = ExperienceLabel.insert(payload, conn)
    return NextResponse.json({ data })
}

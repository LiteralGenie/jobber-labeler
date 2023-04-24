import * as ExperienceLabel from "@/models/indeed_post_label_experience"
import { getDb } from "@/utils-server"
import { RequestParams } from "@/utils"
import { NextResponse } from "next/server"

export async function GET(
    request: Request,
    { params: { id } }: RequestParams<{ id: string }>
) {
    const conn = getDb()
    const data = ExperienceLabel.get(conn, parseInt(id))
    if (!data) return new Response(null, { status: 404 })
    return NextResponse.json({ data })
}

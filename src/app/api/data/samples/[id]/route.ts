import * as IndeedPost from "@/models/indeed_post"
import { RequestParams, getDb } from "@/app/utils"
import { NextResponse } from "next/server"

export async function GET(
    request: Request,
    { params: { id } }: RequestParams<{ id: string }>
) {
    const conn = getDb()
    const data = IndeedPost.get(conn, id)
    if (!data) return new Response(null, { status: 404 })
    return NextResponse.json({ data })
}

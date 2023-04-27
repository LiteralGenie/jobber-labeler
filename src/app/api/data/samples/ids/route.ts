import { IndeedPost } from "@/models"
import { getDb } from "@/utils-server"
import { NextResponse } from "next/server"

export async function GET() {
    const conn = getDb()
    const data = IndeedPost.getAllIds(conn)
    if (!data) return new Response(null, { status: 404 })
    return NextResponse.json({ data })
}

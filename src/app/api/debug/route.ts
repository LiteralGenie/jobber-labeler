import * as paths from "@/config/paths"

export async function GET(request: Request) {
    return { a: 1, ...paths }
}

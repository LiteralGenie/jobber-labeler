import * as sqlite from "better-sqlite3"

// This table should've been created by the collector repo
const TABLE_ID = "indeed_post"

export type RawDb = {
    id: string
    createdAt: string
    updatedAt: string

    company: string
    companyId: string | null
    html: string
    textContent: string
    title: string
}

export interface Model {
    id: string
    createdAt: string
    updatedAt: string

    company: string
    companyId: string | null
    html: string
    textContent: string
    title: string
}

export function get(conn: sqlite.Database, id: string): Model {
    return conn
        .prepare(`SELECT * FROM ${TABLE_ID} WHERE id = ?`)
        .get(id) as RawDb
}

export function getAllIds(conn: sqlite.Database): string[] {
    return (
        conn.prepare(`SELECT id FROM ${TABLE_ID}`).all() as Array<{
            id: string
        }>
    ).map(({ id }) => id)
}

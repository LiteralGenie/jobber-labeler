import * as sqlite from "better-sqlite3"

// This table should've been created by the collector repo
export const TABLE_ID = "indeed_post"

// What's in the DB
class _RawDb {
    // This is a class instead of interface so that we can extract the keys into Columns at runtime
    id: string = ""
    createdAt: string = ""
    updatedAt: string = ""

    company: string = ""
    companyId: string | null = ""
    html: string = ""
    textContent: string = ""
    title: string = ""
}
export interface RawDb extends _RawDb {}
export type Column = keyof RawDb
export const Columns = Object.keys(new _RawDb()) as Readonly<Column[]>

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
    const result = {...conn.prepare(`SELECT * FROM ${TABLE_ID} WHERE id = ?`).get(id) as RawDb}
    result.textContent = result.textContent + '\n' + result.textContent
    return result
}

export function getAllIds(conn: sqlite.Database): { id: string }[] {
    return conn.prepare(`SELECT id FROM ${TABLE_ID}`).all() as Array<{
        id: string
    }>
}

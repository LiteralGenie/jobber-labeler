import * as sqlite from "better-sqlite3"
import * as IndeedPost from "./indeed_post"
import { checkWhitelist, mergeDistinct } from "@/utils"

const TABLE_ID = "indeed_post_label_experience"

export function initTable(conn: sqlite.Database) {
    conn.prepare(
        `
        CREATE TABLE IF NOT EXISTS ${TABLE_ID} (
            id              INTEGER         NOT NULL,
            idSample        TEXT            NOT NULL,
            createdAt       TEXT            NOT NULL,
            updatedAt       TEXT            NOT NULL,

            category        TEXT            NOT NULL,
            citations       TEXT            NOT NULL,   --json
            conditions      TEXT            NOT NULL,   --json
            min             INTEGER         NOT NULL,
            max             INTEGER,

            PRIMARY KEY (id),
            FOREIGN KEY (idSample) REFERENCES indeed_post (id)
        ) STRICT;
    `
    ).run()
}

// What's in the DB
class _RawDb {
    // This is a class instead of interface so that we can extract the keys into Columns at runtime
    id: number = 0
    idSample: string = ""
    createdAt: string = ""
    updatedAt: string = ""

    category: string = ""
    citations: string = ""
    conditions: string = ""
    min: number = 0
    max: number | null = null
}
export interface RawDb extends _RawDb {}
export type Column = keyof RawDb
export const Columns = Object.keys(new _RawDb()) as Readonly<Column[]>

// Interface we generally interact with
export interface Model {
    id: number
    idSample: string
    createdAt: string
    updatedAt: string

    category: string
    citations: Array<{ start: number; end: number }>
    conditions: string[]
    min: number
    max: number | null
}

// User-submitted data
export interface PayloadCreate {
    idSample: string

    category: string
    citations: Array<{ start: number; end: number }>
    conditions?: string[]
    min: number
    max?: number
}

export function insert(data: PayloadCreate, conn: sqlite.Database): Model {
    const now = new Date()
    const withDefaults = {
        conditions: [],
        max: null,
        ...data,
        updatedAt: now.toISOString(),
        createdAt: now.toISOString(),
    }
    const row: Record<string, string | number | null> = {
        ...withDefaults,
        citations: JSON.stringify(withDefaults.citations),
        conditions: JSON.stringify(withDefaults.conditions),
    }
    const result = conn
        .prepare(
            `
            INSERT INTO ${TABLE_ID}
            (idSample,   createdAt,  updatedAt,  category,  citations,  conditions,  min,  max) VALUES
            (:idSample, :createdAt, :updatedAt, :category, :citations, :conditions, :min, :max)
            `
        )
        .run(row)
    const model = conn
        .prepare(`SELECT * FROM ${TABLE_ID} WHERE rowid = ?`)
        .get(result.lastInsertRowid) as Model
    return model
}

export function get(conn: sqlite.Database, id: number): Model | undefined {
    const row = conn.prepare(`SELECT * FROM ${TABLE_ID} WHERE id = ?`).get(id) as RawDb | undefined
    if (!row) return row

    return {
        ...row,
        citations: JSON.parse(row.citations ?? "[]"),
        conditions: JSON.parse(row.conditions ?? "[]"),
    }
}

// Arguments this function will accept, but may possibly cause errors
export interface RawSummaryOpts {
    conn: sqlite.Database
    sampleColumns?: string[]
    labelColumns?: string[]
    sortBy: string
    orderBy: string
}
// Arguments this function expects
export interface SummaryOpts extends RawSummaryOpts {
    conn: sqlite.Database
    sampleColumns?: IndeedPost.Column[]
    labelColumns?: Column[]
    sortBy: "createdAt"
    orderBy: "asc" | "desc"
}
// Return type
export type Summary = {
    sample: Partial<IndeedPost.Model>
    // nulls come from the JOIN
    labels: Array<Partial<Model>>
}
export function getAllSummarized({
    conn,
    sampleColumns,
    labelColumns,
    sortBy = "createdAt",
    orderBy = "asc",
}: RawSummaryOpts): Summary[] {
    // Validate
    const checkedSampleColumns = checkWhitelist(
        sampleColumns || [],
        IndeedPost.Columns,
        "Invalid sample columns:"
    )
    const checkedLabelColumns = checkWhitelist(
        labelColumns || [],
        Columns,
        "Invalid label columns:"
    )
    const checkedSortBy = checkWhitelist([sortBy], ["createdAt"] as const, "Invalid sort type:")[0]
    checkWhitelist([orderBy], ["asc", "desc"], "Invalid order:")

    // Append required columns
    const queryColumnsSamples = mergeDistinct(checkedSampleColumns, ["id"] as IndeedPost.Column[])
    const queryColumnsLabels = mergeDistinct(checkedLabelColumns, [
        "idSample",
        "createdAt",
        "category",
    ] as Column[])
    const sampleColumnQuery = queryColumnsSamples
        .map((name) => `s.${name} as __sample__${name}`)
        .join(",")
    const labelColumnQuery = queryColumnsLabels
        .map((name) => `l.${name} as __label__${name}`)
        .join(",")

    // Sort order
    const sortMap = { createdAt: "__label__createdAt" }
    const orderByQuery = `ORDER BY ${sortMap[checkedSortBy]} ${orderBy.toUpperCase()}`

    // Run query
    const rows = conn
        .prepare(
            // The MAX(createdAt) ensures we get the most recent label for each category type
            // (Labels are never updated, only inserted)
            `SELECT *, MAX(__label__createdAt) FROM (
                SELECT 
                    ${labelColumnQuery},
                    ${sampleColumnQuery}
                FROM ${IndeedPost.TABLE_ID} s
                LEFT JOIN ${TABLE_ID} l ON s.id = l.idSample
              )
            GROUP BY __sample__id, __label__category
            ${orderByQuery}`
        )
        .all() as Array<{ count: number } & any>

    // Convert JSON columns from string to JSON
    const parsed: Array<Summary & { labels: [Partial<Model>] }> = rows.map((r) => {
        // Rename columns that were prefixed with table name
        const sample = extractRawFromQueryResult<IndeedPost.RawDb>(r, "__sample__")
        const label = extractRawFromQueryResult<RawDb>(r, "__label__")

        // Build result
        const obj = {
            sample: sample,
            labels: [
                {
                    ...label,
                    conditions: JSON.parse(label.conditions ?? "[]"),
                    citations: JSON.parse(label.citations ?? "[]"),
                },
            ] as [Partial<Model>],
        }

        // Filter out unrequested columns
        obj.sample = filterProperties(obj.sample, checkedSampleColumns)
        obj.labels[0] = filterProperties(obj.labels[0], checkedLabelColumns)

        return obj
    })

    // Group labels for the same sample
    const grouped: Record<string, Summary[]> = {}
    parsed.forEach((s) => {
        grouped[s.sample.id as string] = []
        grouped[s.sample.id as string].push(s)
    })

    // Flatten each group and remove nulls
    // (which come from JOIN'ing samples without labels)
    const normalized: Summary[] = Object.values(grouped).map((grp) => {
        const labels = grp.map((summary) => summary.labels[0]).filter((lbl) => lbl.id !== null)
        return {
            ...grp[0],
            labels: labels,
        }
    })

    return normalized
}

function extractRawFromQueryResult<R>(row: any, tablePrefix: string): Partial<R> {
    const renamed: Partial<R> = {}
    Object.entries(row).forEach(([k, v]) => {
        let key = k
        if (k.startsWith(tablePrefix)) {
            key = k.replace(tablePrefix, "")
        }
        // @ts-ignore
        renamed[key] = v
    })

    return renamed
}

function filterProperties<T>(obj: T, props: Array<keyof T>): T {
    const kvs = props.map((k) => [k, obj[k]])
    return Object.fromEntries(kvs)
}

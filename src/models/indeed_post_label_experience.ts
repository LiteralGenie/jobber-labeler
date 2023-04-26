import * as sqlite from "better-sqlite3"
import * as IndeedPost from "./indeed_post"
import { ValidationError, ValueOf, checkWhitelist, mergeDistinct } from "@/utils"

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
            min             INTEGER,
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
    min: number | null = null
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
    citations: Array<[number, number]>
    conditions: string[]
    min: number | null
    max: number | null
}

// User-submitted data
export interface PayloadCreate {
    idSample: string

    category: string
    citations: Array<[number, number]>
    conditions?: string[]
    min?: number
    max?: number
}

export function insert(data: PayloadCreate, conn: sqlite.Database): Model {
    const now = new Date()
    const withDefaults = {
        conditions: [],
        min: null,
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

export function get(conn: sqlite.Database, id: number): Model {
    const row = conn.prepare(`SELECT * FROM ${TABLE_ID} WHERE id = ?`).get(id) as RawDb
    return {
        ...row,
        citations: JSON.parse(row.citations),
        conditions: JSON.parse(row.conditions),
    }
}

export type Summary = {
    sample: Partial<IndeedPost.Model> | Record<keyof IndeedPost.Model, null>
    label: Partial<Model> | Record<keyof Model, null>
    count: number
}
export function getAllSummarized(
    conn: sqlite.Database,
    sampleColumns: string[] | undefined,
    labelColumns: string[] | undefined,
    orderBy: string = "count",
    sortBy: string = "asc"
): Summary[] {
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
    checkWhitelist([orderBy], ["count"], "Invalid orderBy type:")
    checkWhitelist([sortBy], ["asc", "desc"], "Invalid sort type:")

    // Append required columns
    const queryColumnsSamples = mergeDistinct(checkedSampleColumns, ["id"] as IndeedPost.Column[])
    const queryColumnsLabels = mergeDistinct(checkedLabelColumns, [
        "idSample",
        "createdAt",
    ] as Column[])
    const sampleColumnQuery = queryColumnsSamples
        .map((name) => `s.${name} as __sample__${name}`)
        .join(",")
    const labelColumnQuery = queryColumnsLabels
        .map((name) => `l.${name} as __label__${name}`)
        .join(",")

    // Sort order
    const orderByQuery = `ORDER BY ${orderBy} ${sortBy.toUpperCase()}`

    // Run query
    const rows = conn
        .prepare(
            // The MAX(createdAt) ensures we get the non-aggregated cols from the most recent label
            `SELECT *, COUNT(__label__idSample) as count, MAX(__label__createdAt) FROM (
                SELECT 
                    ${labelColumnQuery},
                    ${sampleColumnQuery}
                FROM ${IndeedPost.TABLE_ID} s
                LEFT JOIN ${TABLE_ID} l ON s.id = l.idSample
              )
            GROUP BY __sample__id
            ${orderByQuery}`
        )
        .all() as Array<{ count: number } & any>

    const result: Summary[] = rows.map((r) => {
        // Rename columns that were prefixed with table name
        const sample = extractRawFromQueryResult<IndeedPost.RawDb>(r, "__sample__")
        const label = extractRawFromQueryResult<RawDb>(r, "__label__")

        // Build result
        const obj: Summary = {
            sample: sample,
            label: {
                ...label,
                conditions: JSON.parse(label.conditions ?? "[]"),
                citations: JSON.parse(label.citations ?? "[]"),
            },
            count: r.count,
        }

        // Filter out unrequested columns
        obj.sample = filterProperties(obj.sample, checkedSampleColumns)
        obj.label = filterProperties(obj.label, checkedLabelColumns)

        return obj
    })
    return result
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

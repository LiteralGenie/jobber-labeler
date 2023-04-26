import * as sqlite from "better-sqlite3"
import * as IndeedPost from "./indeed_post"

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
    id!: number
    idSample!: string
    createdAt!: string
    updatedAt!: string

    category!: string
    citations!: string
    conditions!: string
    min!: number | null
    max!: number | null
}
export interface RawDb extends _RawDb {}
export const Columns = Object.keys(new _RawDb()) as Readonly<Array<keyof RawDb>>

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
    const row = conn
        .prepare(`SELECT * FROM ${TABLE_ID} WHERE id = ?`)
        .get(id) as RawDb
    return {
        ...row,
        citations: JSON.parse(row.citations),
        conditions: JSON.parse(row.conditions),
    }
}

export type Summary = {
    idSample: string
    idLabel: number | null
    count: number
    createdAt: string | null
}
export function getAllSummarized(
    conn: sqlite.Database,
    sampleColumns: Array<keyof IndeedPost.RawDb>,
    labelColumns: Array<keyof RawDb>
): Summary[] {
    const SAMPLE_COLUMNS: Array<keyof IndeedPost.RawDb> = []

    const rows = conn
        .prepare(
            `
            SELECT 
                s.id as idSample,
                l.id as idLabel,
                COALESCE(l.num_rows, 0) AS count,
                l.createdAt
            FROM indeed_post s
            LEFT JOIN (
              SELECT id, idSample, COUNT(*) AS num_rows, MAX(createdAt) AS createdAt
              FROM ${TABLE_ID}
              GROUP BY idSample
            ) l ON s.id = l.idSample;
            `
        )
        .all() as Array<{
        idSample: string
        idLabel: number
        count: number
        createdAt: string
    }>
    return Object.fromEntries(rows.map((r) => [r.idSample, r]))
}

import * as sqlite from "better-sqlite3"

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

// User-submitted data
export interface PayloadCreate {
    idSample: string

    category: string
    citations: Array<[number, number]>
    conditions?: string[]
    min?: number
    max?: number
}

// What's in the DB
export interface RawDb {
    id: number
    idSample: string
    createdAt: string
    updatedAt: string

    category: string
    citations: string[]
    conditions: string[]
    min: number | null
    max: number | null
}

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
    console.log(
        `SELECT * FROM ${TABLE_ID} WHRE rowid = ?`,
        result.lastInsertRowid
    )
    const model = conn
        .prepare(`SELECT * FROM ${TABLE_ID} WHERE rowid = ?`)
        .get(result.lastInsertRowid) as Model
    return model
}

export function getAll(conn: sqlite.Database): Model[] {
    return conn.prepare(`SELECT * FROM ${TABLE_ID}`).all() as Model[]
}

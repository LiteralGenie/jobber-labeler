import Database from "better-sqlite3"
import * as sqlite from "better-sqlite3"
import paths from "@/config/paths"
import * as ExperienceLabel from "@/models/indeed_post_label_experience"

export function getDb(): sqlite.Database {
    const conn = new Database(paths.DB_FILE)
    initTables(conn)
    return conn
}

function initTables(conn: sqlite.Database) {
    ExperienceLabel.initTable(conn)
}

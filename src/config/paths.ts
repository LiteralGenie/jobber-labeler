import * as fs from "fs"
import path from "path"
import env from "./env"

// Check for path overrides and normalize them
let _env = env as Partial<Env>
;(["DB_FILE"] as Array<keyof Env>).forEach((k) => {
    const val = _env[k]
    if (!val) return
    _env[k] = normalize(val)
})

// Exported paths
const SRC_DIR = path.dirname(__dirname)
const DATA_DIR = SRC_DIR + "/data"
const DB_FILE = _env.DB_FILE || DATA_DIR + "/db.sqlite"
export default { SRC_DIR, DATA_DIR, DB_FILE }

// Create missing dirs
;[SRC_DIR, DATA_DIR]
    .filter((dir) => !fs.existsSync(dir))
    .forEach((dir) => fs.mkdirSync(dir))

// Helpers
function normalize(path: string) {
    let result = path

    if (path.startsWith("./")) {
        result = SRC_DIR + path.slice(1)
    }

    return result
}

interface Env {
    DB_FILE: string
}

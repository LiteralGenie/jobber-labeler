// This table should've been created by the collector repo
// export function initTable(conn: sqlite.Database) {}

export interface Raw {
    id: string

    company: string
    companyId?: string
    html: string
    textContent: string
    title: string
}

export type ModelProps = {
    id: string
    createdAt: string
    updatedAt: string

    company: string
    companyId: string | null
    html: string
    textContent: string
    title: string
}

export class Model implements ModelProps {
    id!: string
    createdAt!: string
    updatedAt!: string

    company!: string
    companyId!: string | null
    html!: string
    textContent!: string
    title!: string

    constructor(data: ModelProps) {
        Object.assign(this, data)
    }

    static fromRaw(raw: Raw): Model {
        const props: ModelProps = {
            ...raw,
            companyId: raw.companyId || null,
            createdAt: "",
            updatedAt: "",
        }
        return new Model(props)
    }
}

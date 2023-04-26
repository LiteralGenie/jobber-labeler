export const noop = () => {}

export type RequestParams<T> = {
    params: T
}

export type ApiData<T> = {
    data: T
}

export class ValidationError extends Error {
    constructor(...msgs: any[]) {
        const m = msgs.map((x) => String(x)).join(" ")
        super(m)
    }
}

export function checkWhitelist<T = any>(
    items: Readonly<any[]>,
    whitelist: Readonly<T[]>,
    msg: string
): T[] {
    const invalid = items.filter((x) => !whitelist.includes(x))
    if (invalid.length) throw new ValidationError(msg, invalid)

    return items as T[]
}

export function mergeDistinct<T = unknown>(left: T[], right: T[]): T[] {
    return [...new Set([...left, ...right])]
}

// export function validateQueryParams<T>(
//     params: any,
//     keys: Record<keyof T, any>,
//     optional = true
// ): Record<keyof T, any> {
//     Object.entries(keys).map(([k, v]) => {
//         const key = k as keyof typeof params
//         const type = v as any
//         const paramVal = params[key]
//         if (optional && (paramVal === null || paramVal === undefined)) {
//             return
//         } else if (!(params[key] instanceof type)) {
//             throw new ValidationError(`${String(key)} is not an instance of ${type}`)
//         }
//     })

//     return params
// }

export type ValueOf<T> = T[keyof T]

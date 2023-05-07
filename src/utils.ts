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

export function toTitleCase(x: any): string {
    const text = String(x)
    const words = text.split(" ").map((w) => {
        if (w.length) {
            return w[0].toLocaleUpperCase() + w.slice(1)
        } else {
            return ""
        }
    })

    const result = words.join(" ")
    return result
}

export type ValueOf<T> = T[keyof T]

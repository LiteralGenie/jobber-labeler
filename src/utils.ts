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
    items: Readonly<T[]>,
    whitelist: Readonly<T[]>,
    msg: string
): void {
    const invalid = items.filter((x) => !whitelist.includes(x))
    if (invalid) throw new ValidationError(msg, invalid)
}

export function mergeDistinct<T = unknown>(left: T[], right: T[]): T[] {
    return [...new Set([...left, ...right])]
}

export type ValueOf<T> = T[keyof T]

const pick = <T extends Record<string, unknown>, k extends keyof T>(obj: T, keys: k[]): Partial<T> => {
    const filterKeys: Partial<T> = {}
    for (const key of keys) {
        if (obj && Object.hasOwnProperty.call(obj, key)) {
            filterKeys[key] = obj[key]

        }
    }

    return filterKeys
}
export default pick
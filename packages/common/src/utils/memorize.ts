const map = new Map<string, any>();

export interface MemorizedProperty {
    fill?: string;
    strokeColor?: string;
}

export const memorizeLatest = <T extends MemorizedProperty = MemorizedProperty>(
    memorizedKey: string,
    propertyKey: keyof T,
    propertyValue: string | number
) => {
    let obj = map.has(memorizedKey) ? map.get(memorizedKey) : {};
    obj[propertyKey] = propertyValue;
    map.set(memorizedKey, obj);
};

export const getMemorizedLatest = <T extends MemorizedProperty = MemorizedProperty>(memorizedKey: string): T => {
    return map.get(memorizedKey);
};

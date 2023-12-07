const map = new Map<string, any>();

export interface MemorizedProperty {
    fill?: string;
    strokeColor?: string;
}

export enum MemorizeMode {
    creation,
    set
}

export const memorizeLatest = <T extends MemorizedProperty = MemorizedProperty>(
    mode: MemorizeMode,
    memorizedKey: string,
    propertyKey: keyof T,
    propertyValue: string | number
) => {
    const key = `${mode}-${memorizedKey}`;
    const newProperty = mode === MemorizeMode.set ? {} : [];
    let obj = map.has(key) ? map.get(key) : newProperty;
    obj[propertyKey] = propertyValue;
    map.set(key, obj);
};

export const getCurrentProperty = <T extends MemorizedProperty = MemorizedProperty>(mode: MemorizeMode, memorizedKey: string): T => {
    return map.get(`${mode}-${memorizedKey}`);
};

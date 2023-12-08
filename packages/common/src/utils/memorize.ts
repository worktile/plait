import { PlaitElement } from '@plait/core';

const map = new Map<string, any>();

export const memorizeLatest = <T extends PlaitElement = PlaitElement>(
    memorizedKey: string,
    propertyKey: keyof T,
    propertyValue: T[keyof T]
) => {
    let obj = map.has(memorizedKey) ? map.get(memorizedKey) : {};
    obj[propertyKey] = propertyValue;
    map.set(memorizedKey, obj);
};

export const getMemorizedLatest = <T extends PlaitElement = PlaitElement>(memorizedKey: string): T => {
    return map.get(memorizedKey);
};

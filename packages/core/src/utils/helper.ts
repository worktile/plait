import { PlaitElement } from '../interfaces';

export function isNullOrUndefined(value: any) {
    return value === null || value === undefined;
}

/**
 * Compare base data recursively.
 *
 * Supported recursive types:
 * - primitive values compared by `Object.is`
 * - arrays
 * - plain objects created by object literal or `Object.create(null)`
 *
 * Unsupported recursive types:
 * - Date, Map, Set, RegExp and class instances
 * - circular references
 */
export function isEqualData(value: unknown, otherValue: unknown): boolean {
    if (Object.is(value, otherValue)) {
        return true;
    }

    if (Array.isArray(value) && Array.isArray(otherValue)) {
        return value.length === otherValue.length && value.every((item, index) => isEqualData(item, otherValue[index]));
    }

    if (isPlainObject(value) && isPlainObject(otherValue)) {
        const keys = Object.keys(value);
        const otherKeys = Object.keys(otherValue);
        return (
            keys.length === otherKeys.length &&
            keys.every(
                (key) =>
                    Object.prototype.hasOwnProperty.call(otherValue, key) && isEqualData(value[key], otherValue[key])
            )
        );
    }

    return false;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    if (value === null || typeof value !== 'object') {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

/**
 * get {x,y} point
 * @param point
 * @returns point
 */
export function normalizePoint(point: number[]) {
    return Array.isArray(point)
        ? {
              x: point[0],
              y: point[1]
          }
        : point;
}

export const rgbaToHEX = (rgb: string, opacity: number) => {
    return rgb + Math.floor(opacity * 255).toString(16);
};

export function isContextmenu(event: MouseEvent) {
    return event.button === 2;
}

export function uniqueById(elements: PlaitElement[]) {
    const uniqueMap = new Map();

    elements.forEach((item) => {
        if (!uniqueMap.has(item.id)) {
            uniqueMap.set(item.id, item);
        }
    });

    return Array.from(uniqueMap.values());
}

export const findLastIndex = <T>(
    array: readonly T[],
    cb: (element: T, index: number, array: readonly T[]) => boolean,
    fromIndex: number = array.length - 1
) => {
    if (fromIndex < 0) {
        fromIndex = array.length + fromIndex;
    }
    fromIndex = Math.min(array.length - 1, Math.max(fromIndex, 0));
    let index = fromIndex + 1;
    while (--index > -1) {
        if (cb(array[index], index, array)) {
            return index;
        }
    }
    return -1;
};

export const findIndex = <T>(
    array: readonly T[],
    cb: (element: T, index: number, array: readonly T[]) => boolean,
    fromIndex: number = 0
) => {
    // fromIndex = 2
    if (fromIndex < 0) {
        fromIndex = array.length + fromIndex;
    }
    fromIndex = Math.min(array.length, Math.max(fromIndex, 0));
    let index = fromIndex - 1;
    while (++index < array.length) {
        if (cb(array[index], index, array)) {
            return index;
        }
    }
    return -1;
};

export const isIndicesContinuous = (indexes: number[]): boolean => {
    indexes.sort((a, b) => a - b);
    for (let i = 1; i < indexes.length; i++) {
        if (indexes[i] !== indexes[i - 1] + 1) {
            return false;
        }
    }
    return true;
};

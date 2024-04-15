import { PlaitElement } from '../interfaces';

export function isNullOrUndefined(value: any) {
    return value === null || value === undefined;
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

export const RgbaToHEX = (Rgb: string, opacity: number) => {
    return Rgb + Math.floor(opacity * 255).toString(16);
};

export function isContextmenu(event: MouseEvent) {
    return event.button === 2;
}

export function uniqueById(elements: PlaitElement[]) {
    const uniqueMap = new Map();

    elements.forEach(item => {
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

export const isIndexesContinuous = (indexes: number[]): boolean => {
    indexes.sort((a, b) => a - b);
    for (let i = 1; i < indexes.length; i++) {
        if (indexes[i] !== indexes[i - 1] + 1) {
            return false;
        }
    }
    return true;
};

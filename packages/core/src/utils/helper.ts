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

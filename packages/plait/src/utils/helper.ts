export function isNullOrUndefined(value: any) {
    return value === null || value === undefined;
}

/**
 * 规范 point
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

import { Point } from '@plait/core';

function sub(A: number[], B: number[]): number[] {
    return [A[0] - B[0], A[1] - B[1]];
}
function cpr(A: number[], B: number[]): number {
    return A[0] * B[1] - B[0] * A[1];
}
export function almostEqual(a: number, b: number, epsilon = 0.0001) {
    return Math.abs(a - b) < epsilon;
}
export function clamp(n: number, min: number, max?: number): number {
    return Math.max(min, typeof max !== 'undefined' ? Math.min(n, max) : n);
}

export function lrp(A: number[], B: number[], t: number): Point {
    return add(A, mul(sub(B, A), t));
}
export function mul(A: number[], n: number): Point {
    return [A[0] * n, A[1] * n];
}

export function add(A: number[], B: number[]): Point {
    return [A[0] + B[0], A[1] + B[1]];
}

export function lineIntersects(sp: number[], ep: number[], sp2: number[], ep2: number[], infinite = false): number[] | null {
    const v1 = sub(ep, sp);
    const v2 = sub(ep2, sp2);
    const cross = cpr(v1, v2);
    // Avoid divisions by 0, and errors when getting too close to 0
    if (almostEqual(cross, 0)) return null;
    const d = sub(sp, sp2);
    let u1 = cpr(v2, d) / cross;
    const u2 = cpr(v1, d) / cross,
        // Check the ranges of the u parameters if the line is not
        // allowed to extend beyond the definition points, but
        // compare with EPSILON tolerance over the [0, 1] bounds.
        epsilon = /*#=*/ 1e-12,
        uMin = -epsilon,
        uMax = 1 + epsilon;

    if (infinite || (uMin < u1 && u1 < uMax && uMin < u2 && u2 < uMax)) {
        // Address the tolerance at the bounds by clipping to
        // the actual range.
        if (!infinite) {
            u1 = clamp(u1, 0, 1);
        }
        return lrp(sp, ep, u1);
    }
    return null;
}

export function sign(number: number) {
    return number > 0 ? 1 : -1;
}

// 0 means x axis, 1 means y axis
export function _isOverlap(line1: number[][], line2: number[][], axis: 0 | 1, strict = true) {
    const less = strict ? (a: number, b: number) => a < b : (a: number, b: number) => a <= b;
    return !(
        less(Math.max(line1[0][axis], line1[1][axis]), Math.min(line2[0][axis], line2[1][axis])) ||
        less(Math.max(line2[0][axis], line2[1][axis]), Math.min(line1[0][axis], line1[1][axis]))
    );
}

export function pointAlmostEqual(a: number[], b: number[]): boolean {
    return almostEqual(a[0], b[0], 0.02) && almostEqual(a[1], b[1], 0.02);
}

export function heuristic(a: number[], b: number[]): number {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

export function compare(a: [number, number, number], b: [number, number, number]) {
    if (a[2] + 0.01 < b[2]) return -1;
    else if (a[2] - 0.01 > b[2]) return 1;
    else if (a[0] < b[0]) return -1;
    else if (a[0] > b[0]) return 1;
    else if (a[1] > b[1]) return -1;
    else if (a[1] < b[1]) return 1;
    else return 0;
}

export function findAllMinimalIndexes(
    data: number[],
    isLess: (a: number, b: number) => boolean,
    isEqual: (a: number, b: number) => boolean
) {
    let min = Infinity;
    let indexes: number[] = [];
    for (let i = 0; i < data.length; i++) {
        const cur = data[i];
        if (isLess(cur, min)) {
            min = cur;
            indexes = [i];
        } else if (isEqual(cur, min)) {
            indexes.push(i);
        }
    }
    return indexes;
}

export function findAllMaximalIndexes(
    data: number[],
    isGreat: (a: number, b: number) => boolean,
    isEqual: (a: number, b: number) => boolean
) {
    let max = -Infinity;
    let indexes: number[] = [];
    for (let i = 0; i < data.length; i++) {
        const cur = data[i];
        if (isGreat(cur, max)) {
            max = cur;
            indexes = [i];
        } else if (isEqual(cur, max)) {
            indexes.push(i);
        }
    }
    return indexes;
}

export function getDiagonalCount(a: number[], last: number[], last2: number[]): number {
    if (almostEqual(a[0], last[0]) && almostEqual(a[0], last2[0])) return 0;
    if (almostEqual(a[1], last[1]) && almostEqual(a[1], last2[1])) return 0;
    return 1;
}

export function cost(point: number[], point2: number[]) {
    return Math.abs(point[0] - point2[0]) + Math.abs(point[1] - point2[1]);
}

type Allowed = unknown | void | null | undefined | boolean | number | string | unknown[] | object;
export function assertEquals<T extends Allowed, U extends T>(
    val: T,
    expected: U,
    message = 'val is not same as expected'
): asserts val is U {
    if (!isEqual(val, expected)) {
        throw new Error(message);
    }
}

export function isPrimitive(a: unknown): a is null | undefined | boolean | number | string {
    return a !== Object(a);
}

export function isEqual<T extends Allowed, U extends T>(val: T, expected: U): boolean {
    const a = isPrimitive(val);
    const b = isPrimitive(expected);
    if (a && b) {
        if (!Object.is(val, expected)) {
            return false;
        }
    } else if (a !== b) {
        return false;
    } else {
        if (Array.isArray(val) && Array.isArray(expected)) {
            if (val.length !== expected.length) {
                return false;
            }
            return val.every((x, i) => isEqual(x, expected[i]));
        } else if (typeof val === 'object' && typeof expected === 'object') {
            const obj1 = Object.entries(val as Record<string, unknown>);
            const obj2 = Object.entries(expected as Record<string, unknown>);
            if (obj1.length !== obj2.length) {
                return false;
            }
            return obj1.every((x, i) => isEqual(x, obj2[i]));
        }
    }
    return true;
}

export const distanceToLineSegment = (A: number[], B: number[], P: number[], clamp = true): number => {
    return dist(P, nearestPointOnLineSegment(A, B, P, clamp));
};
const dist = (A: number[], B: number[]): number => {
    return Math.hypot(A[1] - B[1], A[0] - B[0]);
};

export const nearestPointOnLineSegment = (A: number[], B: number[], P: number[], clamp = true): number[] => {
    const u = uni(sub(B, A));
    const C = add(A, mul(u, pry(sub(P, A), u)));

    if (clamp) {
        if (C[0] < Math.min(A[0], B[0])) return A[0] < B[0] ? A : B;
        if (C[0] > Math.max(A[0], B[0])) return A[0] > B[0] ? A : B;
        if (C[1] < Math.min(A[1], B[1])) return A[1] < B[1] ? A : B;
        if (C[1] > Math.max(A[1], B[1])) return A[1] > B[1] ? A : B;
    }

    return C;
};

const pry = (A: number[], B: number[]): number => {
    return dpr(A, B) / len(B);
};

const dpr = (A: number[], B: number[]): number => {
    return A[0] * B[0] + A[1] * B[1];
};

const uni = (A: number[]): number[] => {
    return div(A, len(A));
};

const div = (A: number[], n: number): number[] => {
    return [A[0] / n, A[1] / n];
};

const len = (A: number[]): number => {
    return Math.hypot(A[0], A[1]);
};

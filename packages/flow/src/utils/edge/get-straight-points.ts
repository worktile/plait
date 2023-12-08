import { Point } from '@plait/core';

export function getStraightPoints({ sourcePoint, targetPoint }: { sourcePoint: Point; targetPoint: Point }) {
    return [sourcePoint, targetPoint];
}

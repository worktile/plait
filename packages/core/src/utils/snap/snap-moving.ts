import { PlaitBoard } from '../../interfaces/board';
import { createG } from '../dom/common';
import { PlaitElement } from '../../interfaces/element';
import { Point, RectangleClient } from '../../interfaces';
import {
    drawPointSnapLines,
    drawSolidLines,
    GapSnapRef,
    getMinPointDelta,
    getSnapRectangles,
    getTripleAxis,
    SNAP_TOLERANCE,
    SnapDelta,
    SnapRef
} from './snap';

export function getSnapMovingRef(board: PlaitBoard, activeRectangle: RectangleClient, activeElements: PlaitElement[]): SnapRef {
    const snapRectangles = getSnapRectangles(board, activeElements);
    const snapG = createG();
    let snapDelta = getPointLineDelta(activeRectangle, snapRectangles);
    const pointLinesG = drawMovingPointSnapLines(board, snapDelta, activeRectangle, snapRectangles);
    snapG.append(pointLinesG);
    const result = getGapSnapLinesAndDelta(board, snapDelta, activeRectangle, snapRectangles);
    snapDelta = result.snapDelta;
    snapG.append(result.snapG);
    return { ...snapDelta, snapG };
}

function getPointLineDeltas(activeRectangle: RectangleClient, snapRectangles: RectangleClient[], isHorizontal: boolean) {
    const axis = getTripleAxis(activeRectangle, isHorizontal);
    const deltaStart = getMinPointDelta(snapRectangles, axis[0], isHorizontal);
    const deltaMiddle = getMinPointDelta(snapRectangles, axis[1], isHorizontal);
    const deltaEnd = getMinPointDelta(snapRectangles, axis[2], isHorizontal);
    return [deltaStart, deltaMiddle, deltaEnd];
}

function getPointLineDelta(activeRectangle: RectangleClient, snapRectangles: RectangleClient[]) {
    let snapDelta: SnapDelta = {
        deltaX: 0,
        deltaY: 0
    };
    function getDelta(isHorizontal: boolean) {
        let delta = 0;
        const deltas = getPointLineDeltas(activeRectangle, snapRectangles, isHorizontal);
        for (let i = 0; i < deltas.length; i++) {
            if (Math.abs(deltas[i]) < SNAP_TOLERANCE) {
                delta = deltas[i];
                break;
            }
        }
        return delta;
    }
    snapDelta.deltaX = getDelta(true);
    snapDelta.deltaY = getDelta(false);
    return snapDelta;
}

function updateActiveRectangle(snapDelta: SnapDelta, activeRectangle: RectangleClient) {
    const { deltaX, deltaY } = snapDelta;
    const { x, y, width, height } = activeRectangle;
    return {
        x: x + deltaX,
        y: y + deltaY,
        width,
        height
    };
}

function drawMovingPointSnapLines(
    board: PlaitBoard,
    snapDelta: SnapDelta,
    activeRectangle: RectangleClient,
    snapRectangles: RectangleClient[]
) {
    const newActiveRectangle = updateActiveRectangle(snapDelta, activeRectangle);
    return drawPointSnapLines(board, newActiveRectangle, snapRectangles, true, true, true);
}

function getGapSnapLinesAndDelta(
    board: PlaitBoard,
    snapDelta: SnapDelta,
    activeRectangle: RectangleClient,
    snapRectangles: RectangleClient[]
) {
    let deltaX = snapDelta.deltaX;
    let deltaY = snapDelta.deltaY;
    const gapHorizontalResult = getGapLinesAndDelta(activeRectangle, snapRectangles, true);
    const gapVerticalResult = getGapLinesAndDelta(activeRectangle, snapRectangles, false);
    const gapSnapLines: Point[][] = [...gapHorizontalResult.lines, ...gapVerticalResult.lines];
    if (gapHorizontalResult.delta) {
        deltaX = gapHorizontalResult.delta;
    }
    if (gapVerticalResult.delta) {
        deltaY = gapVerticalResult.delta;
    }
    return {
        snapDelta: { deltaX, deltaY },
        snapG: drawSolidLines(board, gapSnapLines)
    };
}

function getGapLinesAndDelta(activeRectangle: RectangleClient, snapRectangles: RectangleClient[], isHorizontal: boolean) {
    let lines: any[] = [];
    let delta = 0;
    let rectangles: RectangleClient[] = [];
    const axis = isHorizontal ? 'x' : 'y';
    const side = isHorizontal ? 'width' : 'height';

    const activeRectangleCenter = activeRectangle[axis] + activeRectangle[side] / 2;
    snapRectangles.forEach(rec => {
        const isCross = isHorizontal ? isHorizontalCross(rec, activeRectangle) : isVerticalCross(rec, activeRectangle);
        if (isCross && !RectangleClient.isHit(rec, activeRectangle)) {
            rectangles.push(rec);
        }
    });
    rectangles = [...rectangles, activeRectangle].sort((a, b) => a[axis] - b[axis]);

    const refArray: GapSnapRef[] = [];
    let gapDistance = 0;
    let beforeIndex = undefined;
    let afterIndex = undefined;

    for (let i = 0; i < rectangles.length; i++) {
        for (let j = i + 1; j < rectangles.length; j++) {
            const before = rectangles[i];
            const after = rectangles[j];
            const distance = after[axis] - (before[axis] + before[side]);
            let dif = Infinity;
            if (refArray[i]?.after) {
                refArray[i].after.push({ distance, index: j });
            } else {
                refArray[i] = { ...refArray[i], after: [{ distance, index: j }] };
            }

            if (refArray[j]?.before) {
                refArray[j].before.push({ distance, index: i });
            } else {
                refArray[j] = { ...refArray[j], before: [{ distance, index: i }] };
            }

            //middle
            let _center = (before[axis] + before[side] + after[axis]) / 2;
            dif = Math.abs(_center - activeRectangleCenter);
            if (dif < SNAP_TOLERANCE) {
                gapDistance = (after[axis] - (before[axis] + before[side]) - activeRectangle[side]) / 2;
                delta = _center - activeRectangleCenter;
                beforeIndex = i;
                afterIndex = j;
            }

            //after
            const distanceRight = after[axis] - (before[axis] + before[side]);
            _center = after[axis] + after[side] + distanceRight + activeRectangle[side] / 2;
            dif = Math.abs(_center - activeRectangleCenter);
            if ((!gapDistance || gapDistance !== distanceRight) && dif < SNAP_TOLERANCE) {
                gapDistance = distanceRight;
                beforeIndex = j;
                delta = _center - activeRectangleCenter;
            }

            //before
            const distanceBefore = after[axis] - (before[axis] + before[side]);
            _center = before[axis] - distanceBefore - activeRectangle[side] / 2;
            dif = Math.abs(_center - activeRectangleCenter);

            if (!gapDistance && dif < SNAP_TOLERANCE) {
                gapDistance = distanceBefore;
                afterIndex = i;
                delta = _center - activeRectangleCenter;
            }
        }
    }

    const activeIndex = rectangles.indexOf(activeRectangle);
    let beforeIndexes: number[] = [];
    let afterIndexes: number[] = [];
    if (beforeIndex !== undefined) {
        beforeIndexes.push(beforeIndex);
        findRectangle(gapDistance, refArray[beforeIndex], 'before', beforeIndexes);
    }

    if (afterIndex !== undefined) {
        afterIndexes.push(afterIndex);
        findRectangle(gapDistance, refArray[afterIndex], 'after', afterIndexes);
    }

    if (beforeIndexes.length || afterIndexes.length) {
        const indexArr = [...beforeIndexes.reverse(), activeIndex, ...afterIndexes];
        activeRectangle[axis] += delta;
        for (let i = 1; i < indexArr.length; i++) {
            lines.push(getLinePoints(rectangles[indexArr[i - 1]], rectangles[indexArr[i]]));
        }
    }

    function findRectangle(distance: number, ref: GapSnapRef, direction: string, rectangleIndexes: number[]) {
        const arr = ref[direction as keyof GapSnapRef];
        const index = refArray.indexOf(ref);
        if ((index === 0 && direction === 'before') || (index === refArray.length - 1 && direction === 'after')) return;
        for (let i = 0; i < arr.length; i++) {
            if (Math.abs(arr[i].distance - distance) < 0.1) {
                rectangleIndexes.push(arr[i].index);
                findRectangle(distance, refArray[arr[i].index], direction, rectangleIndexes);
                return;
            }
        }
    }

    function getLinePoints(beforeRectangle: RectangleClient, afterRectangle: RectangleClient) {
        const oppositeAxis = axis === 'x' ? 'y' : 'x';
        const oppositeSide = side === 'width' ? 'height' : 'width';
        const snap = [
            beforeRectangle[oppositeAxis],
            beforeRectangle[oppositeAxis] + beforeRectangle[oppositeSide],
            afterRectangle[oppositeAxis],
            afterRectangle[oppositeAxis] + afterRectangle[oppositeSide]
        ];
        const sortArr = snap.sort((a, b) => a - b);
        const average = (sortArr[1] + sortArr[2]) / 2;
        const offset = 3;
        return isHorizontal
            ? [
                  [beforeRectangle.x + beforeRectangle.width + offset, average],
                  [afterRectangle.x - offset, average]
              ]
            : [
                  [average, beforeRectangle.y + beforeRectangle.height + offset],
                  [average, afterRectangle.y - offset]
              ];
    }
    return { delta, lines };
}

function isHorizontalCross(rectangle: RectangleClient, other: RectangleClient) {
    return !(rectangle.y + rectangle.height < other.y || rectangle.y > other.y + other.height);
}

function isVerticalCross(rectangle: RectangleClient, other: RectangleClient) {
    return !(rectangle.x + rectangle.width < other.x || rectangle.x > other.x + other.width);
}

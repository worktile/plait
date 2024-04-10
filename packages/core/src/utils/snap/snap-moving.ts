import { PlaitBoard } from '../../interfaces/board';
import { createG } from '../dom/common';
import { PlaitElement } from '../../interfaces/element';
import { Point, RectangleClient } from '../../interfaces';
import { drawDashedLines, drawSolidLines, GapSnapRef, getSnapRectangles, SNAP_TOLERANCE, SnapRef } from './snap';

export function getSnapMovingRef(board: PlaitBoard, activeRectangle: RectangleClient, activeElements: PlaitElement[]): SnapRef {
    const snapRectangles = getSnapRectangles(board, activeElements);
    const snapG = createG();
    let pointSnapLines: ([Point, Point] | [])[] = [];

    const offset = 12;
    let deltaX = 0;
    let deltaY = 0;
    let isCorrectX = false;
    let isCorrectY = false;

    for (let snapRectangle of snapRectangles) {
        const closestDistances = calculateNearestDistances(activeRectangle, snapRectangle);
        let canDrawHorizontal = false;
        if (!isCorrectX && closestDistances.absXDistance < SNAP_TOLERANCE) {
            deltaX = closestDistances.xDistance;
            activeRectangle.x -= deltaX;
            isCorrectX = true;
            canDrawHorizontal = true;
        }

        if (closestDistances.absXDistance === 0) {
            canDrawHorizontal = true;
        }

        if (canDrawHorizontal) {
            const verticalY = [
                snapRectangle.y,
                snapRectangle.y + snapRectangle.height,
                activeRectangle.y,
                activeRectangle.y + activeRectangle.height
            ];
            const lineTopY = Math.min(...verticalY) - offset;
            const lineBottomY = Math.max(...verticalY) + offset;
            const leftLine: [Point, Point] = [
                [activeRectangle.x, lineTopY],
                [activeRectangle.x, lineBottomY]
            ];
            const middleLine: [Point, Point] = [
                [activeRectangle.x + activeRectangle.width / 2, lineTopY],
                [activeRectangle.x + activeRectangle.width / 2, lineBottomY]
            ];
            const rightLine: [Point, Point] = [
                [activeRectangle.x + activeRectangle.width, lineTopY],
                [activeRectangle.x + activeRectangle.width, lineBottomY]
            ];

            const shouldDrawLeftLine =
                closestDistances.indexX === 0 ||
                closestDistances.indexX === 1 ||
                (closestDistances.indexX === 2 && activeRectangle.width === snapRectangle.width);
            if (shouldDrawLeftLine && !pointSnapLines[0]) {
                pointSnapLines[0] = leftLine;
            }

            const shouldDrawRightLine =
                closestDistances.indexX === 2 ||
                closestDistances.indexX === 3 ||
                (closestDistances.indexX === 0 && activeRectangle.width === snapRectangle.width);
            if (shouldDrawRightLine && !pointSnapLines[2]) {
                pointSnapLines[2] = rightLine;
            }

            const shouldDrawMiddleLine = closestDistances.indexX === 4 || (!shouldDrawLeftLine && !shouldDrawRightLine);
            if (shouldDrawMiddleLine && !pointSnapLines[1]) {
                pointSnapLines[1] = middleLine;
            }

            isCorrectX = true;
        }

        let canDrawVertical = false;
        if (!isCorrectY && closestDistances.absYDistance < SNAP_TOLERANCE) {
            deltaY = closestDistances.yDistance;
            activeRectangle.y -= deltaY;
            isCorrectY = true;
            canDrawVertical = true;
        }
        if (closestDistances.absYDistance === 0) {
            canDrawVertical = true;
        }
        if (canDrawVertical) {
            const horizontalX = [
                snapRectangle.x,
                snapRectangle.x + snapRectangle.width,
                activeRectangle.x,
                activeRectangle.x + activeRectangle.width
            ];
            const lineLeftX = Math.min(...horizontalX) - offset;
            const lineRightX = Math.max(...horizontalX) + offset;
            const topLine: [Point, Point] = [
                [lineLeftX, activeRectangle.y],
                [lineRightX, activeRectangle.y]
            ];
            const horizontalMiddleLine: [Point, Point] = [
                [lineLeftX, activeRectangle.y + activeRectangle.height / 2],
                [lineRightX, activeRectangle.y + activeRectangle.height / 2]
            ];
            const bottomLine: [Point, Point] = [
                [lineLeftX, activeRectangle.y + activeRectangle.height],
                [lineRightX, activeRectangle.y + activeRectangle.height]
            ];

            const shouldDrawTopLine =
                closestDistances.indexY === 0 ||
                closestDistances.indexY === 1 ||
                (closestDistances.indexY === 2 && activeRectangle.height === snapRectangle.height);
            if (shouldDrawTopLine && !pointSnapLines[3]) {
                pointSnapLines[3] = topLine;
            }

            const shouldDrawBottomLine =
                closestDistances.indexY === 2 ||
                closestDistances.indexY === 3 ||
                (closestDistances.indexY === 0 && activeRectangle.width === snapRectangle.width);
            if (shouldDrawBottomLine && !pointSnapLines[5]) {
                pointSnapLines[5] = bottomLine;
            }

            const shouldDrawMiddleLine = closestDistances.indexY === 4 || (!shouldDrawTopLine && !shouldDrawBottomLine);
            if (shouldDrawMiddleLine && !pointSnapLines[4]) {
                pointSnapLines[4] = horizontalMiddleLine;
            }
        }
    }

    const snapDeltaX = deltaX;
    const snapDeltaY = deltaY;

    activeRectangle.x += deltaX;
    activeRectangle.y += deltaY;
    const gapHorizontalResult = getGapSnapLinesAndDelta(activeRectangle, snapRectangles, true);
    const gapVerticalResult = getGapSnapLinesAndDelta(activeRectangle, snapRectangles, false);
    const gapSnapLines: Point[][] = [...gapHorizontalResult.lines, ...gapVerticalResult.lines];
    if (gapHorizontalResult.delta) {
        deltaX = gapHorizontalResult.delta;
        if (snapDeltaX !== deltaX) {
            pointSnapLines[0] = [];
            pointSnapLines[1] = [];
            pointSnapLines[2] = [];
        }
    }

    if (gapVerticalResult.delta) {
        deltaY = gapVerticalResult.delta;
        if (snapDeltaY !== deltaY) {
            pointSnapLines[3] = [];
            pointSnapLines[4] = [];
            pointSnapLines[5] = [];
        }
    }

    if (pointSnapLines.length) {
        snapG.append(drawDashedLines(board, pointSnapLines as [Point, Point][]));
    }

    if (gapSnapLines.length) {
        snapG.append(drawSolidLines(board, gapSnapLines));
    }

    return { deltaX, deltaY, snapG };
}

function calculateNearestDistances(activeRectangle: RectangleClient, snapRectangle: RectangleClient) {
    const activeRectangleCenter = [activeRectangle.x + activeRectangle.width / 2, activeRectangle.y + activeRectangle.height / 2];
    const snapRectangleCenter = [snapRectangle.x + snapRectangle.width / 2, snapRectangle.y + snapRectangle.height / 2];

    const centerXDistance = activeRectangleCenter[0] - snapRectangleCenter[0];
    const centerYDistance = activeRectangleCenter[1] - snapRectangleCenter[1];

    const leftToLeft = activeRectangle.x - snapRectangle.x;
    const leftToRight = activeRectangle.x - (snapRectangle.x + snapRectangle.width);
    const rightToRight = activeRectangle.x + activeRectangle.width - (snapRectangle.x + snapRectangle.width);
    const rightToLeft = activeRectangle.x + activeRectangle.width - snapRectangle.x;

    const topToTop = activeRectangle.y - snapRectangle.y;
    const topToBottom = activeRectangle.y - (snapRectangle.y + snapRectangle.height);
    const bottomToTop = activeRectangle.y + activeRectangle.height - snapRectangle.y;
    const bottomToBottom = activeRectangle.y + activeRectangle.height - (snapRectangle.y + snapRectangle.height);

    const xDistances = [leftToLeft, leftToRight, rightToRight, rightToLeft, centerXDistance];
    const yDistances = [topToTop, topToBottom, bottomToBottom, bottomToTop, centerYDistance];

    const xDistancesAbs = xDistances.map(distance => Math.abs(distance));
    const yDistancesAbs = yDistances.map(distance => Math.abs(distance));

    const indexX = xDistancesAbs.indexOf(Math.min(...xDistancesAbs));
    const indexY = yDistancesAbs.indexOf(Math.min(...yDistancesAbs));

    return {
        absXDistance: xDistancesAbs[indexX],
        xDistance: xDistances[indexX],
        absYDistance: yDistancesAbs[indexY],
        yDistance: yDistances[indexY],
        indexX,
        indexY
    };
}

function getGapSnapLinesAndDelta(activeRectangle: RectangleClient, snapRectangles: RectangleClient[], isHorizontal: boolean) {
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
            dif = Math.abs(activeRectangleCenter - _center);
            if (dif < SNAP_TOLERANCE) {
                gapDistance = (after[axis] - (before[axis] + before[side]) - activeRectangle[side]) / 2;
                delta = activeRectangleCenter - _center;
                beforeIndex = i;
                afterIndex = j;
            }

            //after
            const distanceRight = after[axis] - (before[axis] + before[side]);
            _center = after[axis] + after[side] + distanceRight + activeRectangle[side] / 2;
            dif = Math.abs(activeRectangleCenter - _center);
            if (!gapDistance && dif < SNAP_TOLERANCE) {
                gapDistance = distanceRight;
                beforeIndex = j;
                delta = activeRectangleCenter - _center;
            }

            //before
            const distanceBefore = after[axis] - (before[axis] + before[side]);
            _center = before[axis] - distanceBefore - activeRectangle[side] / 2;
            dif = Math.abs(activeRectangleCenter - _center);

            if (!gapDistance && dif < SNAP_TOLERANCE) {
                gapDistance = distanceBefore;
                afterIndex = i;
                delta = activeRectangleCenter - _center;
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
        activeRectangle[axis] -= delta;
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

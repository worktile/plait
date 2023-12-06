import { XYPosition } from '@plait/core';
import { FlowEdgeShape } from '../../interfaces/edge';

export function getLabelPoints(
    shape: FlowEdgeShape = FlowEdgeShape.elbow,
    pathPoints: XYPosition[],
    segmentNumber: number = 2
): XYPosition[] {
    switch (shape) {
        case FlowEdgeShape.straight: {
            return getStraightLabelPoints(pathPoints, segmentNumber);
        }
        case FlowEdgeShape.curve: {
            return getCurveLabelPoints(pathPoints, segmentNumber);
        }
        default: {
            return getElbowLabelPoints(pathPoints, segmentNumber);
        }
    }
}

export const getStraightLabelPoints = (pathPoints: XYPosition[], segmentNumber: number = 2): XYPosition[] => {
    const points = [];
    for (let i = 1; i < segmentNumber; i++) {
        const t = i / segmentNumber;
        const x = linearInterpolation(pathPoints[0].x, pathPoints[1].x, t);
        const y = linearInterpolation(pathPoints[0].y, pathPoints[1].y, t);
        points.push({ x, y });
    }
    return points;
};

export const getCurveLabelPoints = (pathPoints: XYPosition[], segmentNumber: number = 2): XYPosition[] => {
    var bezierPoints = [];
    for (var i = 1; i < segmentNumber; i++) {
        let t = i / segmentNumber;
        var point = curvePoint(t, pathPoints);
        bezierPoints.push(point);
    }
    return bezierPoints;
};

export const getElbowLabelPoints = (pathPoints: XYPosition[], segmentNumber: number = 2): XYPosition[] => {
    const points = [...pathPoints];
    const segmentDistances = [];
    let totalLength = 0;
    for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i - 1].x;
        const dy = points[i].y - points[i - 1].y;
        const length = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        totalLength += length;
        segmentDistances.push(length);
    }
    const segmentLength = totalLength / segmentNumber;
    const segmentPoints: XYPosition[] = [];
    let _currentPoint = points[0];
    let _currentSegmentNumber = 2;
    let _remainingLength = segmentLength;
    let _usedLength = 0;
    let i = 0;

    while (i < points.length - 1) {
        const segmentDistance = segmentDistances[i];
        // 两点间距离包含剩余长度
        if (segmentDistance - _usedLength >= _remainingLength) {
            const directionX = points[i + 1].x === _currentPoint.x ? 0 : points[i + 1].x > _currentPoint.x ? 1 : -1;
            const directionY = points[i + 1].y === _currentPoint.y ? 0 : points[i + 1].y > _currentPoint.y ? 1 : -1;
            const x = _currentPoint.x + _remainingLength * directionX;
            const y = _currentPoint.y + _remainingLength * directionY;
            const segment = { x: x, y: y };
            segmentPoints.push(segment);
            _currentSegmentNumber++;
            if (_currentSegmentNumber > segmentNumber) {
                break;
            }
            _usedLength += Math.sqrt(Math.pow(x - _currentPoint.x, 2) + Math.pow(y - _currentPoint.y, 2));
            _currentPoint = segment;
            _remainingLength = segmentLength;
        } else {
            _currentPoint = points[i + 1];
            _remainingLength = _remainingLength - (segmentDistance - _usedLength);
            _usedLength = 0;
            i++;
        }
    }
    return segmentPoints;
};

// 线性插值
function linearInterpolation(start: number, end: number, t: number) {
    return start + t * (end - start);
}

function curvePoint(t: number, points: XYPosition[]): XYPosition {
    if (points.length === 1) {
        return points[0];
    }
    var newPoints: XYPosition[] = [];
    for (var i = 0; i < points.length - 1; i++) {
        var x = linearInterpolation(points[i].x, points[i + 1].x, t);
        var y = linearInterpolation(points[i].y, points[i + 1].y, t);
        newPoints.push({ x, y });
    }
    return curvePoint(t, newPoints);
}

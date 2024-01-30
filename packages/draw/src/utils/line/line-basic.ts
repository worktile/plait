import {
    Point,
    idCreator,
    distanceBetweenPointAndSegments,
    PlaitBoard,
    createG,
    RectangleClient,
    findElements,
    PlaitElement,
    drawLinearPath,
    createMask,
    createRect,
    distanceBetweenPointAndPoint,
    catmullRomFitting
} from '@plait/core';
import { pointsOnBezierCurves } from 'points-on-curve';
import { getPointOnPolyline, getPointByVector, removeDuplicatePoints, getExtendPoint } from '@plait/common';
import { LineHandle, LineMarkerType, LineShape, LineText, PlaitDrawElement, PlaitLine, PlaitShape } from '../../interfaces';
import { getNearestPoint } from '../geometry';
import { getLineDashByElement, getStrokeColorByElement, getStrokeWidthByElement } from '../style/stroke';
import { getEngine } from '../../engines';
import { getShape } from '../shape';
import { DefaultLineStyle, LINE_TEXT_SPACE } from '../../constants/line';
import { LineShapeGenerator } from '../../generators/line.generator';
import { REACTION_MARGIN } from '../../constants';
import { getHitOutlineGeometry } from '../position/geometry';
import { getLineMemorizedLatest } from '../memorize';
import { alignPoints } from './line-resize';
import { getLineHandleRefPair } from './line-common';
import { getElbowPoints } from './elbow';
import { drawLineArrow } from './line-arrow';

export const createLineElement = (
    shape: LineShape,
    points: [Point, Point],
    source: LineHandle,
    target: LineHandle,
    texts?: LineText[],
    options?: Pick<PlaitLine, 'strokeColor' | 'strokeWidth'>
): PlaitLine => {
    return {
        id: idCreator(),
        type: 'line',
        shape,
        source,
        texts: texts ? texts : [],
        target,
        opacity: 1,
        points,
        ...options
    };
};

export const getLinePoints = (board: PlaitBoard, element: PlaitLine) => {
    switch (element.shape) {
        case LineShape.elbow: {
            return getElbowPoints(board, element);
        }
        case LineShape.curve: {
            return getCurvePoints(board, element);
        }
        default: {
            const points = PlaitLine.getPoints(board, element);
            const handleRefPair = getLineHandleRefPair(board, element);
            points[0] = handleRefPair.source.point;
            points[points.length - 1] = handleRefPair.target.point;
            return points;
        }
    }
};

export const getCurvePoints = (board: PlaitBoard, element: PlaitLine) => {
    if (element.points.length === 2) {
        const handleRefPair = getLineHandleRefPair(board, element);
        const { source, target } = handleRefPair;
        const sourceBoundElement = handleRefPair.source.boundElement;
        const targetBoundElement = handleRefPair.target.boundElement;
        let curvePoints: Point[] = [source.point];
        const sumDistance = distanceBetweenPointAndPoint(...source.point, ...target.point);
        const offset = 12 + sumDistance / 3;
        if (sourceBoundElement) {
            curvePoints.push(getPointByVector(source.point, source.vector, offset));
        }
        if (targetBoundElement) {
            curvePoints.push(getPointByVector(target.point, target.vector, offset));
        }
        const isSingleBound = (sourceBoundElement && !targetBoundElement) || (!sourceBoundElement && targetBoundElement);
        if (isSingleBound) {
            curvePoints.push(target.point);
            const points = Q2C(curvePoints);
            return pointsOnBezierCurves(points) as Point[];
        }
        if (!sourceBoundElement && !targetBoundElement) {
            curvePoints.push(getPointByVector(source.point, source.vector, offset));
            curvePoints.push(getPointByVector(target.point, target.vector, offset));
        }
        curvePoints.push(target.point);
        return pointsOnBezierCurves(curvePoints) as Point[];
    } else {
        let dataPoints = PlaitLine.getPoints(board, element);
        dataPoints = removeDuplicatePoints(dataPoints);
        const points = catmullRomFitting(dataPoints);
        return pointsOnBezierCurves(points) as Point[];
    }
};

export const isHitPolyLine = (pathPoints: Point[], point: Point, strokeWidth: number, expand: number = 0) => {
    const distance = distanceBetweenPointAndSegments(pathPoints, point);
    return distance <= strokeWidth + expand;
};

export const getHitLineTextIndex = (board: PlaitBoard, element: PlaitLine, point: Point) => {
    const texts = element.texts;
    if (!texts.length) return -1;

    const points = getLinePoints(board, element);
    return texts.findIndex(text => {
        const center = getPointOnPolyline(points, text.position);
        const rectangle = {
            x: center[0] - text.width! / 2,
            y: center[1] - text.height! / 2,
            width: text.width!,
            height: text.height!
        };
        return RectangleClient.isHit(rectangle, RectangleClient.getRectangleByPoints([point, point]));
    });
};

export const isHitLineText = (board: PlaitBoard, element: PlaitLine, point: Point) => {
    return getHitLineTextIndex(board, element, point) !== -1;
};

export const drawLine = (board: PlaitBoard, element: PlaitLine) => {
    const strokeWidth = getStrokeWidthByElement(element);
    const strokeColor = getStrokeColorByElement(board, element);
    const strokeLineDash = getLineDashByElement(element);
    const options = { stroke: strokeColor, strokeWidth, strokeLineDash };
    const lineG = createG();
    let points = getLinePoints(board, element);
    let line;
    if (element.shape === LineShape.curve) {
        line = PlaitBoard.getRoughSVG(board).curve(points, options);
    } else {
        line = drawLinearPath(points, options);
    }
    const id = idCreator();
    line.setAttribute('mask', `url(#${id})`);
    lineG.appendChild(line);
    const { mask, maskTargetFillRect } = drawMask(board, element, id);
    lineG.appendChild(mask);
    line.appendChild(maskTargetFillRect);
    const arrow = drawLineArrow(element, points, { stroke: strokeColor, strokeWidth });
    arrow && lineG.appendChild(arrow);
    return lineG;
};

export const getConnectionByNearestPoint = (board: PlaitBoard, point: Point, hitElement: PlaitShape): Point => {
    let rectangle = RectangleClient.getRectangleByPoints(hitElement.points);
    let nearestPoint = getNearestPoint(hitElement, point);
    const hitConnector = getHitConnectorPoint(nearestPoint, hitElement, rectangle);
    nearestPoint = hitConnector ? hitConnector : nearestPoint;
    return [(nearestPoint[0] - rectangle.x) / rectangle.width, (nearestPoint[1] - rectangle.y) / rectangle.height];
};

export const getHitConnectorPoint = (point: Point, hitElement: PlaitShape, rectangle: RectangleClient) => {
    const shape = getShape(hitElement);
    const connector = getEngine(shape).getConnectorPoints(rectangle);
    const points = RectangleClient.getPoints(RectangleClient.getRectangleByCenterPoint(point, 10, 10));
    const pointRectangle = RectangleClient.getRectangleByPoints(points);
    return connector.find(point => {
        return RectangleClient.isHit(pointRectangle, RectangleClient.getRectangleByPoints([point, point]));
    });
};

export const getLineTextRectangle = (board: PlaitBoard, element: PlaitLine, index: number): RectangleClient => {
    const text = element.texts[index];
    const elbowPoints = getLinePoints(board, element);
    const point = getPointOnPolyline(elbowPoints, text.position);
    return {
        x: point[0] - text.width! / 2,
        y: point[1] - text.height! / 2,
        width: text.width!,
        height: text.height!
    };
};

export const getBoardLines = (board: PlaitBoard) => {
    return findElements(board, {
        match: (element: PlaitElement) => PlaitDrawElement.isLine(element),
        recursion: (element: PlaitElement) => PlaitDrawElement.isDrawElement(element)
    }) as PlaitLine[];
};

// quadratic Bezier to cubic Bezier
export const Q2C = (points: Point[]) => {
    const result = [];
    const numSegments = points.length / 3;
    for (let i = 0; i < numSegments; i++) {
        const start = points[i];
        const qControl = points[i + 1];
        const end = points[i + 2];
        const startDistance = distanceBetweenPointAndPoint(...start, ...qControl);
        const endDistance = distanceBetweenPointAndPoint(...end, ...qControl);
        const cControl1 = getExtendPoint(start, qControl, (startDistance * 2) / 3);
        const cControl2 = getExtendPoint(end, qControl, (endDistance * 2) / 3);
        result.push(start, cControl1, cControl2, end);
    }
    return result;
};

export const handleLineCreating = (
    board: PlaitBoard,
    lineShape: LineShape,
    sourcePoint: Point,
    movingPoint: Point,
    sourceElement: PlaitShape | null,
    lineShapeG: SVGGElement
) => {
    const hitElement = getHitOutlineGeometry(board, movingPoint, REACTION_MARGIN);
    const targetConnection = hitElement ? getConnectionByNearestPoint(board, movingPoint, hitElement) : undefined;
    const connection = sourceElement ? getConnectionByNearestPoint(board, sourcePoint, sourceElement) : undefined;
    const targetBoundId = hitElement ? hitElement.id : undefined;
    const lineGenerator = new LineShapeGenerator(board);
    const memorizedLatest = getLineMemorizedLatest();
    let sourceMarker, targetMarker;
    sourceMarker = memorizedLatest.source;
    targetMarker = memorizedLatest.target;
    sourceMarker && delete memorizedLatest.source;
    targetMarker && delete memorizedLatest.target;
    const temporaryLineElement = createLineElement(
        lineShape,
        [sourcePoint, movingPoint],
        { marker: sourceMarker || LineMarkerType.none, connection: connection, boundId: sourceElement?.id },
        { marker: targetMarker || LineMarkerType.arrow, connection: targetConnection, boundId: targetBoundId },
        [],
        {
            strokeWidth: DefaultLineStyle.strokeWidth,
            ...memorizedLatest
        }
    );
    const linePoints = getLinePoints(board, temporaryLineElement);
    const otherPoint = linePoints[0];
    temporaryLineElement.points[1] = alignPoints(otherPoint, movingPoint);
    lineGenerator.processDrawing(temporaryLineElement, lineShapeG);
    PlaitBoard.getElementActiveHost(board).append(lineShapeG);
    return temporaryLineElement;
};

function drawMask(board: PlaitBoard, element: PlaitLine, id: string) {
    const mask = createMask();
    mask.setAttribute('id', id);
    const points = getLinePoints(board, element);
    let rectangle = RectangleClient.getRectangleByPoints(points);
    rectangle = RectangleClient.getOutlineRectangle(rectangle, -30);
    const maskFillRect = createRect(rectangle, {
        fill: 'white'
    });
    mask.appendChild(maskFillRect);

    const texts = element.texts;
    texts.forEach((text, index) => {
        let textRectangle = getLineTextRectangle(board, element, index);
        textRectangle = RectangleClient.inflate(textRectangle, LINE_TEXT_SPACE * 2);
        const rect = createRect(textRectangle, {
            fill: 'black'
        });
        mask.appendChild(rect);
    });
    // open line
    const maskTargetFillRect = createRect(rectangle);
    maskTargetFillRect.setAttribute('opacity', '0');
    maskTargetFillRect.setAttribute('fill', 'none');
    return { mask, maskTargetFillRect };
}

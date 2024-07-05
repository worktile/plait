import {
    Point,
    idCreator,
    PlaitBoard,
    createG,
    RectangleClient,
    findElements,
    PlaitElement,
    drawLinearPath,
    createMask,
    createRect,
    distanceBetweenPointAndPoint,
    catmullRomFitting,
    setStrokeLinecap
} from '@plait/core';
import { pointsOnBezierCurves } from 'points-on-curve';
import { getPointOnPolyline, getPointByVectorComponent, removeDuplicatePoints, getExtendPoint } from '@plait/common';
import {
    ArrowLineHandle,
    ArrowLineMarkerType,
    ArrowLineShape,
    ArrowLineText,
    PlaitArrowLine,
    PlaitDrawElement,
    PlaitShapeElement,
    StrokeStyle
} from '../../interfaces';
import { getLineDashByElement, getStrokeColorByElement } from '../style/stroke';
import { getEngine } from '../../engines';
import { getElementShape } from '../shape';
import { DefaultLineStyle, LINE_TEXT_SPACE } from '../../constants/line';
import { LINE_SNAPPING_CONNECTOR_BUFFER } from '../../constants';
import { getLineMemorizedLatest } from '../memorize';
import { alignPoints } from './arrow-line-resize';
import { getArrowLineHandleRefPair } from './arrow-line-common';
import { getElbowPoints } from './elbow';
import { drawArrowLineArrow } from './arrow-line-arrow';
import { getSnappingRef, getSnappingShape, getStrokeWidthByElement } from '../common';
import { ArrowLineGenerator } from '../../generators/arrow-line.generator';

export const createArrowLineElement = (
    shape: ArrowLineShape,
    points: [Point, Point],
    source: ArrowLineHandle,
    target: ArrowLineHandle,
    texts?: ArrowLineText[],
    options?: Pick<PlaitArrowLine, 'strokeColor' | 'strokeWidth'>
): PlaitArrowLine => {
    return {
        id: idCreator(),
        type: 'arrow-line',
        shape,
        source,
        texts: texts ? texts : [],
        target,
        opacity: 1,
        points,
        ...options
    };
};

export const getArrowLinePoints = (board: PlaitBoard, element: PlaitArrowLine) => {
    switch (element.shape) {
        case ArrowLineShape.elbow: {
            return getElbowPoints(board, element);
        }
        case ArrowLineShape.curve: {
            return getCurvePoints(board, element);
        }
        default: {
            const points = PlaitArrowLine.getPoints(board, element);
            const handleRefPair = getArrowLineHandleRefPair(board, element);
            points[0] = handleRefPair.source.point;
            points[points.length - 1] = handleRefPair.target.point;
            return points;
        }
    }
};

export const getCurvePoints = (board: PlaitBoard, element: PlaitArrowLine) => {
    if (element.points.length === 2) {
        const handleRefPair = getArrowLineHandleRefPair(board, element);
        const { source, target } = handleRefPair;
        const sourceBoundElement = handleRefPair.source.boundElement;
        const targetBoundElement = handleRefPair.target.boundElement;
        let curvePoints: Point[] = [source.point];
        const sumDistance = distanceBetweenPointAndPoint(...source.point, ...target.point);
        const offset = 12 + sumDistance / 3;
        if (sourceBoundElement) {
            curvePoints.push(getPointByVectorComponent(source.point, source.vector, offset));
        }
        if (targetBoundElement) {
            curvePoints.push(getPointByVectorComponent(target.point, target.vector, offset));
        }
        const isSingleBound = (sourceBoundElement && !targetBoundElement) || (!sourceBoundElement && targetBoundElement);
        if (isSingleBound) {
            curvePoints.push(target.point);
            const points = Q2C(curvePoints);
            return pointsOnBezierCurves(points) as Point[];
        }
        if (!sourceBoundElement && !targetBoundElement) {
            curvePoints.push(getPointByVectorComponent(source.point, source.vector, offset));
            curvePoints.push(getPointByVectorComponent(target.point, target.vector, offset));
        }
        curvePoints.push(target.point);
        return pointsOnBezierCurves(curvePoints) as Point[];
    } else {
        let dataPoints = PlaitArrowLine.getPoints(board, element);
        dataPoints = removeDuplicatePoints(dataPoints);
        const points = catmullRomFitting(dataPoints);
        return pointsOnBezierCurves(points) as Point[];
    }
};

export const drawArrowLine = (board: PlaitBoard, element: PlaitArrowLine) => {
    const strokeWidth = getStrokeWidthByElement(element);
    const strokeColor = getStrokeColorByElement(board, element);
    const strokeLineDash = getLineDashByElement(element);
    const options = { stroke: strokeColor, strokeWidth, strokeLineDash };
    const lineG = createG();
    let points = getArrowLinePoints(board, element);
    let line;
    if (element.shape === ArrowLineShape.curve) {
        line = PlaitBoard.getRoughSVG(board).curve(points, options);
    } else {
        line = drawLinearPath(points, options);
    }
    const id = idCreator();
    line.setAttribute('mask', `url(#${id})`);
    if (element.strokeStyle === StrokeStyle.dotted) {
        setStrokeLinecap(line, 'round');
    }
    lineG.appendChild(line);

    const { mask, maskTargetFillRect } = drawArrowLineMask(board, element as PlaitArrowLine, id);
    lineG.appendChild(mask);
    line.appendChild(maskTargetFillRect);
    const arrow = drawArrowLineArrow(element as PlaitArrowLine, points, { stroke: strokeColor, strokeWidth });
    arrow && lineG.appendChild(arrow);
    return lineG;
};

export const getHitConnection = (board: PlaitBoard, point: Point, hitElement: PlaitShapeElement): Point => {
    let rectangle = RectangleClient.getRectangleByPoints(hitElement.points);
    const ref = getSnappingRef(board, hitElement, point);
    const connectionPoint = ref.connectorPoint || ref.edgePoint;
    return [(connectionPoint[0] - rectangle.x) / rectangle.width, (connectionPoint[1] - rectangle.y) / rectangle.height];
};

export const getHitConnectorPoint = (point: Point, hitElement: PlaitShapeElement) => {
    const rectangle = RectangleClient.getRectangleByPoints(hitElement.points);
    const shape = getElementShape(hitElement);
    const connectorPoints = getEngine(shape).getConnectorPoints(rectangle);
    return connectorPoints.find(connectorPoint => {
        return distanceBetweenPointAndPoint(...connectorPoint, ...point) <= LINE_SNAPPING_CONNECTOR_BUFFER;
    });
};

export const getArrowLineTextRectangle = (board: PlaitBoard, element: PlaitArrowLine, index: number): RectangleClient => {
    const text = element.texts[index];
    const elbowPoints = getArrowLinePoints(board, element);
    const point = getPointOnPolyline(elbowPoints, text.position);
    return {
        x: point[0] - text.width! / 2,
        y: point[1] - text.height! / 2,
        width: text.width!,
        height: text.height!
    };
};

export const getArrowLines = (board: PlaitBoard) => {
    return findElements(board, {
        match: (element: PlaitElement) => PlaitDrawElement.isArrowLine(element),
        recursion: (element: PlaitElement) => PlaitDrawElement.isDrawElement(element)
    }) as PlaitArrowLine[];
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

export const handleArrowLineCreating = (
    board: PlaitBoard,
    lineShape: ArrowLineShape,
    sourcePoint: Point,
    movingPoint: Point,
    sourceElement: PlaitShapeElement | null,
    lineShapeG: SVGGElement
) => {
    const hitElement = getSnappingShape(board, movingPoint);
    const targetConnection = hitElement ? getHitConnection(board, movingPoint, hitElement) : undefined;
    const sourceConnection = sourceElement ? getHitConnection(board, sourcePoint, sourceElement) : undefined;
    const targetBoundId = hitElement ? hitElement.id : undefined;
    const lineGenerator = new ArrowLineGenerator(board);
    const memorizedLatest = getLineMemorizedLatest();
    let sourceMarker, targetMarker;
    sourceMarker = memorizedLatest.source;
    targetMarker = memorizedLatest.target;
    sourceMarker && delete memorizedLatest.source;
    targetMarker && delete memorizedLatest.target;
    const temporaryLineElement = createArrowLineElement(
        lineShape,
        [sourcePoint, movingPoint],
        { marker: sourceMarker || ArrowLineMarkerType.none, connection: sourceConnection, boundId: sourceElement?.id },
        { marker: targetMarker || ArrowLineMarkerType.arrow, connection: targetConnection, boundId: targetBoundId },
        [],
        {
            strokeWidth: DefaultLineStyle.strokeWidth,
            ...memorizedLatest
        }
    );
    const linePoints = getArrowLinePoints(board, temporaryLineElement);
    const otherPoint = linePoints[0];
    temporaryLineElement.points[1] = alignPoints(otherPoint, movingPoint);
    lineGenerator.processDrawing(temporaryLineElement, lineShapeG);
    PlaitBoard.getElementActiveHost(board).append(lineShapeG);
    return temporaryLineElement;
};

function drawArrowLineMask(board: PlaitBoard, element: PlaitArrowLine, id: string) {
    const mask = createMask();
    mask.setAttribute('id', id);
    const points = getArrowLinePoints(board, element);
    let rectangle = RectangleClient.getRectangleByPoints(points);
    rectangle = RectangleClient.getOutlineRectangle(rectangle, -30);
    const maskFillRect = createRect(rectangle, {
        fill: 'white'
    });
    mask.appendChild(maskFillRect);

    const texts = element.texts;
    texts.forEach((text, index) => {
        let textRectangle = getArrowLineTextRectangle(board, element, index);
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

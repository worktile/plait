import { PlaitBoard, Point, createG, drawLinearPath, idCreator, setStrokeLinecap } from '@plait/core';
import { ArrowLineHandle, ArrowLineMarkerType, PlaitArrowLine, PlaitVectorLine, StrokeStyle, VectorLineShape } from '../interfaces';
import { getLineMemorizedLatest } from './memorize';
import { DefaultLineStyle } from '../constants/line';
import { alignPoints, getCurvePoints } from './arrow-line';
import { getStrokeWidthByElement } from './common';
import { getLineDashByElement, getStrokeColorByElement } from './style';
import { LineGenerator } from '../generators/line.generator';

export const isClosedVectorLine = (vectorLine: PlaitVectorLine) => {
    const points = vectorLine.points;
    const startPoint = points[0];
    const endPoint = points[points.length - 1];
    return startPoint[0] === endPoint[0] && startPoint[1] === endPoint[1];
};

export const getVectorLinePoints = (board: PlaitBoard, element: PlaitVectorLine) => {
    switch (element.shape) {
        case VectorLineShape.straight: {
            const points = PlaitArrowLine.getPoints(board, element);
            return points;
        }
        case VectorLineShape.curve: {
            return getCurvePoints(board, (element as unknown) as PlaitArrowLine);
        }
        default:
            return null;
    }
};

export const createVectorLineElement = (
    shape: VectorLineShape,
    points: [Point, Point],
    source: ArrowLineHandle,
    target: ArrowLineHandle,
    options?: Pick<PlaitVectorLine, 'strokeColor' | 'strokeWidth'>
): PlaitVectorLine => {
    return {
        id: idCreator(),
        type: 'vector-line',
        shape,
        source,
        target,
        opacity: 1,
        points,
        ...options
    };
};

export const vectorLineCreating = (
    board: PlaitBoard,
    lineShape: VectorLineShape,
    sourcePoint: Point,
    movingPoint: Point,
    lineShapeG: SVGGElement
) => {
    const lineGenerator = new LineGenerator(board);
    const memorizedLatest = getLineMemorizedLatest();
    const temporaryLineElement = createVectorLineElement(
        lineShape,
        [sourcePoint, movingPoint],
        { marker: ArrowLineMarkerType.none },
        { marker: ArrowLineMarkerType.none },
        {
            strokeWidth: DefaultLineStyle.strokeWidth,
            ...memorizedLatest
        }
    );
    const linePoints = getVectorLinePoints(board, temporaryLineElement);
    const otherPoint = linePoints![0];
    temporaryLineElement.points[1] = alignPoints(otherPoint, movingPoint);
    lineGenerator.processDrawing((temporaryLineElement as unknown) as PlaitArrowLine, lineShapeG);
    PlaitBoard.getElementActiveHost(board).append(lineShapeG);
    return temporaryLineElement;
};

export const drawVectorLine = (board: PlaitBoard, element: PlaitVectorLine) => {
    const strokeWidth = getStrokeWidthByElement(element);
    const strokeColor = getStrokeColorByElement(board, element);
    const strokeLineDash = getLineDashByElement(element);
    const options = { stroke: strokeColor, strokeWidth, strokeLineDash };
    const lineG = createG();
    let points = getVectorLinePoints(board, element)!;
    let line;
    if (element.shape === VectorLineShape.curve) {
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
    return lineG;
};

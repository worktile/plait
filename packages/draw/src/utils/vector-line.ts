import { PlaitBoard, Point, catmullRomFitting, createG, drawLinearPath, idCreator, setStrokeLinecap } from '@plait/core';
import { PlaitVectorLine, StrokeStyle, VectorLineShape } from '../interfaces';
import { getLineMemorizedLatest } from './memorize';
import { DefaultLineStyle } from '../constants/line';
import { alignPoints } from './arrow-line';
import { getStrokeWidthByElement } from './common';
import { getFillByElement, getLineDashByElement, getStrokeColorByElement } from './style';
import { VectorLineShapeGenerator } from '../generators/vector-line-generator';
import { pointsOnBezierCurves } from 'points-on-curve';
import { removeDuplicatePoints } from '@plait/common';

export const isClosedVectorLine = (vectorLine: PlaitVectorLine) => {
    const points = vectorLine.points;
    const startPoint = points[0];
    const endPoint = points[points.length - 1];
    return startPoint[0] === endPoint[0] && startPoint[1] === endPoint[1];
};

export const getVectorLinePoints = (board: PlaitBoard, element: PlaitVectorLine) => {
    switch (element.shape) {
        case VectorLineShape.straight: {
            return element.points;
        }
        case VectorLineShape.curve: {
            if (element.points.length === 2) {
                return pointsOnBezierCurves(element.points) as Point[];
            } else {
                let dataPoints = element.points;
                dataPoints = removeDuplicatePoints(dataPoints);
                const points = catmullRomFitting(dataPoints);
                return pointsOnBezierCurves(points) as Point[];
            }
        }
        default:
            return null;
    }
};

export const createVectorLineElement = (
    shape: VectorLineShape,
    points: [Point, Point],
    options?: Pick<PlaitVectorLine, 'strokeColor' | 'strokeWidth' | 'fill'>
): PlaitVectorLine => {
    return {
        id: idCreator(),
        type: 'vector-line',
        shape,
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
    const lineGenerator = new VectorLineShapeGenerator(board);
    const memorizedLatest = getLineMemorizedLatest();
    const temporaryLineElement = createVectorLineElement(lineShape, [sourcePoint, movingPoint], {
        strokeWidth: DefaultLineStyle.strokeWidth,
        ...memorizedLatest
    });
    const linePoints = getVectorLinePoints(board, temporaryLineElement);
    const otherPoint = linePoints![0];
    temporaryLineElement.points[1] = alignPoints(otherPoint, movingPoint);
    lineGenerator.processDrawing(temporaryLineElement, lineShapeG);
    PlaitBoard.getElementActiveHost(board).append(lineShapeG);
    return temporaryLineElement;
};

export const drawVectorLine = (board: PlaitBoard, element: PlaitVectorLine) => {
    const strokeWidth = getStrokeWidthByElement(element);
    const strokeColor = getStrokeColorByElement(board, element);
    const strokeLineDash = getLineDashByElement(element);
    const fill = getFillByElement(board, element);
    const options = { stroke: strokeColor, strokeWidth, strokeLineDash, fill };
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

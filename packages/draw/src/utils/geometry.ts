import { Point, idCreator } from '@plait/core';
import { GeometryShape, PlaitGeometry } from '../interfaces/geometry';
import { buildText } from '@plait/text';
import { Element } from 'slate';
import { DefaultTextProperty, ShapeDefaultSpace } from '../constants';
import { getRectangleByPoints } from '@plait/common';

export const createGeometryElement = (
    shape: GeometryShape,
    points: [Point, Point],
    text: string | Element,
    options?: Pick<PlaitGeometry, 'fill' | 'strokeColor' | 'strokeWidth'>
): PlaitGeometry => {
    let textOptions = {};
    if (shape === GeometryShape.text) {
        textOptions = { autoSize: true };
    }

    return {
        id: idCreator(),
        type: 'geometry',
        shape,
        angle: 0,
        opacity: 1,
        textHeight: DefaultTextProperty.height,
        text: buildText(text),
        points,
        ...textOptions,
        ...options
    };
};

export const getPointsByCenterPoint = (point: Point, width: number, height: number): [Point, Point] => {
    const leftTopPoint: Point = [point[0] - width / 2, point[1] - height / 2];
    const rightBottomPoint: Point = [point[0] + width / 2, point[1] + height / 2];

    return [leftTopPoint, rightBottomPoint];
};

export const getTextRectangle = (element: PlaitGeometry) => {
    const elementRectangle = getRectangleByPoints(element.points!);
    const height = element.textHeight;
    const width = elementRectangle.width - ShapeDefaultSpace.rectangleAndText * 2;

    return {
        height,
        width: width > 0 ? width : 0,
        x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText,
        y: elementRectangle.y + (elementRectangle.height - height) / 2
    };
};

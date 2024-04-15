import { Point, RectangleClient } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from '../basic-shapes/polygon';
import { getStrokeWidthByElement } from '../../utils';
import { ShapeDefaultSpace } from '../../constants';
import { getCenterPointsOnPolygon } from '../../utils/polygon';

export const getMergePoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y],
        [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height]
    ];
};

export const MergeEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: getMergePoints,
    getConnectorPoints: (rectangle: RectangleClient) => {
        const cornerPoints = getMergePoints(rectangle);
        const lineCenterPoints = getCenterPointsOnPolygon(cornerPoints);
        return [...lineCenterPoints, ...cornerPoints];
    },
    getTextRectangle(element: PlaitGeometry) {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const strokeWidth = getStrokeWidthByElement(element);
        const height = element.textHeight!;
        const originWidth = elementRectangle.width - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
        const width = (originWidth * 2) / 3;
        return {
            height,
            width: width > 0 ? width : 0,
            x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth + originWidth / 6,
            y: elementRectangle.y + ((elementRectangle.height * 2) / 3 - height) / 2
        };
    }
});

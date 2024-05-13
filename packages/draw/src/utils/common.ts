import { PlaitElement, RectangleClient } from '@plait/core';
import { DefaultDrawStyle, ShapeDefaultSpace } from '../constants';
import { PlaitDrawElement, PlaitGeometry } from '../interfaces';
import { PlaitTableCellWithPoints } from '../interfaces/table';

export const getTextRectangle = (element: PlaitGeometry | PlaitTableCellWithPoints) => {
    const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
    const strokeWidth = getStrokeWidthByElement(element);
    const height = element.textHeight || 0;
    const width = elementRectangle.width - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
    return {
        height,
        width: width > 0 ? width : 0,
        x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth,
        y: elementRectangle.y + (elementRectangle.height - height) / 2
    };
};

export const getStrokeWidthByElement = (element: PlaitElement) => {
    if (PlaitDrawElement.isText(element)) {
        return 0;
    }
    const strokeWidth = element.strokeWidth || DefaultDrawStyle.strokeWidth;
    return strokeWidth;
};

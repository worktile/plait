import { PlaitElement, RectangleClient } from '@plait/core';
import { DefaultDrawStyle, ShapeDefaultSpace } from '../constants';
import { PlaitDrawElement, PlaitGeometry } from '../interfaces';
import { getEngine } from '../engines';
import { getTextEditors } from '@plait/common';
import { PlaitTableElement } from '../interfaces/table';

export const getTextRectangle = <T extends PlaitElement = PlaitGeometry>(element: T) => {
    const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
    const strokeWidth = getStrokeWidthByElement(element);
    const height = element.textHeight;
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

export const isDrawElementsIncludeText = (elements: PlaitDrawElement[]) => {
    return elements.some(item => {
        if (PlaitDrawElement.isText(item)) {
            return true;
        }
        if (PlaitDrawElement.isImage(item)) {
            return false;
        }

        if (PlaitDrawElement.isGeometry(item)) {
            const shapeEngine = getEngine(item.shape);
            const textRectangle = shapeEngine.getTextRectangle ? shapeEngine.getTextRectangle(item, {}) : getTextRectangle(item);
            return textRectangle.width > 0 && textRectangle.height > 0;
        }
        if (PlaitDrawElement.isLine(item)) {
            const editors = getTextEditors(item);
            return editors.length > 0;
        }

        if (PlaitDrawElement.isTable(item)) {
            return item.cells.some(cell => cell.text && cell.textHeight);
        }
        return true;
    });
};

import { addSelectedElement, BoardTransforms, clearSelectedElement, PlaitBoard, PlaitElement, PlaitPointerType, RectangleClient, Transforms } from '@plait/core';
import { DefaultDrawStyle, ShapeDefaultSpace } from '../constants';
import { PlaitCommonGeometry, PlaitDrawElement, PlaitGeometry } from '../interfaces';
import { PlaitTable } from '../interfaces/table';
import { memorizeLatestShape } from './memorize';

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


export const insertElement = (board: PlaitBoard, element: PlaitCommonGeometry | PlaitTable) => {
    memorizeLatestShape(board, element.shape);
    Transforms.insertNode(board, element, [board.children.length]);
    clearSelectedElement(board);
    addSelectedElement(board, element);
    BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
};
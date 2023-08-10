import { PlaitBoard, PlaitElement, PlaitPluginElementContext, Point, Range, RectangleClient } from '@plait/core';
import { GeometryComponent } from '../geometry.component';
import { LineComponent } from '../line.component';
import { PlaitDrawElement } from '../interfaces';
import { getRectangleByPoints } from '@plait/common';

export const withDraw = (board: PlaitBoard) => {
    const { drawElement, getRectangle, isHitSelection, isMovable } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        if (PlaitDrawElement.isGeometry(context.element)) {
            return GeometryComponent;
        } else if (PlaitDrawElement.isLine(context.element)) {
            return LineComponent;
        }
        return drawElement(context);
    };

    board.getRectangle = (element: PlaitElement) => {
        if (PlaitDrawElement.isGeometry(element)) {
            return getRectangleByPoints(element.points);
        }
        return getRectangle(element);
    };

    board.isHitSelection = (element: PlaitElement, range: Range) => {
        if (PlaitDrawElement.isGeometry(element)) {
            const client = getRectangleByPoints(element.points);
            return RectangleClient.isHit(RectangleClient.toRectangleClient([range.anchor, range.focus]), client);
        }
        return isHitSelection(element, range);
    };

    board.isMovable = (element: PlaitElement) => {
        if (PlaitDrawElement.isGeometry(element)) {
            return true;
        }
        return isMovable(element);
    }

    return board;
};

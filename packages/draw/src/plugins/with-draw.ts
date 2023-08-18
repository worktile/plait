import { PlaitBoard, PlaitElement, PlaitPluginElementContext, Range, RectangleClient, getSelectedElements } from '@plait/core';
import { GeometryComponent } from '../geometry.component';
import { LineComponent } from '../line.component';
import { PlaitDrawElement } from '../interfaces';
import { getRectangleByPoints } from '@plait/common';
import { withDrawHotkey } from './with-draw-hotkey';
import { withGeometryCreateByDraw, withGeometryCreateByDrag } from './with-geometry-create';
import { withDrawFragment } from './with-draw-fragment';
import { getTextRectangle } from '../utils';

export const withDraw = (board: PlaitBoard) => {
    const { drawElement, getRectangle, isHitSelection, isMovable, dblclick } = board;

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

            if (element.textHeight > client.height) {
                const textClient = getTextRectangle(element);
                return (
                    RectangleClient.isHit(RectangleClient.toRectangleClient([range.anchor, range.focus]), client) ||
                    RectangleClient.isHit(RectangleClient.toRectangleClient([range.anchor, range.focus]), textClient)
                );
            }

            return RectangleClient.isHit(RectangleClient.toRectangleClient([range.anchor, range.focus]), client);
        }
        return isHitSelection(element, range);
    };

    board.isMovable = (element: PlaitElement) => {
        if (PlaitDrawElement.isGeometry(element)) {
            return true;
        }
        return isMovable(element);
    };

    board.dblclick = (event: MouseEvent) => {
        const element = getSelectedElements(board)[0];
        if (element && PlaitDrawElement.isGeometry(element)) {
            const component = PlaitElement.getComponent(element) as GeometryComponent;
            component.editText();
        }

        dblclick(event);
    };

    return withGeometryCreateByDrag(withGeometryCreateByDraw(withDrawFragment(withDrawHotkey(board))));
};

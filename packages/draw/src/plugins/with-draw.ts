import { PlaitBoard, PlaitElement, PlaitPluginElementContext, Range, RectangleClient, getSelectedElements } from '@plait/core';
import { GeometryComponent } from '../geometry.component';
import { LineComponent } from '../line.component';
import { PlaitDrawElement } from '../interfaces';
import { getRectangleByPoints } from '@plait/common';
import { withDrawHotkey } from './with-draw-hotkey';
import { withGeometryCreateByDraw, withGeometryCreateByDrag } from './with-geometry-create';
import { withDrawFragment } from './with-draw-fragment';
import { getElbowPoints, getTextRectangle, isHitPolyLine, isPolyLineIntersectWithRectangle } from '../utils';
import { getStrokeWidthByElement } from '../utils/geometry-style/stroke';
import { withLineCreateByDraw } from './with-line-create';

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
            const rangeRectangle = RectangleClient.toRectangleClient([range.anchor, range.focus]);
            if (element.textHeight > client.height) {
                const textClient = getTextRectangle(element);
                return RectangleClient.isHit(rangeRectangle, client) || RectangleClient.isHit(rangeRectangle, textClient);
            }
            return RectangleClient.isHit(rangeRectangle, client);
        }
        if (PlaitDrawElement.isLine(element)) {
            const points = getElbowPoints(element);
            const strokeWidth = getStrokeWidthByElement(board, element);
            const isHit = isHitPolyLine(points, range.focus, strokeWidth, 3);
            const rangeRectangle = RectangleClient.toRectangleClient([range.anchor, range.focus]);
            const isContainPolyLinePoint = points.some(point => {
                return RectangleClient.isHit(rangeRectangle, RectangleClient.toRectangleClient([point, point]));
            });
            const isIntersect = range.anchor === range.focus ? isHit : isPolyLineIntersectWithRectangle(points, rangeRectangle);
            return isContainPolyLinePoint || isIntersect;
        }

        return isHitSelection(element, range);
    };

    board.isMovable = (element: PlaitElement) => {
        if (PlaitDrawElement.isGeometry(element)) {
            return true;
        }
        if (PlaitDrawElement.isLine(element)) {
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

    return withLineCreateByDraw(withGeometryCreateByDrag(withGeometryCreateByDraw(withDrawFragment(withDrawHotkey(board)))));
};

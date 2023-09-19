import { PlaitBoard, PlaitElement, PlaitPluginElementContext, Range, RectangleClient, isPolylineHitRectangle } from '@plait/core';
import { GeometryComponent } from '../geometry.component';
import { LineComponent } from '../line.component';
import { PlaitDrawElement } from '../interfaces';
import { getRectangleByPoints } from '@plait/common';
import { withDrawHotkey } from './with-draw-hotkey';
import { withGeometryCreateByDraw, withGeometryCreateByDrag } from './with-geometry-create';
import { withDrawFragment } from './with-draw-fragment';
import { getTextRectangle, isHitPolyLine, isHitLineText, getTargetPoint, getSourcePoint, getLinePoints } from '../utils';
import { getStrokeWidthByElement } from '../utils/style/stroke';
import { withLineCreateByDraw } from './with-line-create';
import { withGeometryResize } from './with-geometry-resize';
import { withLineResize } from './with-line-resize';
import { withLineBoundReaction } from './with-line-bound-reaction';
import { withLineText } from './with-line-text';

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
        if (PlaitDrawElement.isLine(element)) {
            const source = getSourcePoint(board, element);
            const target = getTargetPoint(board, element);
            return getRectangleByPoints([source, target]);
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
            const points = getLinePoints(board, element);
            const strokeWidth = getStrokeWidthByElement(element);
            const isHitText = isHitLineText(board, element, range.focus);
            const isHit = isHitPolyLine(points, range.focus, strokeWidth, 3) || isHitText;
            const rangeRectangle = RectangleClient.toRectangleClient([range.anchor, range.focus]);
            const isContainPolyLinePoint = points.some(point => {
                return RectangleClient.isHit(rangeRectangle, RectangleClient.toRectangleClient([point, point]));
            });
            const isIntersect = range.anchor === range.focus ? isHit : isPolylineHitRectangle(points, rangeRectangle);
            return isContainPolyLinePoint || isIntersect;
        }

        return isHitSelection(element, range);
    };

    board.isMovable = (element: PlaitElement) => {
        if (PlaitDrawElement.isGeometry(element)) {
            return true;
        }
        if (PlaitDrawElement.isLine(element)) {
            return !element.source.boundId && !element.source.boundId;
        }
        return isMovable(element);
    };

    return withLineText(
        withLineBoundReaction(
            withLineResize(
                withGeometryResize(
                    withLineCreateByDraw(withGeometryCreateByDrag(withGeometryCreateByDraw(withDrawFragment(withDrawHotkey(board)))))
                )
            )
        )
    );
};

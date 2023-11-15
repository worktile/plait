import {
    PlaitBoard,
    PlaitElement,
    PlaitPluginElementContext,
    Range,
    RectangleClient,
    getSelectedElements,
    isPolylineHitRectangle
} from '@plait/core';
import { GeometryComponent } from '../geometry.component';
import { LineComponent } from '../line.component';
import { PlaitDrawElement } from '../interfaces';
import { getRectangleByPoints } from '@plait/common';
import { withDrawHotkey } from './with-draw-hotkey';
import { withGeometryCreateByDrawing, withGeometryCreateByDrag } from './with-geometry-create';
import { withDrawFragment } from './with-draw-fragment';
import { getTextRectangle, isHitPolyLine, isHitLineText, getLinePoints } from '../utils';
import { getStrokeWidthByElement } from '../utils/style/stroke';
import { withLineCreateByDraw } from './with-line-create';
import { withGeometryResize } from './with-geometry-resize';
import { withLineResize } from './with-line-resize';
import { withLineBoundReaction } from './with-line-bound-reaction';
import { withLineText } from './with-line-text';
import { ImageComponent } from '../image.component';

export const withDraw = (board: PlaitBoard) => {
    const { drawElement, getRectangle, isRectangleHit, isMovable, isAlign } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        if (PlaitDrawElement.isGeometry(context.element)) {
            return GeometryComponent;
        } else if (PlaitDrawElement.isLine(context.element)) {
            return LineComponent;
        } else if (PlaitDrawElement.isImage(context.element)) {
            return ImageComponent;
        }
        return drawElement(context);
    };

    board.getRectangle = (element: PlaitElement) => {
        if (PlaitDrawElement.isGeometry(element)) {
            return getRectangleByPoints(element.points);
        }
        if (PlaitDrawElement.isLine(element)) {
            const points = getLinePoints(board, element);
            return getRectangleByPoints(points);
        }
        if (PlaitDrawElement.isImage(element)) {
            return getRectangleByPoints(element.points);
        }
        return getRectangle(element);
    };

    board.isRectangleHit = (element: PlaitElement, range: Range) => {
        if (PlaitDrawElement.isGeometry(element)) {
            const client = getRectangleByPoints(element.points);
            const rangeRectangle = RectangleClient.toRectangleClient([range.anchor, range.focus]);
            if (element.textHeight > client.height) {
                const textClient = getTextRectangle(element);
                return RectangleClient.isHit(rangeRectangle, client) || RectangleClient.isHit(rangeRectangle, textClient);
            }
            return RectangleClient.isHit(rangeRectangle, client);
        }
        if (PlaitDrawElement.isImage(element)) {
            const client = getRectangleByPoints(element.points);
            const rangeRectangle = RectangleClient.toRectangleClient([range.anchor, range.focus]);
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

        return isRectangleHit(element, range);
    };

    board.isMovable = (element: PlaitElement) => {
        if (PlaitDrawElement.isGeometry(element)) {
            return true;
        }
        if (PlaitDrawElement.isImage(element)) {
            return true;
        }
        if (PlaitDrawElement.isLine(element)) {
            const selectedElements = getSelectedElements(board);
            const isSelected = (boundId: string) => {
                return !!selectedElements.find(value => value.id === boundId);
            };
            if (
                (element.source.boundId && !isSelected(element.source.boundId)) ||
                (element.target.boundId && !isSelected(element.target.boundId))
            ) {
                return false;
            }
            return true;
        }
        return isMovable(element);
    };

    board.isAlign = (element: PlaitElement) => {
        if (PlaitDrawElement.isGeometry(element) || PlaitDrawElement.isImage(element)) {
            return true;
        }
        return isAlign(element);
    };

    return withLineText(
        withLineBoundReaction(
            withLineResize(
                withGeometryResize(
                    withLineCreateByDraw(withGeometryCreateByDrag(withGeometryCreateByDrawing(withDrawFragment(withDrawHotkey(board)))))
                )
            )
        )
    );
};

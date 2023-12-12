import { PlaitBoard, PlaitElement, PlaitPluginElementContext, Selection, getSelectedElements } from '@plait/core';
import { GeometryComponent } from '../geometry.component';
import { LineComponent } from '../line.component';
import { PlaitDrawElement } from '../interfaces';
import { getRectangleByPoints } from '@plait/common';
import { withDrawHotkey } from './with-draw-hotkey';
import { withGeometryCreateByDrawing, withGeometryCreateByDrag } from './with-geometry-create';
import { withDrawFragment } from './with-draw-fragment';
import { getLinePoints, isRectangleHitDrawElement, isHitDrawElement } from '../utils';
import { withLineCreateByDraw } from './with-line-create';
import { withGeometryResize } from './with-geometry-resize';
import { withLineResize } from './with-line-resize';
import { withLineBoundReaction } from './with-line-bound-reaction';
import { withLineText } from './with-line-text';
import { ImageComponent } from '../image.component';
import { withLineAutoCompleteReaction } from './with-line-auto-complete-reaction';
import { withLineAutoComplete } from './with-line-auto-complete';

export const withDraw = (board: PlaitBoard) => {
    const { drawElement, getRectangle, isRectangleHit, isHit, isMovable, isAlign } = board;

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

    board.isRectangleHit = (element: PlaitElement, selection: Selection) => {
        const result = isRectangleHitDrawElement(board, element, selection);
        if (result !== null) {
            return result;
        }
        return isRectangleHit(element, selection);
    };

    board.isHit = (element, point) => {
        const result = isHitDrawElement(board, element, point);
        if (result !== null) {
            return result;
        }
        return isHit(element, point);
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
                (!element.source.boundId ||
                    (element.source.boundId && isSelected(element.source.boundId) && selectedElements.includes(element))) &&
                (!element.target.boundId ||
                    (element.target.boundId && isSelected(element.target.boundId) && selectedElements.includes(element)))
            ) {
                return true;
            }
            return false;
        }
        return isMovable(element);
    };

    board.isAlign = (element: PlaitElement) => {
        if (PlaitDrawElement.isGeometry(element) || PlaitDrawElement.isImage(element)) {
            return true;
        }
        return isAlign(element);
    };

    return withLineAutoCompleteReaction(
        withLineText(
            withLineBoundReaction(
                withLineResize(
                    withGeometryResize(
                        withLineCreateByDraw(
                            withLineAutoComplete(withGeometryCreateByDrag(withGeometryCreateByDrawing(withDrawFragment(withDrawHotkey(board)))))
                        )
                    )
                )
            )
        )
    );
};

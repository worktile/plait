import {
    PlaitBoard,
    PlaitElement,
    PlaitGroupElement,
    PlaitPluginElementContext,
    Point,
    RectangleClient,
    Selection,
    getRectangleByGroup,
    getSelectedElements
} from '@plait/core';
import { GeometryComponent } from '../geometry.component';
import { LineComponent } from '../line.component';
import { PlaitDrawElement } from '../interfaces';
import { withDrawHotkey } from './with-draw-hotkey';
import { withGeometryCreateByDrawing, withGeometryCreateByDrag } from './with-geometry-create';
import { withDrawFragment } from './with-draw-fragment';
import { withLineCreateByDraw } from './with-line-create';
import { withGeometryResize } from './with-geometry-resize';
import { withLineResize } from './with-line-resize';
import { withLineBoundReaction } from './with-line-bound-reaction';
import { withLineText } from './with-line-text';
import { ImageComponent } from '../image.component';
import { withLineAutoCompleteReaction } from './with-line-auto-complete-reaction';
import { withLineAutoComplete } from './with-line-auto-complete';
import { withLineTextMove } from './with-line-text-move';
import { withDrawResize } from './with-draw-resize';
import { isHitDrawElement, isHitElementInside, isRectangleHitDrawElement } from '../utils/hit';
import { getLinePoints, getLineTextRectangle } from '../utils/line/line-basic';
import { withGroup } from '@plait/common';

export const withDraw = (board: PlaitBoard) => {
    const { drawElement, getRectangle, isRectangleHit, isHit, isInsidePoint, isMovable, isAlign, getRelatedFragment } = board;

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
            return RectangleClient.getRectangleByPoints(element.points);
        }
        if (PlaitDrawElement.isLine(element)) {
            const points = getLinePoints(board, element);
            const lineTextRectangles = element.texts.map((text, index) => {
                const rectangle = getLineTextRectangle(board, element, index);
                return rectangle;
            });
            const linePointsRectangle = RectangleClient.getRectangleByPoints(points);
            return RectangleClient.getBoundingRectangle([linePointsRectangle, ...lineTextRectangles]);
        }
        if (PlaitDrawElement.isImage(element)) {
            return RectangleClient.getRectangleByPoints(element.points);
        }
        if (PlaitGroupElement.isGroup(element)) {
            return getRectangleByGroup(board, element);
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

    board.isInsidePoint = (element: PlaitElement, point: Point) => {
        const result = isHitElementInside(board, element, point);
        if (result !== null) {
            return result;
        }
        return isInsidePoint(element, point);
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
            if (!element.source.boundId && !element.target.boundId) {
                return true;
            }
            if (element.source.boundId && isSelected(element.source.boundId) && selectedElements.includes(element)) {
                return true;
            }
            if (element.target.boundId && isSelected(element.target.boundId) && selectedElements.includes(element)) {
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

    board.getRelatedFragment = (elements: PlaitElement[]) => {
        const selectedElements = getSelectedElements(board);
        const lineElements = board.children.filter(element => PlaitDrawElement.isLine(element));
        const activeLines = lineElements.filter(line => {
            const source = selectedElements.find(element => element.id === line.source.boundId);
            const target = selectedElements.find(element => element.id === line.target.boundId);
            const isSelected = selectedElements.includes(line);
            return source && target && !isSelected;
        });
        return getRelatedFragment([...elements, ...activeLines]);
    };


    return withGroup(withDrawResize(
        withLineTextMove(
            withLineAutoCompleteReaction(
                withLineText(
                    withLineBoundReaction(
                        withLineResize(
                            withGeometryResize(
                                withLineCreateByDraw(
                                    withLineAutoComplete(
                                        withGeometryCreateByDrag(withGeometryCreateByDrawing(withDrawFragment(withDrawHotkey(board))))
                                    )
                                )
                            )
                        )
                    )
                )
            )
        ))
    );
};

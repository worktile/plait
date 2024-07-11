import {
    isHitElement,
    PlaitBoard,
    PlaitElement,
    PlaitOptionsBoard,
    PlaitPluginElementContext,
    PlaitPluginKey,
    PlaitPointerType,
    Point,
    RectangleClient,
    Selection,
    setSelectionOptions,
    toHostPoint,
    toViewBoxPoint,
    WithHandPluginOptions
} from '@plait/core';
import { ForceAtlasFlavour } from './force-atlas.flavour';
import { ForceAtlasNodeFlavour } from './node.flavour';
import { ForceAtlasEdgeFlavour } from './edge.flavour';
import { ForceAtlasElement } from '../interfaces';
import { isHitNode } from './utils/node';
import { withNodeIcon } from './with-node-icon';

export const withForceAtlas = (board: PlaitBoard) => {
    const { drawElement, getRectangle, isRectangleHit, isHit, isInsidePoint, isMovable, isAlign, getRelatedFragment } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        if (ForceAtlasElement.isForceAtlas(context.element)) {
            return ForceAtlasFlavour;
        } else if (ForceAtlasElement.isForceAtlasNodeElement(context.element)) {
            return ForceAtlasNodeFlavour;
        } else if (ForceAtlasElement.isForceAtlasEdgeElement(context.element)) {
            return ForceAtlasEdgeFlavour;
        }
        return drawElement(context);
    };

    board.getRectangle = (element: PlaitElement) => {
        if (element.type === 'force-atlas') {
            return {
                width: 0,
                height: 0,
                x: 0,
                y: 0
            };
        } else if (ForceAtlasElement.isForceAtlasNodeElement(element)) {
            return RectangleClient.getRectangleByPoints(element.points || []);
        } else if (ForceAtlasElement.isForceAtlasEdgeElement(element)) {
            return {
                width: 0,
                height: 0,
                x: 0,
                y: 0
            };
        }
        return getRectangle(element);
    };

    board.isRectangleHit = (element: PlaitElement, selection: Selection) => {
        return isRectangleHit(element, selection);
    };
    board.isRectangleHit = (element, range) => {
        if (ForceAtlasElement.isForceAtlasNodeElement(element)) {
            return isHitNode(element, [range.anchor, range.focus]);
        }
        return isRectangleHit(element, range);
    };

    board.isHit = (element, point) => {
        if (ForceAtlasElement.isForceAtlasNodeElement(element)) {
            return isHitNode(element, [point, point]);
        }
        return isHit(element, point);
    };

    board.isInsidePoint = (element: PlaitElement, point: Point) => {
        return isInsidePoint(element, point);
    };

    setSelectionOptions(board, { isMultipleSelection: false, isPreventClearSelection: true });

    (board as PlaitOptionsBoard).setPluginOptions<WithHandPluginOptions>(PlaitPluginKey.withHand, {
        isHandMode: (board, event) => {
            const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            const isHitTarget = isHitElement(board, point);
            return PlaitBoard.isPointer(board, PlaitPointerType.selection) && !isHitTarget;
        }
    });

    return withNodeIcon(board);
};

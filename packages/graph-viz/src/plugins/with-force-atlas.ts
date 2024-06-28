import { PlaitBoard, PlaitElement, PlaitPluginElementContext, Point, RectangleClient, Selection } from '@plait/core';
import { ForceAtlasFlavour } from '../force-atlas.flavour';
import { ForceAtlasNodeFlavour } from '../force-atlas-node.flavour';
import { ForceAtlasEdgeFlavour } from '../force-atlas-edge.flavour';
import { ForceAtlasElement } from '../interfaces';

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

    board.isHit = (element, point) => {
        return isHit(element, point);
    };

    board.isInsidePoint = (element: PlaitElement, point: Point) => {
        return isInsidePoint(element, point);
    };

    board.isMovable = (element: PlaitElement) => {
        return false;
    };

    return board;
};

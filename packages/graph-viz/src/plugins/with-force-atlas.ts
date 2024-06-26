import { PlaitBoard, PlaitElement, PlaitPluginElementContext, Point, RectangleClient, Selection } from '@plait/core';
import { ForceAtlasFlavour } from '../force-atlas.flavour';

export const withForceAtlas = (board: PlaitBoard) => {
    const { drawElement, getRectangle, isRectangleHit, isHit, isInsidePoint, isMovable, isAlign, getRelatedFragment } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        return ForceAtlasFlavour;
    };

    board.getRectangle = (element: PlaitElement) => {
        return RectangleClient.getRectangleByPoints(element.points || []);
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

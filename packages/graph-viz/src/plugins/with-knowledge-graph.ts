import { PlaitBoard, PlaitElement, PlaitPluginElementContext, Point, Selection } from '@plait/core';
import { KnowledgeGraphFlavour } from '../knowledge-graph.flavour';

export const withKnowledgeGraph = (board: PlaitBoard) => {
    const { drawElement, getRectangle, isRectangleHit, isHit, isInsidePoint, isMovable, isAlign, getRelatedFragment } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        return KnowledgeGraphFlavour;
    };

    board.getRectangle = (element: PlaitElement) => {
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

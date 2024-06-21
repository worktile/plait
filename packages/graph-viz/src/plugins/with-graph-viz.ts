import { PlaitBoard, PlaitElement, PlaitPluginElementContext, Point, Selection } from "@plait/core";
import { VertexFlavour } from "../Vertex.flavour";

export const withDraw = (board: PlaitBoard) => {
    const { drawElement, getRectangle, isRectangleHit, isHit, isInsidePoint, isMovable, isAlign, getRelatedFragment } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        return VertexFlavour;
        // if (PlaitDrawElement.isGeometry(context.element)) {
        //     if (PlaitDrawElement.isUML(context.element)) {
        //         return GeometryComponent;
        //     }
        //     return GeometryComponent;
        // } else if (PlaitDrawElement.isLine(context.element)) {
        //     return LineComponent;
        // } else if (PlaitDrawElement.isImage(context.element)) {
        //     return ImageComponent;
        // }
        return drawElement(context);
    };

    board.getRectangle = (element: PlaitElement) => {
        // if (PlaitDrawElement.isGeometry(element)) {
        //     return RectangleClient.getRectangleByPoints(element.points);
        // }
        return getRectangle(element);
    };

    board.isRectangleHit = (element: PlaitElement, selection: Selection) => {
        // const result = isRectangleHitDrawElement(board, element, selection);
        // if (result !== null) {
        //     return result;
        // }
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
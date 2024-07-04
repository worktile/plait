import { getDirectionByVector, getPointByVectorComponent } from '@plait/common';
import { PlaitBoard, Vector, Direction, RectangleClient, Point } from '@plait/core';
import { createDefaultSwimlane, insertElement } from '../utils';
import { insertGeometry } from './geometry';
import { BasicShapes, FlowchartSymbols, GeometryShapes, SwimlaneDrawSymbols, UMLSymbols } from '../interfaces';
import {
    DefaultBasicShapeProperty,
    DefaultBasicShapePropertyMap,
    DefaultFlowchartPropertyMap,
    DefaultSwimlanePropertyMap,
    DefaultUMLPropertyMap,
    getSwimlanePointers
} from '../constants';

export const insertDrawByVector = (board: PlaitBoard, point: Point, shape: GeometryShapes | SwimlaneDrawSymbols, vector: Vector) => {
    const swimlanePointers = getSwimlanePointers();
    const isSwimlanePointer = swimlanePointers.includes(shape);
    let shapeProperty =
        DefaultFlowchartPropertyMap[shape as FlowchartSymbols] ||
        DefaultBasicShapePropertyMap[shape as BasicShapes] ||
        DefaultUMLPropertyMap[shape as UMLSymbols] ||
        DefaultBasicShapeProperty;
    if (isSwimlanePointer) {
        shapeProperty = DefaultSwimlanePropertyMap[shape];
    }
    const direction = getDirectionByVector(vector);
    if (direction) {
        let offset = 0;
        if ([Direction.left, Direction.right].includes(direction)) {
            offset = -shapeProperty.width / 2;
        } else {
            offset = -shapeProperty.height / 2;
        }
        const vectorPoint = getPointByVectorComponent(point, vector, offset);
        const points = RectangleClient.getPoints(
            RectangleClient.getRectangleByCenterPoint(vectorPoint, shapeProperty.width, shapeProperty.height)
        );
        if (isSwimlanePointer) {
            const swimlane = createDefaultSwimlane(shape as SwimlaneDrawSymbols, points);
            insertElement(board, swimlane);
            return swimlane;
        }
        return insertGeometry(board, points, shape as GeometryShapes);
    }
    return null;
};

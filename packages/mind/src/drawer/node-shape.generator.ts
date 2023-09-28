import { Generator } from '@plait/common';
import { MindElement, MindElementShape } from '../interfaces/element';
import { getRectangleByNode } from '../utils/position/node';
import { MindNode } from '../interfaces/node';
import { drawRoundRectangleByElement } from '../utils/draw/node-shape';
import { getShapeByElement } from '../utils/node-style/shape';

export interface ShapeData {
    node: MindNode;
}

export class NodeShapeGenerator extends Generator<MindElement, ShapeData> {
    canDraw(element: MindElement, data: ShapeData): boolean {
        const shape = getShapeByElement(this.board, element);
        if (shape === MindElementShape.roundRectangle) {
            return true;
        }
        return false;
    }

    baseDraw(element: MindElement, data: ShapeData) {
        const rectangle = getRectangleByNode(data.node);
        return drawRoundRectangleByElement(this.board, rectangle, data.node.origin);
    }
}

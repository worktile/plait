import { BOARD_TO_HOST, PlaitBoard, PlaitElement, PlaitPlugin, Point, getSelectedElements, toPoint, transformPoint } from '@plait/core';
import { MindmapNodeComponent } from '../node.component';
import { AbstractNode } from '@plait/layouts';
import { MINDMAP_ELEMENT_TO_COMPONENT } from '../utils';

import { AbstractHandlePosition, MindElement } from '../interfaces';

export const withAbstract: PlaitPlugin = (board: PlaitBoard) => {
    const { mousedown, mousemove, mouseup } = board;
    let start = false;
    let abstractElement: PlaitElement;
    let abstractComponent: MindmapNodeComponent | undefined;
    let abstractHandlePosition: AbstractHandlePosition;
    let startPoint: Point;
    let offsetX: number = 0;
    let offsetY: number = 0;

    board.mousedown = (event: MouseEvent) => {
        abstractElement = getSelectedElements(board)[0];
        abstractComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(abstractElement as MindElement);
        const host = BOARD_TO_HOST.get(board);
        const point = transformPoint(board, toPoint(event.x, event.y, host!));
        //TODO 判断 point 是否和 handle 范围相交
        if (abstractComponent && AbstractNode.isAbstract(abstractElement)) {
            abstractHandlePosition = AbstractHandlePosition.end;
            start = true;
            startPoint = point;
        }
        mousedown(event);
    };

    board.mousemove = (event: MouseEvent) => {
        getSelectedElements(board);
        const host = BOARD_TO_HOST.get(board);
        const endPoint = transformPoint(board, toPoint(event.x, event.y, host!));
        if (start && abstractComponent) {
            offsetX = endPoint[0] - startPoint[0];
            offsetY = endPoint[1] - startPoint[1];
            abstractComponent.updateAbstractIncludedOutline([offsetX, offsetY], abstractHandlePosition);
        }
        mousemove(event);
    };

    board.mouseup = (event: MouseEvent) => {
        start = false;
        mouseup(event);
    };
    return board;
};

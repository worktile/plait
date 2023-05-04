import { BOARD_TO_HOST, PlaitBoard, PlaitElement, PlaitPlugin, Point, getSelectedElements, toPoint, transformPoint } from '@plait/core';
import { AbstractNode, MindmapLayoutType, isHorizontalLayout } from '@plait/layouts';
import { MINDMAP_ELEMENT_TO_COMPONENT } from '../utils';
import { AbstractHandlePosition, MindElement } from '../interfaces';
import { MindmapQueries } from '../public-api';

export const withAbstract: PlaitPlugin = (board: PlaitBoard) => {
    const { mousedown, mousemove, mouseup } = board;
    let activeAbstractElement: PlaitElement;
    let abstractHandlePosition: AbstractHandlePosition;
    let startPoint: Point | undefined;

    board.mousedown = (event: MouseEvent) => {
        activeAbstractElement = getSelectedElements(board)[0];
        const abstractComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(activeAbstractElement as MindElement);
        const host = BOARD_TO_HOST.get(board);
        const point = transformPoint(board, toPoint(event.x, event.y, host!));
        //TODO 判断 point 是否和 handle 范围相交
        if (abstractComponent && AbstractNode.isAbstract(activeAbstractElement)) {
            abstractHandlePosition = AbstractHandlePosition.start;
            startPoint = point;
        }
        mousedown(event);
    };

    board.mousemove = (event: MouseEvent) => {
        getSelectedElements(board);
        const host = BOARD_TO_HOST.get(board);
        const endPoint = transformPoint(board, toPoint(event.x, event.y, host!));
        if (startPoint && activeAbstractElement) {
            const abstractComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(activeAbstractElement as MindElement);
            const nodeLayout = MindmapQueries.getCorrectLayoutByElement(activeAbstractElement as MindElement) as MindmapLayoutType;
            const isHorizontal = isHorizontalLayout(nodeLayout);
            const resizingLocation = isHorizontal ? endPoint[1] : endPoint[0];
            abstractComponent!.updateAbstractIncludedOutline(resizingLocation, abstractHandlePosition);
        }
        mousemove(event);
    };

    board.mouseup = (event: MouseEvent) => {
        startPoint = undefined;
        mouseup(event);
    };
    return board;
};

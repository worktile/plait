import { PlaitBoard, PlaitPointerType, Transforms, toPoint, transformPoint } from '@plait/core';
import { PlaitMindBoard } from './with-mind.board';
import { MindPointerType } from '../interfaces/pointer';
import { createMindElement, createRootMindElement, insertMindElement, transformNodeToRoot } from '../utils';

export const withCreateMind = (board: PlaitBoard) => {
    const newBoard = board as PlaitBoard & PlaitMindBoard;
    const { mousemove, mouseup } = board;
    let hasMindPointer = false;

    newBoard.mousemove = (event: MouseEvent) => {
        if (PlaitBoard.isPointer<MindPointerType | PlaitPointerType>(board, MindPointerType.mind)) {
            // draw
            hasMindPointer = true;
        }
        mousemove(event);
    };

    newBoard.mouseup = (event: MouseEvent) => {
        const movingPoint = PlaitBoard.getMovingPoint(board);
        if (movingPoint && hasMindPointer && PlaitBoard.isPointer<MindPointerType | PlaitPointerType>(board, MindPointerType.mind)) {
            const targetPoint = transformPoint(board, toPoint(movingPoint[0], movingPoint[1], PlaitBoard.getHost(board)));
            const newRoot = createRootMindElement(board, targetPoint);
            Transforms.insertNode(board, newRoot, [board.children.length]);
            // insert
        }
        hasMindPointer = false;
        mouseup(event);
    };

    return newBoard;
};

import {
    BoardTransforms,
    PlaitBoard,
    PlaitPointerType,
    createG,
    getSelectedElements,
    throttleRAF,
    toHostPoint,
    toViewBoxPoint
} from '@plait/core';
import { PlaitMindBoard } from './with-mind.board';
import { MindPointerType } from '../interfaces/pointer';
import { getRectangleByElement, getTopicRectangleByElement } from '../utils';
import { drawRoundRectangleByElement } from '../utils/draw/node-shape';
import { createEmptyMind } from '../utils/node/create-node';
import { MindElement } from '../interfaces';
import { BoardCreationMode, TextManage, isDndMode, isDrawingMode, setCreationMode } from '@plait/common';
import { MindTransforms } from '../transforms';

const DefaultHotkey = 'm';

export interface FakeCreateNodeRef {
    g: SVGGElement;
    nodeG: SVGGElement;
    textManage: TextManage;
}

export const withCreateMind = (board: PlaitBoard) => {
    const newBoard = board as PlaitBoard & PlaitMindBoard;
    const { keyDown, pointerDown, pointerMove, pointerUp } = board;
    let fakeCreateNodeRef: FakeCreateNodeRef | null = null;
    let emptyMind: MindElement | null = null;

    newBoard.pointerDown = (event: PointerEvent) => {
        const isMindPointer = PlaitBoard.isPointer<MindPointerType | PlaitPointerType>(board, MindPointerType.mind);
        let movingPoint = PlaitBoard.getMovingPointInBoard(board);
        if (!PlaitBoard.isReadonly(board) && movingPoint && isDrawingMode(board) && isMindPointer) {
            movingPoint = toViewBoxPoint(board, toHostPoint(board, movingPoint[0], movingPoint[1]));
            const emptyMind = createEmptyMind(newBoard, movingPoint);
            MindTransforms.insertMind(board as PlaitMindBoard, emptyMind);
            BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
            return;
        }
        pointerDown(event);
    };

    newBoard.pointerMove = (event: PointerEvent) => {
        if (PlaitBoard.isReadonly(board)) {
            pointerMove(event);
            return;
        }
        const isMindPointer = PlaitBoard.isPointer<MindPointerType | PlaitPointerType>(board, MindPointerType.mind);
        if (isDndMode(board) && isMindPointer) {
            throttleRAF(board, 'with-mind-create', () => {
                let movingPoint = PlaitBoard.getMovingPointInBoard(board);

                if (movingPoint) {
                    movingPoint = toViewBoxPoint(newBoard, toHostPoint(board, movingPoint[0], movingPoint[1]));
                    emptyMind = createEmptyMind(newBoard, movingPoint);
                    const nodeRectangle = getRectangleByElement(newBoard, emptyMind);
                    const nodeG = drawRoundRectangleByElement(board, nodeRectangle, emptyMind);
                    const topicRectangle = getTopicRectangleByElement(newBoard, nodeRectangle, emptyMind);
                    if (!fakeCreateNodeRef) {
                        const textManage = new TextManage(board, {
                            getRectangle: () => {
                                return topicRectangle;
                            }
                        });
                        textManage.draw(emptyMind!.data.topic);
                        fakeCreateNodeRef = {
                            g: createG(),
                            nodeG,
                            textManage
                        };
                        fakeCreateNodeRef.g.classList.add('root');
                        fakeCreateNodeRef.g.setAttribute('plait-mind-temporary', 'true');
                        PlaitBoard.getHost(board).append(fakeCreateNodeRef.g);
                        fakeCreateNodeRef.g.append(...[fakeCreateNodeRef.nodeG, textManage.g]);
                    } else {
                        fakeCreateNodeRef.textManage.updateRectangle(topicRectangle);
                        fakeCreateNodeRef.nodeG.remove();
                        fakeCreateNodeRef.nodeG = nodeG;
                        fakeCreateNodeRef.g.append(nodeG);
                        fakeCreateNodeRef.g.append(fakeCreateNodeRef.textManage.g);
                    }
                }
            });
        } else {
            destroy();
        }
        pointerMove(event);
    };

    newBoard.pointerUp = (event: PointerEvent) => {
        if (emptyMind) {
            MindTransforms.insertMind(board as PlaitMindBoard, emptyMind);
            BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
            emptyMind = null;
            destroy();
            return;
        }
        pointerUp(event);
    };

    board.keyDown = (event: KeyboardEvent) => {
        if (PlaitBoard.isReadonly(board) || getSelectedElements(board).length > 0) {
            keyDown(event);
            return;
        }
        if (event.key === DefaultHotkey && !PlaitBoard.isPointer(board, MindPointerType.mind)) {
            BoardTransforms.updatePointerType(board, MindPointerType.mind);
            setCreationMode(board, BoardCreationMode.drawing);
            event.preventDefault();
            return;
        }
        keyDown(event);
    };

    function destroy() {
        if (fakeCreateNodeRef) {
            fakeCreateNodeRef.textManage.destroy();
            fakeCreateNodeRef.g.remove();
            fakeCreateNodeRef = null;
        }
    }

    return newBoard;
};

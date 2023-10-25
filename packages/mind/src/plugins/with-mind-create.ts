import {
    BoardTransforms,
    PlaitBoard,
    PlaitPointerType,
    Transforms,
    addSelectedElement,
    clearSelectedElement,
    createG,
    getSelectedElements,
    throttleRAF,
    toPoint,
    transformPoint
} from '@plait/core';
import { PlaitMindBoard } from './with-mind.board';
import { MindPointerType } from '../interfaces/pointer';
import { getRectangleByElement, getTopicRectangleByElement } from '../utils';
import { drawRoundRectangleByElement } from '../utils/draw/node-shape';
import { NgZone } from '@angular/core';
import { TextManage } from '@plait/text';
import { createEmptyMind } from '../utils/node/create-node';
import { MindElement } from '../interfaces';
import { BoardCreationMode, isDndMode, isDrawingMode, setCreationMode } from '@plait/common';

const DefaultHotkey = 'm';

export interface FakeCreateNodeRef {
    g: SVGGElement;
    nodeG: SVGGElement;
    textManage: TextManage;
}

export const withCreateMind = (board: PlaitBoard) => {
    const newBoard = board as PlaitBoard & PlaitMindBoard;
    const { keydown, mousedown, mousemove, mouseup } = board;
    let fakeCreateNodeRef: FakeCreateNodeRef | null = null;
    let emptyMind: MindElement | null = null;

    newBoard.mousedown = (event: MouseEvent) => {
        const isMindPointer = PlaitBoard.isPointer<MindPointerType | PlaitPointerType>(board, MindPointerType.mind);
        let movingPoint = PlaitBoard.getMovingPointInBoard(board);
        if (movingPoint && isDrawingMode(board) && isMindPointer) {
            movingPoint = transformPoint(board, toPoint(movingPoint[0], movingPoint[1], PlaitBoard.getHost(board)));
            const emptyMind = createEmptyMind(newBoard, movingPoint);
            Transforms.insertNode(board, emptyMind, [board.children.length]);
            clearSelectedElement(board);
            addSelectedElement(board, emptyMind);
            BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
        }
        mousedown(event);
    };

    newBoard.mousemove = (event: MouseEvent) => {
        if (PlaitBoard.isReadonly(board)) {
            mousemove(event);
            return;
        }
        const isMindPointer = PlaitBoard.isPointer<MindPointerType | PlaitPointerType>(board, MindPointerType.mind);
        if (isDndMode(board) && isMindPointer) {
            throttleRAF(() => {
                let movingPoint = PlaitBoard.getMovingPointInBoard(board);

                if (movingPoint) {
                    movingPoint = transformPoint(newBoard, toPoint(movingPoint[0], movingPoint[1], PlaitBoard.getHost(board)));
                    emptyMind = createEmptyMind(newBoard, movingPoint);
                    const nodeRectangle = getRectangleByElement(newBoard, emptyMind);
                    const nodeG = drawRoundRectangleByElement(board, nodeRectangle, emptyMind);
                    const topicRectangle = getTopicRectangleByElement(newBoard, nodeRectangle, emptyMind);
                    if (!fakeCreateNodeRef) {
                        const textManage = new TextManage(board, PlaitBoard.getComponent(board).viewContainerRef, {
                            getRectangle: () => {
                                return topicRectangle;
                            }
                        });
                        PlaitBoard.getComponent(board)
                            .viewContainerRef.injector.get(NgZone)
                            .run(() => {
                                textManage.draw(emptyMind!.data.topic);
                            });
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
        mousemove(event);
    };

    newBoard.mouseup = (event: MouseEvent) => {
        if (emptyMind) {
            Transforms.insertNode(board, emptyMind, [board.children.length]);
            clearSelectedElement(board);
            addSelectedElement(board, emptyMind);
            BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
            emptyMind = null;
        }
        destroy();
        mouseup(event);
    };

    board.keydown = (event: KeyboardEvent) => {
        if (PlaitBoard.isReadonly(board) || getSelectedElements(board).length > 0) {
            keydown(event);
            return;
        }
        if (event.key === DefaultHotkey && !PlaitBoard.isPointer(board, MindPointerType.mind)) {
            BoardTransforms.updatePointerType(board, MindPointerType.mind);
            setCreationMode(board, BoardCreationMode.draw);
            event.preventDefault();
            return;
        }
        keydown(event);
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

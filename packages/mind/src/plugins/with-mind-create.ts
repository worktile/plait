import {
    BoardTransforms,
    BoardCreateMode,
    PlaitBoard,
    PlaitPointerType,
    Transforms,
    addSelectedElement,
    clearSelectedElement,
    createG,
    getCreateMode,
    getSelectedElements,
    throttleRAF,
    toPoint,
    transformPoint,
    setCreateMode,
    Point
} from '@plait/core';
import { PlaitMindBoard } from './with-mind.board';
import { MindPointerType } from '../interfaces/pointer';
import { NodeSpace, getRectangleByElement, getTopicRectangleByElement, temporaryDisableSelection } from '../utils';
import { drawRoundRectangleByElement } from '../utils/draw/node-shape';
import { NgZone } from '@angular/core';
import { TextManage } from '@plait/text';
import { createEmptyMind } from '../utils/node/create-node';
import { MindElement } from '../interfaces';

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
        const drawMode = getCreateMode(board) === BoardCreateMode.draw;
        const movingPoint = PlaitBoard.getMovingPointInBoard(board);
        const isMindPointer = PlaitBoard.isPointer<MindPointerType | PlaitPointerType>(board, MindPointerType.mind);
        if (drawMode && isMindPointer && movingPoint) {
            const targetPoint = getDefaultMindPoint(newBoard, movingPoint);
            const emptyMind = createEmptyMind(targetPoint);
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
        const dragMode = getCreateMode(board) === BoardCreateMode.drag;
        const isMindPointer = PlaitBoard.isPointer<MindPointerType | PlaitPointerType>(board, MindPointerType.mind);
        if (dragMode && isMindPointer) {
            throttleRAF(() => {
                const movingPoint = PlaitBoard.getMovingPointInBoard(board);
                if (movingPoint) {
                    const targetPoint = getDefaultMindPoint(newBoard, movingPoint);
                    emptyMind = createEmptyMind(targetPoint);
                    const nodeRectangle = getRectangleByElement(newBoard, targetPoint, emptyMind);
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
            setCreateMode(board, BoardCreateMode.draw);
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

function getDefaultMindPoint(board: PlaitMindBoard, point: Point) {
    const width = NodeSpace.getNodeWidth(board, createEmptyMind([0, 0]));
    const height = NodeSpace.getNodeHeight(board, createEmptyMind([0, 0]));
    return transformPoint(board, toPoint(point[0] - width / 2, point[1] - height / 2, PlaitBoard.getHost(board)));
}

import {
    BoardTransforms,
    PlaitBoard,
    PlaitPointerType,
    Transforms,
    throttleRAF,
    toPoint,
    transformPoint,
    updateForeignObject
} from '@plait/core';
import { PlaitMindBoard } from './with-mind.board';
import { MindPointerType } from '../interfaces/pointer';
import { getTopicRectangleByElement } from '../utils';
import { drawRoundRectangleByElement } from '../draw/node';
import { NodeSpace } from '../utils/space/node-space';
import { drawTopicByElement } from '../draw/topic';
import { ComponentRef } from '@angular/core';
import { PlaitRichtextComponent } from '@plait/richtext';
import { createEmptyMind } from '../utils/node/node-create';

export interface FakeCreateNodeRef {
    nodeG: SVGGElement;
    instanceRef: ComponentRef<PlaitRichtextComponent>;
    foreignObject: SVGForeignObjectElement;
    topicG: SVGGElement;
}

export const withCreateMind = (board: PlaitBoard) => {
    const newBoard = board as PlaitBoard & PlaitMindBoard;
    const { mousemove, mouseup } = board;
    let fakeCreateNodeRef: FakeCreateNodeRef | null = null;

    newBoard.mousemove = (event: MouseEvent) => {
        if (PlaitBoard.isReadonly(board)) {
            mousemove(event);
            return;
        }
        if (PlaitBoard.isPointer<MindPointerType | PlaitPointerType>(board, MindPointerType.mind)) {
            throttleRAF(() => {
                const movingPoint = PlaitBoard.getMovingPoint(board);
                if (movingPoint) {
                    const targetPoint = transformPoint(board, toPoint(movingPoint[0], movingPoint[1], PlaitBoard.getHost(board)));
                    const emptyMind = createEmptyMind(board, targetPoint);
                    const nodeRectangle = {
                        x: targetPoint[0],
                        y: targetPoint[1],
                        width: NodeSpace.getNodeWidth(newBoard, emptyMind),
                        height: NodeSpace.getNodeHeight(newBoard, emptyMind)
                    };
                    const nodeG = drawRoundRectangleByElement(board, nodeRectangle, emptyMind);
                    const topicRectangle = getTopicRectangleByElement(newBoard, nodeRectangle, emptyMind);
                    if (!fakeCreateNodeRef) {
                        const { richtextComponentRef, richtextG, foreignObject } = drawTopicByElement(newBoard, topicRectangle, emptyMind);
                        fakeCreateNodeRef = {
                            instanceRef: richtextComponentRef,
                            nodeG,
                            foreignObject,
                            topicG: richtextG
                        };
                        richtextComponentRef.changeDetectorRef.detectChanges();
                        PlaitBoard.getHost(board).append(...[fakeCreateNodeRef.nodeG, fakeCreateNodeRef.topicG]);
                    } else {
                        fakeCreateNodeRef.nodeG.remove();
                        fakeCreateNodeRef.nodeG = nodeG;
                        PlaitBoard.getHost(board).append(nodeG);
                        PlaitBoard.getHost(board).append(fakeCreateNodeRef.topicG);
                        updateForeignObject(
                            fakeCreateNodeRef.topicG,
                            topicRectangle.width,
                            topicRectangle.height,
                            topicRectangle.x,
                            topicRectangle.y
                        );
                    }
                }
            });
        } else {
            destroy();
        }
        mousemove(event);
    };

    newBoard.mouseup = (event: MouseEvent) => {
        const movingPoint = PlaitBoard.getMovingPoint(board);
        if (movingPoint && fakeCreateNodeRef && PlaitBoard.isPointer<MindPointerType | PlaitPointerType>(board, MindPointerType.mind)) {
            const targetPoint = transformPoint(board, toPoint(movingPoint[0], movingPoint[1], PlaitBoard.getHost(board)));
            const emptyMind = createEmptyMind(board, targetPoint);
            Transforms.insertNode(board, emptyMind, [board.children.length]);
            BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
        }
        destroy();
        mouseup(event);
    };

    function destroy() {
        if (fakeCreateNodeRef) {
            fakeCreateNodeRef.instanceRef.destroy();
            fakeCreateNodeRef.nodeG.remove();
            fakeCreateNodeRef.topicG.remove();
            fakeCreateNodeRef = null;
        }
    }

    return newBoard;
};

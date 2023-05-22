import {
    createG,
    distanceBetweenPointAndPoint,
    IS_TEXT_EDITABLE,
    Path,
    PlaitBoard,
    PlaitElement,
    Point,
    toPoint,
    transformPoint,
    Transforms,
    ELEMENT_TO_COMPONENT,
    getSelectedElements,
    depthFirstRecursion
} from '@plait/core';
import { AbstractNode, isStandardLayout } from '@plait/layouts';
import { MindElement, PlaitMind } from '../interfaces/element';
import { DetectResult } from '../interfaces/node';
import { MindNodeComponent } from '../node.component';
import { findUpElement } from '../utils';
import { hitMindElement } from '../utils/graph';
import { MindQueries } from '../queries';
import { PlaitMindComponent } from '../mind.component';
import {
    isDragging,
    readjustmentDropTarget,
    removeActiveOnDragOrigin,
    setIsDragging,
    updateAbstractInDnd,
    updatePathByLayoutAndDropTarget,
    updateRightNodeCount
} from '../utils/dnd/common';
import { detectDropTarget } from '../utils/dnd/detector';
import { drawFakeDragNode, drawFakeDropNode } from '../utils/dnd/draw';

const DRAG_MOVE_BUFFER = 5;

export const withDnd = (board: PlaitBoard) => {
    const { mousedown, mousemove, globalMouseup, keydown } = board;

    let activeElement: MindElement | null;
    let startPoint: Point;
    let dragFakeNodeG: SVGGElement | undefined;
    let fakeDropNodeG: SVGGElement | undefined;
    let dropTarget: { target: MindElement; detectResult: DetectResult } | null = null;

    board.mousedown = (event: MouseEvent) => {
        if (board.options.readonly || IS_TEXT_EDITABLE.get(board) || event.button === 2) {
            mousedown(event);
            return;
        }

        // 确认是否 hit 节点
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        const selectedElements = getSelectedElements(board);
        depthFirstRecursion((board as unknown) as MindElement, element => {
            if (activeElement) {
                return;
            }

            const isHitElement =
                hitMindElement(board, point, element) &&
                MindElement.isMindElement(board, element) &&
                !element.isRoot &&
                !AbstractNode.isAbstract(element);
            const isSelectMind = selectedElements.every(element => MindElement.isMindElement(board, element));
            const canDrag = isHitElement || (isHitElement && isSelectMind && selectedElements.includes(element));

            if (canDrag) {
                activeElement = element;
                startPoint = point;
            }
        });

        mousedown(event);
    };

    board.mousemove = (event: MouseEvent) => {
        if (!board.options.readonly && activeElement && startPoint) {
            const endPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            const distance = distanceBetweenPointAndPoint(startPoint[0], startPoint[1], endPoint[0], endPoint[1]);
            if (distance < DRAG_MOVE_BUFFER) {
                return;
            }

            setIsDragging(board, true);

            fakeDropNodeG?.remove();
            fakeDropNodeG = createG();
            const detectPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            dropTarget = detectDropTarget(board, detectPoint, dropTarget, activeElement);
            if (dropTarget?.target) {
                dropTarget = readjustmentDropTarget(board, dropTarget);
                drawFakeDropNode(board, dropTarget, fakeDropNodeG);
            }
            PlaitBoard.getHost(board).appendChild(fakeDropNodeG);

            const offsetX = endPoint[0] - startPoint[0];
            const offsetY = endPoint[1] - startPoint[1];
            dragFakeNodeG?.remove();
            const activeComponent = PlaitElement.getComponent(activeElement) as MindNodeComponent;
            dragFakeNodeG = drawFakeDragNode(board, activeComponent, offsetX, offsetY);
            PlaitBoard.getHost(board).appendChild(dragFakeNodeG);
        }

        mousemove(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        if (!board.options.readonly && activeElement) {
            if (dropTarget?.target) {
                const activeComponent = PlaitElement.getComponent(activeElement) as MindNodeComponent;
                const targetComponent = PlaitElement.getComponent(dropTarget.target) as MindNodeComponent;
                let targetPath = PlaitBoard.findPath(board, targetComponent.element);
                const mindElement = findUpElement(dropTarget.target).root;
                const mindComponent = ELEMENT_TO_COMPONENT.get(mindElement as PlaitMind) as PlaitMindComponent;
                const layout = MindQueries.getCorrectLayoutByElement(board, mindComponent?.root.origin as MindElement);
                targetPath = updatePathByLayoutAndDropTarget(targetPath, layout, dropTarget);
                const originPath = PlaitBoard.findPath(board, activeComponent.element);
                let newElement: Partial<MindElement> = { isCollapsed: false },
                    rightTargetPath = PlaitBoard.findPath(board, targetComponent.element);

                updateAbstractInDnd(board, [activeElement], targetPath);

                if (isStandardLayout(layout)) {
                    updateRightNodeCount(board, activeComponent, targetComponent, dropTarget.detectResult);
                }

                if (dropTarget.detectResult === 'right') {
                    if (targetComponent.node.origin.isRoot) {
                        targetPath = PlaitBoard.findPath(board, targetComponent.element);
                        targetPath.push(0);
                        const rightNodeCount = (targetComponent.node.origin.rightNodeCount as number) + 1;
                        newElement = { isCollapsed: false, rightNodeCount };
                    }
                    Transforms.setNode(board, newElement, rightTargetPath as Path);
                }

                Transforms.moveNode(board, originPath, targetPath);
            }

            if (isDragging(board)) {
                removeActiveOnDragOrigin(activeElement);
            }
            setIsDragging(board, false);
            activeElement = null;
            dragFakeNodeG?.remove();
            dragFakeNodeG = undefined;
            fakeDropNodeG?.remove();
            fakeDropNodeG = undefined;
            dropTarget = null;
        }
        globalMouseup(event);
    };

    board.keydown = (event: KeyboardEvent) => {
        keydown(event);
    };

    return board;
};

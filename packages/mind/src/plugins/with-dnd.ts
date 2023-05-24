import {
    distanceBetweenPointAndPoint,
    IS_TEXT_EDITABLE,
    Path,
    PlaitBoard,
    PlaitElement,
    Point,
    toPoint,
    transformPoint,
    Transforms,
    getSelectedElements,
    depthFirstRecursion
} from '@plait/core';
import { AbstractNode, isStandardLayout } from '@plait/layouts';
import { MindElement } from '../interfaces/element';
import { DetectResult } from '../interfaces/node';
import { MindNodeComponent } from '../node.component';
import { findUpElement } from '../utils';
import { isHitMindElement } from '../utils/position/node';
import { MindQueries } from '../queries';
import { isDragging, removeActiveOnDragOrigin, setIsDragging, updateAbstractInDnd, updateRightNodeCount } from '../utils/dnd/common';
import { detectDropTarget, readjustmentDropTarget, getPathByDropTarget } from '../utils/dnd/detector';
import { drawFakeDragNode, drawFakeDropNodeByPath } from '../utils/dnd/draw';

const DRAG_MOVE_BUFFER = 5;

export const withDnd = (board: PlaitBoard) => {
    const { mousedown, mousemove, globalMouseup, keydown } = board;

    let activeElement: MindElement | null;
    let startPoint: Point;
    let dragFakeNodeG: SVGGElement | undefined;
    let fakeDropNodeG: SVGGElement | undefined;
    let dropTarget: { target: MindElement; detectResult: DetectResult } | null = null;
    let targetPath: Path;

    board.mousedown = (event: MouseEvent) => {
        if (board.options.readonly || IS_TEXT_EDITABLE.get(board) || event.button === 2) {
            mousedown(event);
            return;
        }

        // 确认是否 hit 节点
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        const selectedElements = getSelectedElements(board);
        depthFirstRecursion(
            (board as unknown) as MindElement,
            element => {
                if (activeElement || !MindElement.isMindElement(board, element)) {
                    return;
                }
                const isHitElement = isHitMindElement(board, point, element);
                const isAllMindElement = selectedElements.every(element => MindElement.isMindElement(board, element));
                const isMultiple = isHitElement && selectedElements.includes(element) && isAllMindElement;
                const isSingle =
                    isHitElement &&
                    !element.isRoot &&
                    !AbstractNode.isAbstract(element) &&
                    !(selectedElements.length > 1 && selectedElements.includes(element));

                if (isSingle) {
                    activeElement = element;
                    startPoint = point;
                } else if (isMultiple) {
                    //
                }
            },
            node => {
                if (PlaitBoard.isBoard(node) || board.isRecursion(node)) {
                    return true;
                } else {
                    return false;
                }
            }
        );

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
            const detectPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            dropTarget = detectDropTarget(board, detectPoint, dropTarget, activeElement);
            if (dropTarget?.target) {
                targetPath = getPathByDropTarget(board, dropTarget);

                dropTarget = readjustmentDropTarget(board, dropTarget);
                fakeDropNodeG = drawFakeDropNodeByPath(board, targetPath);
                PlaitBoard.getHost(board).appendChild(fakeDropNodeG);
            }

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
                const mindElement = findUpElement(dropTarget.target).root;
                const layout = MindQueries.getCorrectLayoutByElement(board, mindElement);
                const originPath = PlaitBoard.findPath(board, activeElement);
                let newElement: Partial<MindElement> = { isCollapsed: false },
                    rightTargetPath = PlaitBoard.findPath(board, dropTarget.target);

                updateAbstractInDnd(board, [activeElement], targetPath);

                if (isStandardLayout(layout)) {
                    updateRightNodeCount(board, activeComponent, targetComponent, dropTarget.detectResult);
                }

                if (dropTarget.detectResult === 'right') {
                    if (targetComponent.node.origin.isRoot) {
                        targetPath = PlaitBoard.findPath(board, targetComponent.element);
                        targetPath.push(0);
                        const rightNodeCount = targetComponent.node.origin.rightNodeCount! + 1;
                        newElement = { isCollapsed: false, rightNodeCount };
                    }
                    Transforms.setNode(board, newElement, rightTargetPath);
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

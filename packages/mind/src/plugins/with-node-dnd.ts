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
    depthFirstRecursion,
    createG
} from '@plait/core';
import { AbstractNode } from '@plait/layouts';
import { MindElement } from '../interfaces/element';
import { DetectResult } from '../interfaces/node';
import { MindNodeComponent } from '../node.component';
import { changeRightNodeCount, getFirstLevelElement, shouldChangeRightNodeCount } from '../utils';
import { isHitMindElement } from '../utils/position/node';
import { isDragging, removeActiveOnDragOrigin, setIsDragging, updateAbstractInDnd } from '../utils/dnd/common';
import { detectDropTarget, getPathByDropTarget } from '../utils/dnd/detector';
import { drawFakeDragNode, drawFakeDropNodeByPath } from '../utils/dnd/draw';
import { deleteSelectedELements } from '@plait/mind';

const DRAG_MOVE_BUFFER = 5;

export const withDnd = (board: PlaitBoard) => {
    const { mousedown, mousemove, globalMouseup, keydown } = board;

    let activeElements: MindElement[] = [];
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
                if (activeElements.length || !MindElement.isMindElement(board, element)) {
                    return;
                }
                const isHitElement = isHitMindElement(board, point, element) && !element.isRoot && !AbstractNode.isAbstract(element);
                const isAllMindElement = selectedElements.every(element => MindElement.isMindElement(board, element));
                const isMultiple = isHitElement && selectedElements.length > 1 && selectedElements.includes(element) && isAllMindElement;
                const isSingle = isHitElement && !(selectedElements.length > 1 && selectedElements.includes(element));

                if (isSingle) {
                    activeElements = [element];
                    startPoint = point;
                } else if (isMultiple) {
                    activeElements = getFirstLevelElement(selectedElements as MindElement[]);
                    startPoint = point;
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
        if (!board.options.readonly && activeElements?.length && startPoint) {
            const endPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            const distance = distanceBetweenPointAndPoint(startPoint[0], startPoint[1], endPoint[0], endPoint[1]);
            if (distance < DRAG_MOVE_BUFFER) {
                return;
            }

            setIsDragging(board, true);

            fakeDropNodeG?.remove();
            const detectPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            dropTarget = detectDropTarget(board, detectPoint, dropTarget, activeElements);
            if (dropTarget?.target) {
                targetPath = getPathByDropTarget(board, dropTarget);

                fakeDropNodeG = drawFakeDropNodeByPath(board, dropTarget.target, targetPath);
                PlaitBoard.getHost(board).appendChild(fakeDropNodeG);
            }

            const offsetX = endPoint[0] - startPoint[0];
            const offsetY = endPoint[1] - startPoint[1];
            dragFakeNodeG?.remove();
            dragFakeNodeG = createG();
            activeElements.forEach(element => {
                const activeComponent = PlaitElement.getComponent(element) as MindNodeComponent;
                const nodeG = drawFakeDragNode(board, activeComponent, offsetX, offsetY);
                dragFakeNodeG?.appendChild(nodeG);
            });
            PlaitBoard.getHost(board).appendChild(dragFakeNodeG);
        }

        mousemove(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        if (!board.options.readonly && activeElements?.length) {
            if (dropTarget?.target) {
                const ref = board.pathRef(targetPath);
                const targetElementPath = PlaitBoard.findPath(board, dropTarget?.target);

                deleteSelectedELements(board, activeElements);

                activeElements.forEach(activeElement => {
                    updateAbstractInDnd(board, [activeElement], ref.current!);

                    Transforms.insertNode(board, activeElement, ref.current!);
                });

                const shouldChangeRoot =
                    shouldChangeRightNodeCount(dropTarget?.target) &&
                    (Path.isSibling(targetPath, targetElementPath) || Path.equals(targetPath, targetElementPath));
                if (shouldChangeRoot) {
                    changeRightNodeCount(board, targetElementPath.slice(0, 1), activeElements.length);
                }

                if (Path.isAncestor(targetElementPath, targetPath)) {
                    Transforms.setNode(board, { isCollapsed: false }, targetElementPath);
                }
            }

            if (isDragging(board)) {
                removeActiveOnDragOrigin(activeElements[0]);
            }

            setIsDragging(board, false);
            activeElements = [];
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

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
    createG,
    isSelectedElement,
    PlaitNode
} from '@plait/core';
import { AbstractNode, getNonAbstractChildren } from '@plait/layouts';
import { MindElement } from '../interfaces/element';
import { DetectResult } from '../interfaces/node';
import { MindNodeComponent } from '../node.component';
import {
    changeRightNodeCount,
    deleteElementHandleAbstract,
    getFirstLevelElement,
    getOverallAbstracts,
    getValidAbstractRefs,
    insertElementHandleAbstract,
    isInRightBranchOfStandardLayout
} from '../utils';
import { isHitMindElement } from '../utils/position/node';
import { addActiveOnDragOrigin, isDragging, removeActiveOnDragOrigin, setIsDragging } from '../utils/dnd/common';
import { detectDropTarget, getPathByDropTarget } from '../utils/dnd/detector';
import { drawFakeDragNode, drawFakeDropNodeByPath } from '../utils/dnd/draw';
import { MindTransforms } from '../transforms';
import { adjustAbstractToNode } from '../utils/node/adjust-node';

const DRAG_MOVE_BUFFER = 5;

export const withDnd = (board: PlaitBoard) => {
    const { mousedown, mousemove, globalMouseup } = board;

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
                if (activeElements.length) {
                    const abstracts = getOverallAbstracts(board, activeElements);
                    activeElements.push(...abstracts);
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
                addActiveOnDragOrigin(element);
                if (isSelectedElement(board, element)) {
                    const activeComponent = PlaitElement.getComponent(element) as MindNodeComponent;
                    const nodeG = drawFakeDragNode(board, activeComponent, offsetX, offsetY);
                    dragFakeNodeG?.appendChild(nodeG);
                }
            });
            PlaitBoard.getHost(board).appendChild(dragFakeNodeG);
        }

        mousemove(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        if (!board.options.readonly && activeElements?.length) {
            if (isDragging(board)) {
                activeElements.forEach(element => removeActiveOnDragOrigin(element));
            }
            if (dropTarget) {
                const targetPathRef = board.pathRef(targetPath);
                const targetElementPathRef = board.pathRef(PlaitBoard.findPath(board, dropTarget.target));
                const abstractRefs = getValidAbstractRefs(board, activeElements);
                const newActiveElements = [...activeElements]
                    .filter(element => !abstractRefs.some(refs => refs.abstract === element))
                    .map(element => {
                        if (AbstractNode.isAbstract(element)) {
                            return adjustAbstractToNode(element);
                        }
                        return element;
                    });

                const abstractProperty = deleteElementHandleAbstract(board, activeElements);
                insertElementHandleAbstract(board, targetPath, newActiveElements.length, false, abstractProperty);
                MindTransforms.setAbstractsByRefs(board, abstractProperty);

                MindTransforms.removeElements(board, activeElements);

                //处理 targetPathRef.current 没有的情况
                let insertPath = targetPathRef.current;
                const parentPath = Path.parent(targetPathRef.current || targetPath);
                if (!insertPath) {
                    const parent = PlaitNode.get(board, parentPath);
                    const children = getNonAbstractChildren(parent);
                    insertPath = [...parentPath, children.length || 0];
                }

                MindTransforms.insertNodes(board, newActiveElements, insertPath);

                if (abstractRefs.length) {
                    MindTransforms.insertAbstractNodes(board, abstractRefs, newActiveElements, insertPath);
                }

                const shouldChangeRoot =
                    isInRightBranchOfStandardLayout(dropTarget?.target) &&
                    targetElementPathRef.current &&
                    (Path.isSibling(targetPath, targetElementPathRef.current) || Path.equals(targetPath, targetElementPathRef.current));
                if (shouldChangeRoot && targetElementPathRef.current) {
                    changeRightNodeCount(board, targetElementPathRef.current.slice(0, 1), newActiveElements.length);
                }

                if (
                    targetElementPathRef.current &&
                    targetPathRef.current &&
                    Path.isAncestor(targetElementPathRef.current, targetPathRef.current) &&
                    dropTarget.target.isCollapsed
                ) {
                    Transforms.setNode(board, { isCollapsed: false }, targetElementPathRef.current);
                }
                targetElementPathRef.unref();
                targetPathRef.unref();

                Transforms.setSelectionWithTemporaryElements(board, newActiveElements);
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

    return board;
};

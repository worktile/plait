import {
    distanceBetweenPointAndPoint,
    IS_TEXT_EDITABLE,
    Path,
    PlaitBoard,
    Point,
    toPoint,
    transformPoint,
    Transforms,
    getSelectedElements,
    depthFirstRecursion,
    createG,
    PlaitNode,
    PlaitPointerType,
    getHitElements,
    PlaitElement
} from '@plait/core';
import { AbstractNode, getNonAbstractChildren } from '@plait/layouts';
import { MindElement, PlaitMind } from '../interfaces/element';
import { DetectResult } from '../interfaces/node';

import {
    deleteElementHandleAbstract,
    deleteElementsHandleRightNodeCount,
    getCorrespondingAbstract,
    getFirstLevelElement,
    getOverallAbstracts,
    getValidAbstractRefs,
    insertElementHandleAbstract,
    insertElementHandleRightNodeCount
} from '../utils';
import { addActiveOnDragOrigin, isDragging, isDropStandardRight, removeActiveOnDragOrigin, setIsDragging } from '../utils/dnd/common';
import { detectDropTarget, getPathByDropTarget } from '../utils/dnd/detector';
import { drawFakeDragNode, drawFakeDropNode } from '../utils/draw/node-dnd';
import { MindTransforms } from '../transforms';
import { adjustAbstractToNode, adjustRootToNode } from '../utils/node/adjust-node';

const DRAG_MOVE_BUFFER = 5;

export const withNodeDnd = (board: PlaitBoard) => {
    const { mousedown, mousemove, globalMouseup } = board;

    let activeElements: MindElement[] = [];
    let correspondingElements: MindElement[] = [];
    let startPoint: Point;
    let dragFakeNodeG: SVGGElement | undefined;
    let fakeDropNodeG: SVGGElement | undefined;
    let dropTarget: { target: MindElement; detectResult: DetectResult } | null = null;
    let targetPath: Path;

    board.mousedown = (event: MouseEvent) => {
        if (
            PlaitBoard.isReadonly(board) ||
            PlaitBoard.hasBeenTextEditing(board) ||
            !PlaitBoard.isPointer(board, PlaitPointerType.selection) ||
            event.button === 2
        ) {
            mousedown(event);
            return;
        }

        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        const selectedElements = getSelectedElements(board);
        const hitTarget = getHitElements(board, { ranges: [{ anchor: point, focus: point }] }, (element: PlaitElement) => {
            return MindElement.isMindElement(board, element);
        });

        const targetElement = hitTarget && hitTarget.length === 1 ? hitTarget[0] : null;
        if (
            targetElement &&
            MindElement.isMindElement(board, targetElement) &&
            !targetElement.isRoot &&
            !AbstractNode.isAbstract(targetElement)
        ) {
            const targetElements = selectedElements.filter(
                element => MindElement.isMindElement(board, element) && !element.isRoot && !AbstractNode.isAbstract(element)
            ) as MindElement[];
            const isMultiple = selectedElements.length > 0 && selectedElements.includes(targetElement);
            const isSingle = !isMultiple && selectedElements.length === 0;
            if (isMultiple) {
                activeElements = targetElements;
                startPoint = point;
            } else if (isSingle) {
                activeElements = [targetElement];
                startPoint = point;
            }
            event.preventDefault();
        }

        if (activeElements.length) {
            correspondingElements = getOverallAbstracts(board, activeElements);
            event.preventDefault();
        }

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
            dropTarget = detectDropTarget(board, detectPoint, dropTarget, [...activeElements, ...correspondingElements]);
            if (dropTarget?.target) {
                targetPath = getPathByDropTarget(board, dropTarget);

                fakeDropNodeG = drawFakeDropNode(board, dropTarget, targetPath);
                PlaitBoard.getHost(board).appendChild(fakeDropNodeG);
            }

            const offsetX = endPoint[0] - startPoint[0];
            const offsetY = endPoint[1] - startPoint[1];
            dragFakeNodeG?.remove();
            dragFakeNodeG = createG();
            [...activeElements, ...correspondingElements].forEach(element => {
                addActiveOnDragOrigin(element);
            });
            activeElements.forEach(element => {
                const nodeG = drawFakeDragNode(board, element, offsetX, offsetY);
                dragFakeNodeG?.appendChild(nodeG);
            });

            PlaitBoard.getHost(board).appendChild(dragFakeNodeG);
        }

        mousemove(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        const firstLevelElements = getFirstLevelElement(activeElements);
        if (!board.options.readonly && firstLevelElements.length) {
            firstLevelElements.push(...correspondingElements);
            if (isDragging(board)) {
                firstLevelElements.forEach(element => {
                    removeActiveOnDragOrigin(element);
                });
            }
            if (dropTarget) {
                const targetPathRef = board.pathRef(targetPath);
                const targetElementPathRef = board.pathRef(PlaitBoard.findPath(board, dropTarget.target));
                let abstractRefs = getValidAbstractRefs(board, firstLevelElements);
                const normalElements = firstLevelElements
                    .filter(element => !abstractRefs.some(refs => refs.abstract === element))
                    .map(element => {
                        if (AbstractNode.isAbstract(element)) {
                            return adjustAbstractToNode(element);
                        }
                        return element;
                    });

                const hasPreviousNode = targetPath[targetPath.length - 1] !== 0;
                if (hasPreviousNode) {
                    const previousElement = PlaitNode.get(board, Path.previous(targetPath)) as MindElement;
                    const correspondingAbstract = getCorrespondingAbstract(previousElement);
                    const targetHasCorrespondAbstract =
                        correspondingAbstract && correspondingAbstract.end !== targetPath[targetPath.length - 1] - 1;
                    if (targetHasCorrespondAbstract) {
                        const adjustedNode = abstractRefs.map(ref => {
                            return adjustAbstractToNode(ref.abstract);
                        });
                        normalElements.push(...adjustedNode);
                        abstractRefs = [];
                    }
                }

                const effectedAbstracts = deleteElementHandleAbstract(board, firstLevelElements);
                insertElementHandleAbstract(board, targetPath, normalElements.length, false, effectedAbstracts);
                MindTransforms.setAbstractsByRefs(board, effectedAbstracts);

                let refs = deleteElementsHandleRightNodeCount(board, firstLevelElements);
                const parent = PlaitNode.get(board, Path.parent(targetPath)) as MindElement;
                const shouldChangeRoot = isDropStandardRight(parent, dropTarget);
                if (shouldChangeRoot && targetElementPathRef.current) {
                    refs = insertElementHandleRightNodeCount(board, targetElementPathRef.current.slice(0, 1), normalElements.length, refs);
                }

                MindTransforms.setRightNodeCountByRefs(board, refs);
                MindTransforms.removeElements(board, firstLevelElements);

                let insertPath = targetPathRef.current;
                const parentPath = Path.parent(targetPathRef.current || targetPath);
                if (!insertPath) {
                    const parent = PlaitNode.get(board, parentPath);
                    const children = getNonAbstractChildren(parent);
                    insertPath = [...parentPath, children.length || 0];
                }

                MindTransforms.insertNodes(board, normalElements, insertPath);

                if (abstractRefs.length) {
                    MindTransforms.insertAbstractNodes(board, abstractRefs, normalElements, insertPath);
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

                let setActiveElements: MindElement[] = [];
                depthFirstRecursion((board as unknown) as MindElement, node => {
                    const isSelected = activeElements.some(element => element.id === node.id);
                    if (isSelected) {
                        setActiveElements.push(node);
                    }
                });

                Transforms.setSelectionWithTemporaryElements(board, setActiveElements);
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

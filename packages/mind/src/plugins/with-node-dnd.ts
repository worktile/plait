import {
    distanceBetweenPointAndPoint,
    Path,
    PlaitBoard,
    Point,
    Transforms,
    getSelectedElements,
    depthFirstRecursion,
    createG,
    PlaitNode,
    PlaitPointerType,
    isMainPointer,
    CoreTransforms,
    getHitElementByPoint,
    toHostPoint,
    toViewBoxPoint
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
import { adjustAbstractToNode } from '../utils/node/adjust-node';

const DRAG_MOVE_BUFFER = 5;

export const withNodeDnd = (board: PlaitBoard) => {
    const { pointerDown, pointerMove, globalPointerUp } = board;

    let activeElements: MindElement[] = [];
    let correspondingElements: MindElement[] = [];
    let startPoint: Point;
    let dragFakeNodeG: SVGGElement | undefined;
    let fakeDropNodeG: SVGGElement | undefined;
    let dropTarget: { target: MindElement; detectResult: DetectResult } | null = null;
    let targetPath: Path;

    board.pointerDown = (event: PointerEvent) => {
        if (
            PlaitBoard.isReadonly(board) ||
            PlaitBoard.hasBeenTextEditing(board) ||
            !PlaitBoard.isPointer(board, PlaitPointerType.selection) ||
            !isMainPointer(event)
        ) {
            pointerDown(event);
            return;
        }
        const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        const selectedElements = getSelectedElements(board);
        const hitElement = getHitElementByPoint(board, point);
        if (
            hitElement &&
            MindElement.isMindElement(board, hitElement) &&
            !PlaitMind.isMind(hitElement) &&
            !AbstractNode.isAbstract(hitElement)
        ) {
            const targetElements = selectedElements.filter(
                element => MindElement.isMindElement(board, element) && !element.isRoot && !AbstractNode.isAbstract(element)
            ) as MindElement[];
            const isMultiple = selectedElements.length > 0 && selectedElements.includes(hitElement);
            if (isMultiple) {
                activeElements = targetElements;
                startPoint = point;
            } else {
                activeElements = [hitElement];
                startPoint = point;
            }
        }

        if (activeElements.length) {
            correspondingElements = getOverallAbstracts(board, activeElements);
        }

        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        if (!board.options.readonly && activeElements.length && startPoint) {
            const endPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            const distance = distanceBetweenPointAndPoint(startPoint[0], startPoint[1], endPoint[0], endPoint[1]);
            if (distance < DRAG_MOVE_BUFFER) {
                return;
            }

            setIsDragging(board, true);

            fakeDropNodeG?.remove();
            const detectPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
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

        pointerMove(event);
    };

    board.globalPointerUp = (event: PointerEvent) => {
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
                const targetPreviousPathRef = Path.hasPrevious(targetPath) && board.pathRef(Path.previous(targetPath));
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
                CoreTransforms.removeElements(board, firstLevelElements);

                let insertPath = targetPathRef.current;
                const parentPath = Path.parent(targetPathRef.current || targetPath);
                if (!insertPath) {
                    // When the insertion position and the selected node position are the same, the recorded previousPath is used
                    const previousPath = targetPreviousPathRef && targetPreviousPathRef.unref();
                    if (previousPath) {
                        insertPath = Path.next(previousPath);
                    } else {
                        const parent = PlaitNode.get(board, parentPath);
                        const children = getNonAbstractChildren(parent);
                        insertPath = [...parentPath, children.length || 0];
                    }
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

                Transforms.addSelectionWithTemporaryElements(board, setActiveElements);
            }

            setIsDragging(board, false);
            activeElements = [];
            dragFakeNodeG?.remove();
            dragFakeNodeG = undefined;
            fakeDropNodeG?.remove();
            fakeDropNodeG = undefined;
            dropTarget = null;
        }
        globalPointerUp(event);
    };

    return board;
};

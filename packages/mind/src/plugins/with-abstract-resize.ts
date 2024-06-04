import {
    BOARD_TO_HOST,
    PlaitBoard,
    PlaitElement,
    PlaitPlugin,
    Point,
    Transforms,
    getSelectedElements,
    isMainPointer,
    toHostPoint,
    toViewBoxPoint
} from '@plait/core';
import { AbstractNode, LayoutNode, MindLayoutType, isHorizontalLayout, isStandardLayout } from '@plait/layouts';
import { MindElement } from '../interfaces';
import { findLocationLeftIndex, getHitAbstractHandle, getLocationScope, handleTouchedAbstract } from '../utils/abstract/resize';
import { separateChildren } from '../utils/abstract/common';
import { AbstractHandlePosition, AbstractResizeState, PlaitAbstractBoard } from './with-abstract-resize.board';
import { MindQueries } from '../queries';
import { PlaitCommonElementRef } from '@plait/common';
import { NodeActiveGenerator } from '../generators/node-active.generator';

export const withAbstract: PlaitPlugin = (board: PlaitBoard) => {
    const newBoard = board as PlaitBoard & PlaitAbstractBoard;

    const { pointerDown, pointerMove, pointerUp } = board;
    let activeAbstractElement: MindElement | undefined;
    let abstractHandlePosition: AbstractHandlePosition | undefined;
    let touchedAbstract: MindElement | undefined;
    let startPoint: Point | undefined;
    let newProperty: { end: number } | { start: number } | undefined;

    board.pointerDown = (event: PointerEvent) => {
        if (!isMainPointer(event) || PlaitBoard.isReadonly(board)) {
            pointerDown(event);
            return;
        }

        const activeAbstractElements = getSelectedElements(board).filter(element => AbstractNode.isAbstract(element)) as MindElement[];
        const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));

        activeAbstractElement = activeAbstractElements.find(element => {
            abstractHandlePosition = getHitAbstractHandle(board, element as MindElement, point);
            return abstractHandlePosition;
        });

        if (activeAbstractElement) {
            if (newBoard?.onAbstractResize) {
                newBoard.onAbstractResize(AbstractResizeState.start);
            }
            startPoint = point;
            return;
        }

        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        getSelectedElements(board);
        const host = BOARD_TO_HOST.get(board);
        const endPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));

        touchedAbstract = handleTouchedAbstract(board, touchedAbstract, endPoint);

        if (abstractHandlePosition && activeAbstractElement) {
            const nodeLayout = MindQueries.getCorrectLayoutByElement(board, activeAbstractElement as MindElement) as MindLayoutType;
            const isHorizontal = isHorizontalLayout(nodeLayout);
            const parentElement = MindElement.getParent(activeAbstractElement);

            let children = parentElement.children;

            const parentLayout = MindQueries.getLayoutByElement(parentElement);
            if (isStandardLayout(parentLayout)) {
                const rightNodeCount = parentElement.rightNodeCount!;
                const { leftChildren, rightChildren } = separateChildren(parentElement);
                if ((activeAbstractElement as MindElement).end! < rightNodeCount) {
                    children = rightChildren;
                }
                if ((activeAbstractElement as MindElement).start! >= rightNodeCount) {
                    children = leftChildren;
                }
            }

            if (newBoard?.onAbstractResize) {
                newBoard.onAbstractResize(AbstractResizeState.resizing);
            }

            const resizingLocation = isHorizontal ? endPoint[1] : endPoint[0];
            const parent = (MindElement.getNode(parentElement) as unknown) as LayoutNode;
            const scope = getLocationScope(board, abstractHandlePosition, children, activeAbstractElement, parent, isHorizontal);
            const location = Math.min(scope.max, Math.max(scope.min, resizingLocation));

            let locationIndex = findLocationLeftIndex(board, children, location, isHorizontal);

            const isPropertyUnchanged =
                (abstractHandlePosition === AbstractHandlePosition.start &&
                    locationIndex + 1 === (activeAbstractElement as MindElement).start!) ||
                (abstractHandlePosition === AbstractHandlePosition.end && locationIndex === (activeAbstractElement as MindElement).end!);

            if (isPropertyUnchanged) {
                newProperty = undefined;
            } else {
                if (isStandardLayout(parent.layout)) {
                    const rightNodeCount = parent.origin.rightNodeCount;
                    let start = activeAbstractElement.start!;
                    if (start >= rightNodeCount) {
                        locationIndex += rightNodeCount;
                    }
                }

                newProperty =
                    abstractHandlePosition === AbstractHandlePosition.start ? { start: locationIndex + 1 } : { end: locationIndex };
            }

            const ref = PlaitElement.getElementRef<PlaitCommonElementRef>(activeAbstractElement);
            const activeGenerator = ref.getGenerator<NodeActiveGenerator>(NodeActiveGenerator.key);
            activeGenerator.updateAbstractOutline(activeAbstractElement, abstractHandlePosition, location);
        }
        pointerMove(event);
    };

    board.pointerUp = (event: PointerEvent) => {
        startPoint = undefined;
        abstractHandlePosition = undefined;
        if (activeAbstractElement) {
            if (newBoard?.onAbstractResize) {
                newBoard.onAbstractResize(AbstractResizeState.end);
            }

            if (newProperty) {
                const path = PlaitBoard.findPath(board, activeAbstractElement);
                Transforms.setNode(board, newProperty, path);
            } else {
                const ref = PlaitElement.getElementRef<PlaitCommonElementRef>(activeAbstractElement);
                const activeGenerator = ref.getGenerator<NodeActiveGenerator>(NodeActiveGenerator.key);
                activeGenerator.updateAbstractOutline(activeAbstractElement);
            }
            activeAbstractElement = undefined;
        }
        pointerUp(event);
    };
    return board;
};

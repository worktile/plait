import {
    PlaitBoard,
    PlaitPluginElementContext,
    RectangleClient,
    Transforms,
    Selection,
    depthFirstRecursion,
    PlaitElement,
    getIsRecursionFunc,
    Point,
    toHostPoint,
    toViewBoxPoint
} from '@plait/core';
import { MindElement, PlaitMind } from '../interfaces';
import { PlaitMindComponent } from '../mind.component';
import { MindNodeComponent } from '../mind-node.component';
import { getRectangleByNode, isHitMindElement } from '../utils/position/node';
import { withNodeDnd } from './with-node-dnd';
import { editTopic } from '../utils/node/common';
import { withAbstract } from './with-abstract-resize';
import { withMindExtend } from './with-mind-extend';
import { withCreateMind } from './with-mind-create';
import { withMindHotkey } from './with-mind-hotkey';
import { withNodeHoverHitTest } from './with-node-hover-hit-test';
import { withNodeImage } from './with-node-image';
import { PlaitMindBoard } from './with-mind.board';
import { withNodeResize } from './with-node-resize';
import { withNodeImageResize } from './with-node-image-resize';
import { withMindFragment } from './with-mind-fragment';
import { withEmoji } from '../emoji/with-emoji';

export const withMind = (baseBoard: PlaitBoard) => {
    const board = baseBoard as PlaitBoard & PlaitMindBoard;
    const {
        drawElement,
        dblClick,
        isRectangleHit,
        isHit,
        getRectangle,
        isMovable,
        isRecursion,
        isAlign,
        isImageBindingAllowed,
        canAddToGroup,
        canSetZIndex,
        isExpanded
    } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        if (PlaitMind.isMind(context.element)) {
            return PlaitMindComponent;
        } else if (MindElement.isMindElement(board, context.element)) {
            return MindNodeComponent;
        }
        return drawElement(context);
    };

    board.applyTheme = (element: PlaitElement) => {
        const mindElement = element as MindElement;
        const shouldClearProperty =
            !PlaitBoard.isBoard(element) && (mindElement?.branchColor || mindElement?.fill || mindElement?.strokeColor);
        if (PlaitMind.isMind(element) && shouldClearProperty) {
            const path = PlaitBoard.findPath(board, element);
            Transforms.setNode(board, { fill: null, strokeColor: null, branchColor: null }, path);
        }
    };

    board.getRectangle = element => {
        if (!PlaitElement.hasMounted(element)) {
            console.error('mind element has not been mounted');
        }
        if (MindElement.isMindElement(board, element)) {
            return getRectangleByNode(MindElement.getNode(element));
        }
        return getRectangle(element);
    };

    board.canAddToGroup = (element: PlaitElement) => {
        if (MindElement.isMindElement(board, element) && !element.isRoot) {
            return false;
        }
        return canAddToGroup(element);
    };

    board.canSetZIndex = (element: PlaitElement) => {
        if (MindElement.isMindElement(board, element) && !element.isRoot) {
            return false;
        }
        return canSetZIndex(element);
    };

    board.isRecursion = element => {
        if (MindElement.isMindElement(board, element) && element.isCollapsed) {
            return false;
        }
        return isRecursion(element);
    };

    board.isRectangleHit = (element, selection: Selection) => {
        if (MindElement.isMindElement(board, element)) {
            const client = getRectangleByNode(MindElement.getNode(element));
            const isHit = RectangleClient.isHit(RectangleClient.getRectangleByPoints([selection.anchor, selection.focus]), client);
            return isHit;
        }
        return isRectangleHit(element, selection);
    };

    board.isHit = (element, point: Point) => {
        if (MindElement.isMindElement(board, element)) {
            const client = getRectangleByNode(MindElement.getNode(element));
            const isHit = RectangleClient.isHit(RectangleClient.getRectangleByPoints([point, point]), client);
            return isHit;
        }
        return isHit(element, point);
    };

    board.isMovable = element => {
        if (PlaitMind.isMind(element) && element.isRoot) {
            return true;
        }
        return isMovable(element);
    };

    board.isImageBindingAllowed = element => {
        if (MindElement.isMindElement(board, element)) {
            return true;
        }
        return isImageBindingAllowed(element);
    };

    board.isAlign = (element: PlaitElement) => {
        if (PlaitMind.isMind(element) && element.isRoot) {
            return true;
        }
        return isAlign(element);
    };

    board.isExpanded = (element: PlaitElement) => {
        if (MindElement.isMindElement(board, element) && !PlaitMind.isMind(element)) {
            return !element.isCollapsed;
        }
        return isExpanded(element);
    };

    board.dblClick = (event: MouseEvent) => {
        if (PlaitBoard.isReadonly(board)) {
            dblClick(event);
            return;
        }
        const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        board.children
            .filter(value => PlaitMind.isMind(value))
            .forEach(mindMap => {
                depthFirstRecursion<MindElement>(
                    mindMap as MindElement,
                    node => {
                        if (!PlaitBoard.hasBeenTextEditing(board) && isHitMindElement(board, point, node)) {
                            editTopic(node);
                        }
                    },
                    getIsRecursionFunc(board)
                );
            });
        if (PlaitBoard.hasBeenTextEditing(board)) {
            return;
        }
        dblClick(event);
    };

    return withEmoji(
        withNodeResize(
            withNodeImageResize(
                withNodeImage(
                    withNodeHoverHitTest(withMindFragment(withMindHotkey(withMindExtend(withCreateMind(withAbstract(withNodeDnd(board)))))))
                )
            )
        )
    );
};

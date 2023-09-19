import {
    PlaitBoard,
    PlaitPluginElementContext,
    RectangleClient,
    toPoint,
    transformPoint,
    Transforms,
    Range,
    depthFirstRecursion,
    PlaitElement,
    getIsRecursionFunc
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
import { withNodeHoverDetect } from './with-node-hover-detect';
import { withNodeImage } from './with-node-image';
import { PlaitMindBoard } from './with-mind.board';
import { withNodeResize } from './with-node-resize';
import { withNodeImageResize } from './with-node-image-resize';
import { withMindFragment } from './with-mind-fragment';

export const withMind = (baseBoard: PlaitBoard) => {
    const board = baseBoard as PlaitBoard & PlaitMindBoard;
    const { drawElement, dblclick, isHitSelection, getRectangle, isMovable, isRecursion } = board;

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
        if (shouldClearProperty) {
            const path = PlaitBoard.findPath(board, element);
            Transforms.setNode(board, { fill: null, strokeColor: null, branchColor: null }, path);
        }
    };

    board.getRectangle = element => {
        if (MindElement.isMindElement(board, element)) {
            return getRectangleByNode(MindElement.getNode(element));
        }
        return getRectangle(element);
    };

    board.isRecursion = element => {
        if (MindElement.isMindElement(board, element) && element.isCollapsed) {
            return false;
        }
        return isRecursion(element);
    };

    board.isHitSelection = (element, range: Range) => {
        if (MindElement.isMindElement(board, element)) {
            const client = getRectangleByNode(MindElement.getNode(element));
            const isHit = RectangleClient.isHit(RectangleClient.toRectangleClient([range.anchor, range.focus]), client);
            return isHit;
        }
        return isHitSelection(element, range);
    };

    board.isMovable = element => {
        if (PlaitMind.isMind(element) && element.isRoot) {
            return true;
        }
        return isMovable(element);
    };

    board.dblclick = (event: MouseEvent) => {
        if (PlaitBoard.isReadonly(board)) {
            dblclick(event);
            return;
        }
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
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
        dblclick(event);
    };

    return withNodeResize(
        withNodeImageResize(
            withNodeImage(
                withNodeHoverDetect(withMindFragment(withMindHotkey(withMindExtend(withCreateMind(withAbstract(withNodeDnd(board)))))))
            )
        )
    );
};

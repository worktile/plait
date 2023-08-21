import {
    getSelectedElements,
    PlaitBoard,
    PlaitPluginElementContext,
    Point,
    RectangleClient,
    toPoint,
    transformPoint,
    Transforms,
    Range,
    depthFirstRecursion,
    PlaitElement,
    getIsRecursionFunc,
    getDataFromClipboard
} from '@plait/core';
import { MindElement, PlaitMind } from '../interfaces';
import { PlaitMindComponent } from '../mind.component';
import { MindNodeComponent } from '../node.component';
import { getFirstLevelElement } from '../utils';
import { getRectangleByNode, isHitMindElement } from '../utils/position/node';
import { withNodeDnd } from './with-node-dnd';
import { buildClipboardData, insertClipboardData, insertClipboardText, setMindClipboardData } from '../utils/clipboard';
import { editTopic, getSelectedMindElements } from '../utils/node/common';
import { withAbstract } from './with-abstract-resize';
import { withMindExtend } from './with-mind-extend';
import { withCreateMind } from './with-mind-create';
import { withMindHotkey } from './with-mind-hotkey';
import { withNodeHoverDetect } from './with-node-hover-detect';
import { buildText, getTextFromClipboard } from '@plait/text';
import { withNodeImage } from './with-node-image';
import { PlaitMindBoard } from './with-mind.board';
import { withNodeResize } from './with-node-resize';
import { withNodeImageResize } from './with-node-image-resize';

export const withMind = (baseBoard: PlaitBoard) => {
    const board = baseBoard as PlaitBoard & PlaitMindBoard;
    const { drawElement, dblclick, insertFragment, setFragment, isHitSelection, getRectangle, isMovable, isRecursion } = board;

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

    board.setFragment = (data: DataTransfer | null, rectangle: RectangleClient | null) => {
        const targetMindElements = getSelectedMindElements(board);
        const firstLevelElements = getFirstLevelElement(targetMindElements);
        if (firstLevelElements.length) {
            const elements = buildClipboardData(board, firstLevelElements, rectangle ? [rectangle.x, rectangle.y] : [0, 0]);
            setMindClipboardData(data, elements);
        }
        setFragment(data, rectangle);
    };

    board.insertFragment = (data: DataTransfer | null, targetPoint: Point) => {
        const elements = getDataFromClipboard(data);
        const mindElements = elements.filter(value => MindElement.isMindElement(board, value));
        if (elements.length > 0 && mindElements.length > 0) {
            insertClipboardData(board, mindElements, targetPoint);
        } else if (elements.length === 0) {
            const mindElements = getSelectedMindElements(board);
            if (mindElements.length === 1) {
                const text = getTextFromClipboard(data);
                if (text) {
                    insertClipboardText(board, mindElements[0], buildText(text));
                    return;
                }
            }
        }
        insertFragment(data, targetPoint);
    };

    return withNodeResize(
        withNodeImageResize(
            withNodeImage(withNodeHoverDetect(withMindHotkey(withMindExtend(withCreateMind(withAbstract(withNodeDnd(board)))))))
        )
    );
};

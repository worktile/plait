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
    PlaitElement
} from '@plait/core';
import { MindElement, PlaitMind } from '../interfaces';
import { PlaitMindComponent } from '../mind.component';
import { MindNodeComponent } from '../node.component';
import { getFirstLevelElement, deleteElementHandleAbstract, deleteElementsHandleRightNodeCount } from '../utils';
import { getRectangleByNode, isHitMindElement } from '../utils/position/node';
import { withNodeDnd } from './with-node-dnd';
import { buildClipboardData, getDataFromClipboard, insertClipboardData, insertClipboardText, setClipboardData } from '../utils/clipboard';
import { AbstractNode } from '@plait/layouts';
import { editTopic } from '../utils/node/common';
import { withAbstract } from './with-abstract-resize';
import { withMindExtend } from './with-mind-extend';
import { TOPIC_DEFAULT_MAX_WORD_COUNT } from '../constants/node-topic-style';
import { MindTransforms } from '../transforms';
import { withCreateMind } from './with-mind-create';
import { DefaultAbstractNodeStyle } from '../constants/node-style';
import { withMindHotkey } from './with-mind-hotkey';
import { withNodeHover } from './with-node-hover';
import { buildText, getTextFromClipboard, getTextSize } from '@plait/text';

export const withMind = (board: PlaitBoard) => {
    const {
        drawElement,
        dblclick,
        keydown,
        insertFragment,
        setFragment,
        deleteFragment,
        isHitSelection,
        getRectangle,
        isMovable,
        isRecursion
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
        const isAbstract = AbstractNode.isAbstract(element);
        if (shouldClearProperty) {
            const path = PlaitBoard.findPath(board, element);

            if (isAbstract) {
                Transforms.setNode(
                    board,
                    { fill: null, strokeColor: DefaultAbstractNodeStyle.strokeColor, branchColor: DefaultAbstractNodeStyle.branchColor },
                    path
                );
            } else {
                Transforms.setNode(board, { fill: null, strokeColor: null, branchColor: null }, path);
            }
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
                    node => {
                        if (PlaitBoard.isBoard(node) || board.isRecursion(node)) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                );
            });
        if (PlaitBoard.hasBeenTextEditing(board)) {
            return;
        }
        dblclick(event);
    };

    board.setFragment = (data: DataTransfer | null) => {
        const selectedElements = getFirstLevelElement(getSelectedElements(board) as MindElement[]);
        if (selectedElements.length) {
            const elements = buildClipboardData(board, selectedElements);
            setClipboardData(data, elements);
            return;
        }
        setFragment(data);
    };

    board.insertFragment = (data: DataTransfer | null, targetPoint?: Point) => {
        if (board.options.readonly) {
            insertFragment(data, targetPoint);
            return;
        }

        const elements = getDataFromClipboard(data);
        if (elements.length) {
            insertClipboardData(board, elements, targetPoint || [0, 0]);
        } else {
            const text = getTextFromClipboard(data);
            const { width, height } = getTextSize(board, text, TOPIC_DEFAULT_MAX_WORD_COUNT, {
                fontFamily: 'PingFangSC-Regular, "PingFang SC"'
            });
            const selectedElements = getSelectedElements(board);
            if (text && selectedElements.length === 1) {
                insertClipboardText(board, selectedElements[0], buildText(text), width, height);
            }
        }
        insertFragment(data, targetPoint);
    };

    board.deleteFragment = (data: DataTransfer | null) => {
        const selectedElements = getSelectedElements(board) as MindElement[];
        const deletableElements = getFirstLevelElement(selectedElements).reverse();
        const abstractRefs = deleteElementHandleAbstract(board, deletableElements);
        MindTransforms.setAbstractsByRefs(board, abstractRefs);

        const refs = deleteElementsHandleRightNodeCount(board, selectedElements);
        MindTransforms.setRightNodeCountByRefs(board, refs);

        MindTransforms.removeElements(board, selectedElements);
        deleteFragment(data);
    };

    return withNodeHover(withMindHotkey(withMindExtend(withCreateMind(withAbstract(withNodeDnd(board))))));
};

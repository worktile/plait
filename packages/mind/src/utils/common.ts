import { getI18nValue, PlaitBoard } from '@plait/core';
import { MindI18nKey } from '../constants/default';
import { ROOT_TOPIC_FONT_SIZE, TOPIC_DEFAULT_MAX_WORD_COUNT, TOPIC_FONT_SIZE } from '../constants';
import { DEFAULT_FONT_FAMILY, measureElement, ParagraphElement } from '@plait/common';

export const MIND_CENTRAL_TEXT = '中心主题';

export const ABSTRACT_NODE_TEXT = '概要';

export const getDefaultMindNameText = (board: PlaitBoard) => {
    return getI18nValue(board, MindI18nKey.mindCentralText, MIND_CENTRAL_TEXT);
};

export const getAbstractNodeText = (board: PlaitBoard) => {
    return getI18nValue(board, MindI18nKey.abstractNodeText, ABSTRACT_NODE_TEXT);
};

export const getTopicSize = (board: PlaitBoard, isRoot: boolean, isBranch: boolean, topic: ParagraphElement, manualWidth?: number) => {
    let fontFamily = DEFAULT_FONT_FAMILY;
    let fontSize = TOPIC_FONT_SIZE;
    if (isRoot) {
        fontFamily = DEFAULT_FONT_FAMILY;
        fontSize = ROOT_TOPIC_FONT_SIZE;
    } else if (isBranch) {
        fontFamily = DEFAULT_FONT_FAMILY;
    }
    const maxWidth = fontSize * TOPIC_DEFAULT_MAX_WORD_COUNT;
    return measureElement(board, topic, { fontSize, fontFamily }, manualWidth ? manualWidth : maxWidth);
};

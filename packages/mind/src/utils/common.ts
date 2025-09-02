import { getI18nValue, PlaitBoard } from '@plait/core';
import { MindI18nKey } from '../constants/default';

export const MIND_CENTRAL_TEXT = '中心主题';

export const ABSTRACT_NODE_TEXT = '概要';

export const getDefaultMindNameText = (board: PlaitBoard) => {
    return getI18nValue(board, MindI18nKey.mindCentralText, MIND_CENTRAL_TEXT);
};

export const getAbstractNodeText = (board: PlaitBoard) => {
    return getI18nValue(board, MindI18nKey.abstractNodeText, ABSTRACT_NODE_TEXT);
};

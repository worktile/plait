import { PlaitBoard } from '@plait/core';
import { MindElement } from '../../interfaces/element';
import { getFirstTextManage } from '@plait/common';

/**
 * 1. return new node height if height changed
 * 2. new height is effected by zoom
 */
export const getNewNodeHeight = (board: PlaitBoard, element: MindElement, newNodeDynamicWidth: number) => {
    const textManage = getFirstTextManage(element);
    const { height } = textManage.getSize(undefined, newNodeDynamicWidth);
    if (Math.abs(height - element.height) > 2) {
        return height;
    }
    return undefined;
};

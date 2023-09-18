import { PlaitBoard, PlaitElement } from '@plait/core';
import { MindElement } from '../../interfaces/element';
import { MindNodeComponent } from '../../mind-node.component';

/**
 * 1. return new node height if height changed
 * 2. new height is effected by zoom
 */
export const getNewNodeHeight = (board: PlaitBoard, element: MindElement, newNodeDynamicWidth: number) => {
    const textManage = (PlaitElement.getComponent(element) as MindNodeComponent).textManage;
    const { height } = textManage.getSize();
    textManage.updateRectangleWidth(newNodeDynamicWidth);
    const { height: newHeight } = textManage.getSize();

    if (height !== newHeight) {
        return newHeight;
    }

    if (Math.abs(newHeight / board.viewport.zoom - element.height) > 2) {
        return newHeight;
    }

    return undefined;
};

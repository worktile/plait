import { PlaitBoard, PlaitElement } from "@plait/core";
import { MindElement } from "../../interfaces/element";
import { MindNodeComponent } from "../../node.component";

/**
 * 1. return new node height if height changed
 * 2. new height is effected by zoom
 */
export const getNewNodeHeight = (board: PlaitBoard, element: MindElement, newNodeDynamicWidth: number) => {
    const textManage = (PlaitElement.getComponent(element) as MindNodeComponent).textManage;
    const { height } = textManage.getSize();
    textManage.updateWidth(newNodeDynamicWidth);
    const { height: newHeight } = textManage.getSize();
    if (!element.manualWidth) {
        textManage.updateWidth(0);
    }
    if (height !== newHeight) {
        return newHeight;
    }
    return undefined;
}

import { PlaitBoard, Path, PlaitNode, Transforms } from '@plait/core';
import { isHorizontalLogicLayout, isVerticalLogicLayout, MindmapLayoutType } from '@plait/layouts';

export const setMindmapLayout = (board: PlaitBoard, layout: MindmapLayoutType, path: Path) => {
    correctLogicLayoutNode(board, layout, path);
    Transforms.setNode(board, { layout }, path);
};

const correctLogicLayoutNode = (board: PlaitBoard, layout: MindmapLayoutType, path: Path) => {
    const node = PlaitNode.get(board, path);
    if (node && layout) {
        node.children?.forEach((value: PlaitNode, index) => {
            if (value.layout) {
                if (
                    (isHorizontalLogicLayout(layout) && isVerticalLogicLayout(value.layout)) ||
                    (isVerticalLogicLayout(layout) && isHorizontalLogicLayout(value.layout))
                ) {
                    Transforms.setNode(board, { layout: null }, [...path, index]);
                }
                if (value.children?.length) {
                    correctLogicLayoutNode(board, layout, [...path, index]);
                }
            }
        });
    }
};

import { PlaitBoard, Path, PlaitNode, Transforms } from '@plait/core';
import { isIndentedLayout, isLogicLayout, MindmapLayoutType } from '@plait/layouts';
import { getAvailableSubLayoutsByLayoutDirections, getBranchDirectionsByLayouts } from '../utils';

export const setMindmapLayout = (board: PlaitBoard, layout: MindmapLayoutType, path: Path) => {
    correctLogicLayoutNode(board, layout, path);
    Transforms.setNode(board, { layout }, path);
};

const correctLogicLayoutNode = (board: PlaitBoard, layout: MindmapLayoutType, path: Path) => {
    const node = PlaitNode.get(board, path);
    if (node && !isIndentedLayout(layout)) {
        let mindmapLayout = layout;
        if (mindmapLayout === MindmapLayoutType.standard) {
            mindmapLayout = MindmapLayoutType.right;
        }
        const branchLayouts = getBranchDirectionsByLayouts([mindmapLayout]);
        const availableSubLayouts = getAvailableSubLayoutsByLayoutDirections(branchLayouts);
        node.children?.forEach((value: PlaitNode, index) => {
            // 只修正不合法的逻辑布局
            if (value.layout && isLogicLayout(value.layout)) {
                if (availableSubLayouts.length && availableSubLayouts.findIndex(item => item === value.layout) < 0) {
                    Transforms.setNode(board, { layout: null }, [...path, index]);
                }
            }
            if (value.children?.length) {
                correctLogicLayoutNode(board, layout, [...path, index]);
            }
        });
    }
};

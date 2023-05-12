import { PlaitBoard, Path, PlaitNode, Transforms } from '@plait/core';
import { isHorizontalLogicLayout, isStandardLayout, isVerticalLogicLayout, MindLayoutType } from '@plait/layouts';
import { MindElement, PlaitMind } from '../interfaces/element';
import { handleAbstractIncluded } from '../utils/abstract/common';

export const setLayout = (board: PlaitBoard, layout: MindLayoutType, path: Path) => {
    correctLogicLayoutNode(board, layout, path);
    const element = PlaitNode.get(board, path) as MindElement;

    if (PlaitMind.isMind(element) && isStandardLayout(layout)) {
        handleAbstractIncluded(board, element);
    }

    Transforms.setNode(board, { layout }, path);
};

const correctLogicLayoutNode = (board: PlaitBoard, layout: MindLayoutType, path: Path) => {
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

import { Path, PlaitBoard, PlaitNode, Transforms } from '@plait/core';
import { MindLayoutType, isStandardLayout } from '@plait/layouts';
import { PropertyTransforms } from '@plait/common';
import { BranchShape, MindElementShape, MindElement, PlaitMind } from '../interfaces';
import { correctLogicLayoutNode } from './layout';
import { setAbstractByStandardLayout } from './abstract-node';

export const setLayout = (board: PlaitBoard, type: MindLayoutType) => {
    const callback = (element: MindElement, path: Path) => {
        if (MindElement.isMindElement(board, element)) {
            correctLogicLayoutNode(board, type, path);
            const element = PlaitNode.get(board, path) as MindElement;
            if (PlaitMind.isMind(element) && isStandardLayout(type)) {
                let properties = { rightNodeCount: element.children.length / 2 };
                Transforms.setNode(board, properties, path);
                setAbstractByStandardLayout(board, element);
            }
            Transforms.setNode(board, { layout: type }, path);
        }
    };
    PropertyTransforms.setProperty<MindElement>(board, {}, { callback });
};

export const setShape = (board: PlaitBoard, shape: MindElementShape) => {
    PropertyTransforms.setProperty(board, { shape });
};

export const setBranchShape = (board: PlaitBoard, branchShape: BranchShape) => {
    PropertyTransforms.setProperty(board, { branchShape });
};

export const setBranchWidth = (board: PlaitBoard, branchWidth: number) => {
    PropertyTransforms.setProperty(board, { branchWidth });
};

export const setBranchColor = (board: PlaitBoard, branchColor: string) => {
    PropertyTransforms.setProperty(board, { branchColor });
};

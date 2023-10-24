import { Path, PlaitBoard, PlaitPluginElementComponent, Transforms } from '@plait/core';
import { MindLayoutType } from '@plait/layouts';
import { PropertyTransforms } from '@plait/common';
import { MindTransforms } from '.';
import { PlaitMindComponent } from '../mind.component';
import { BranchShape, MindElementShape } from '../interfaces';

const setLayout = (board: PlaitBoard, type: MindLayoutType) => {
    const setAllLayout = (component: PlaitPluginElementComponent, path: Path) => {
        let rightNodeCount: { rightNodeCount?: number } = {};
        if (type === MindLayoutType.standard) {
            rightNodeCount = { rightNodeCount: Math.ceil((component as PlaitMindComponent).node.children.length / 2) };
        }
        MindTransforms.setLayout(board, type, path);
        Transforms.setNode(board, rightNodeCount, path);
    };
    PropertyTransforms.setProperty(board, {}, setAllLayout);
};

const setShape = (board: PlaitBoard, shape: MindElementShape) => {
    PropertyTransforms.setProperty(board, { shape });
};

const setBranchShape = (board: PlaitBoard, branchShape: BranchShape) => {
    PropertyTransforms.setProperty(board, { branchShape });
};

const setBranchWidth = (board: PlaitBoard, branchWidth: number) => {
    PropertyTransforms.setProperty(board, { branchWidth });
};

const setBranchColor = (board: PlaitBoard, branchColor: string) => {
    PropertyTransforms.setProperty(board, { branchColor });
};

export const MindPropertyTransforms = {
    setBranchColor,
    setBranchWidth,
    setBranchShape,
    setShape,
    setLayout
};

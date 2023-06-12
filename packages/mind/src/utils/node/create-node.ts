import { PlaitBoard, Point, idCreator, isNullOrUndefined } from '@plait/core';
import { ROOT_DEFAULT_HEIGHT, TEXT_DEFAULT_HEIGHT } from '@plait/richtext';
import { MindLayoutType } from '@plait/layouts';
import { BranchShape, MindElement, MindElementShape } from '../../interfaces/element';
import { adjustNodeToRoot } from './adjust-node';

export const createEmptyMind = (board: PlaitBoard, point: Point) => {
    const element = createMindElement('', 0, 0, { layout: MindLayoutType.right });
    const rootElement = adjustNodeToRoot(board, element);
    rootElement.points = [point];
    return rootElement;
};

export const createDefaultMind = (point: Point, rightNodeCount: number, layout: MindLayoutType) => {
    const root = createMindElement('思维导图', 72, ROOT_DEFAULT_HEIGHT, { layout });
    root.rightNodeCount = rightNodeCount;
    root.isRoot = true;
    root.type = 'mindmap';
    root.points = [point];
    const children = [1, 1, 1].map(() => {
        return createMindElement('新建节点', 56, TEXT_DEFAULT_HEIGHT, {});
    });
    root.children = children;
    return root;
};

export const createMindElement = (text: string, width: number, height: number, options: InheritAttribute) => {
    const newElement: MindElement = {
        id: idCreator(),
        data: {
            topic: { children: [{ text }] }
        },
        children: [],
        width,
        height
    };

    let key: keyof typeof options;
    for (key in options) {
        if (!isNullOrUndefined(options[key])) {
            (newElement as any)[key] = options[key];
        }
    }

    return newElement;
};

export interface InheritAttribute {
    fill?: string;
    strokeColor?: string;
    strokeWidth?: number;
    shape?: MindElementShape;
    layout?: MindLayoutType;
    branchColor?: string;
    branchWidth?: number;
    branchShape?: BranchShape;
}

import { PlaitBoard, Point, idCreator, isNullOrUndefined } from '@plait/core';
import { MindLayoutType } from '@plait/layouts';
import { BranchShape, MindElement, MindElementShape } from '../../interfaces/element';
import { ROOT_TOPIC_HEIGHT, ROOT_TOPIC_WIDTH } from '../../constants/node-topic-style';
import { Element } from 'slate';
import { NodeSpace } from '../space';
import { PlaitMindBoard } from '../../plugins/with-mind.board';
import { buildText } from '@plait/common';
import { TEXT_DEFAULT_HEIGHT } from '@plait/text-plugins';

export const createEmptyMind = (board: PlaitBoard, point: Point) => {
    const element = createMindElement('思维导图', ROOT_TOPIC_WIDTH, ROOT_TOPIC_HEIGHT, { layout: MindLayoutType.right });
    element.isRoot = true;
    element.type = 'mindmap';
    const width = NodeSpace.getNodeWidth(board as PlaitMindBoard, element);
    const height = NodeSpace.getNodeHeight(board as PlaitMindBoard, element);
    element.points = [[point[0] - width / 2, point[1] - height / 2]];
    return element;
};

export const createDefaultMind = (point: Point, rightNodeCount: number, layout: MindLayoutType) => {
    const root = createMindElement('思维导图', ROOT_TOPIC_WIDTH, ROOT_TOPIC_HEIGHT, { layout });
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

export const createMindElement = (text: string | Element, width: number, height: number, options: InheritAttribute) => {
    const newElement: MindElement = {
        id: idCreator(),
        data: {
            topic: buildText(text)
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

export const INHERIT_ATTRIBUTE_KEYS = [
    'fill',
    'strokeColor',
    'strokeWidth',
    'shape',
    'layout',
    'branchColor',
    'branchWidth',
    'branchShape'
];
